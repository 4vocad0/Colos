from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from config.permissions import IsOwnerOrReadOnly, is_active_trainer

from .models import (
    BodyPart, Exercise,
    Workout, WorkoutExercise, ExerciseSet,
    WorkoutPlan, WorkoutPlanItem,
)
from .serializers import (
    BodyPartSerializer, ExerciseSerializer,
    WorkoutSerializer, WorkoutPlanSerializer,
)

User = get_user_model()


class BodyPartViewSet(viewsets.ModelViewSet):
    queryset = BodyPart.objects.all().order_by("name")
    serializer_class = BodyPartSerializer
    permission_classes = [IsAuthenticated]


class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    # Brak pola author → IsOwnerOrReadOnly blokowałoby edycję wszystkim
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()


# ==========================================
# Wspólna funkcja: głęboka kopia Workoutu
# ==========================================
def _copy_workout(original, creator, assigned_to=None):
    new_workout = Workout.objects.create(
        creator=creator,
        assigned_to=assigned_to,
        copied_from=original,
        name=original.name,
        notes=original.notes,
        is_public=False,
    )
    for we in original.exercises.all():
        new_we = WorkoutExercise.objects.create(
            workout=new_workout, exercise=we.exercise, order_index=we.order_index
        )
        for s in we.sets.all():
            ExerciseSet.objects.create(
                workout_exercise=new_we,
                set_number=s.set_number,
                reps=s.reps,
                weight_kg=s.weight_kg,
                duration_seconds=s.duration_seconds,
            )
    return new_workout


class WorkoutViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_permissions(self):
        # Kopiowanie tworzy NOWY obiekt (nie modyfikuje oryginału), więc nie
        # wymaga bycia właścicielem — widoczność oryginału i tak pilnuje get_queryset.
        if self.action == 'copy':
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        return (
            Workout.objects
            .filter(Q(creator=user) | Q(assigned_to=user) | Q(is_public=True))
            .distinct()
            .prefetch_related('exercises__sets', 'exercises__exercise')
        )

    def perform_create(self, serializer):
        workout = serializer.save(creator=self.request.user)
        # Własny, natychmiast wykonywany trening startuje od razu.
        # Trening wysłany komuś innemu zostaje PLANNED, bez started_at.
        if workout.assigned_to in (None, self.request.user):
            workout.started_at = timezone.now()
            workout.save(update_fields=['started_at'])

    @action(detail=True, methods=['post'])
    def copy(self, request, pk=None):
        original = self.get_object()  # get_queryset już pilnuje widoczności

        assigned_to = None
        assigned_to_id = request.data.get('assigned_to')
        if assigned_to_id:
            assigned_to = get_object_or_404(User, pk=assigned_to_id)
            if not is_active_trainer(request.user, assigned_to):
                return Response(
                    {"assigned_to": "Możesz wysłać to tylko do swojego aktywnego podopiecznego."},
                    status=400,
                )

        new_workout = _copy_workout(original, creator=request.user, assigned_to=assigned_to)
        return Response(WorkoutSerializer(new_workout).data, status=201)


class WorkoutPlanViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutPlanSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_permissions(self):
        if self.action == 'copy':
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        return (
            WorkoutPlan.objects
            .filter(Q(creator=user) | Q(assigned_to=user) | Q(is_public=True))
            .distinct()
            .prefetch_related('items__workout')
        )

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post'])
    def copy(self, request, pk=None):
        original_plan = self.get_object()

        assigned_to = None
        assigned_to_id = request.data.get('assigned_to')
        if assigned_to_id:
            assigned_to = get_object_or_404(User, pk=assigned_to_id)
            if not is_active_trainer(request.user, assigned_to):
                return Response(
                    {"assigned_to": "Możesz wysłać to tylko do swojego aktywnego podopiecznego."},
                    status=400,
                )

        new_plan = WorkoutPlan.objects.create(
            creator=request.user,
            assigned_to=assigned_to,
            copied_from=original_plan,
            name=original_plan.name,
            description=original_plan.description,
            is_public=False,
        )
        for item in original_plan.items.all():
            # Każdy Workout w planie jest kopiowany osobno, żeby kopia planu
            # była w pełni niezależna (każdy podopieczny ma swoje własne sesje).
            new_workout = _copy_workout(item.workout, creator=request.user, assigned_to=assigned_to)
            WorkoutPlanItem.objects.create(
                plan=new_plan, workout=new_workout,
                order_index=item.order_index, label=item.label,
            )

        return Response(WorkoutPlanSerializer(new_plan).data, status=201)
