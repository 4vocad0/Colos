from rest_framework import serializers
from config.permissions import is_active_trainer
from .models import (
    BodyPart, Exercise,
    Workout, WorkoutExercise, ExerciseSet,
    WorkoutPlan, WorkoutPlanItem,
)


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'

    def _is_admin(self, user):
        return (
            getattr(user, "role", None) == "ADMIN"
            or user.is_staff
            or user.is_superuser
        )

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user

        if "link_url" in attrs and attrs.get("link_url") and not self._is_admin(user):
            raise serializers.ValidationError({
                "link_url": "Only admins can set the link_url field."
            })
        return attrs


class BodyPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyPart
        fields = '__all__'


# ==========================================
# Workout (sesja treningowa)
# ==========================================
class ExerciseSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseSet
        fields = ["id", "set_number", "reps", "weight_kg", "duration_seconds"]


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    sets = ExerciseSetSerializer(many=True)

    class Meta:
        model = WorkoutExercise
        fields = ["id", "exercise", "order_index", "sets"]

    def validate(self, attrs):
        exercise = attrs.get("exercise")
        sets = attrs.get("sets") or []

        for set_data in sets:
            if exercise.type == Exercise.Type.WEIGHTED:
                if set_data.get("reps") is None or set_data.get("weight_kg") is None:
                    raise serializers.ValidationError(
                        f"Ćwiczenie '{exercise.name}' (Weighted) wymaga reps i weight_kg w każdej serii."
                    )
            elif exercise.type == Exercise.Type.BODY_WEIGHTED:
                if set_data.get("reps") is None:
                    raise serializers.ValidationError(
                        f"Ćwiczenie '{exercise.name}' (BodyWeighted) wymaga reps w każdej serii."
                    )
            elif exercise.type == Exercise.Type.TIMED:
                if set_data.get("duration_seconds") is None:
                    raise serializers.ValidationError(
                        f"Ćwiczenie '{exercise.name}' (Timed) wymaga duration_seconds w każdej serii."
                    )
        return attrs


class WorkoutSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True)

    class Meta:
        model = Workout
        fields = [
            "id", "creator", "assigned_to", "copied_from", "name", "notes",
            "status", "created_at", "started_at", "finished_at", "is_public", "exercises",
        ]
        read_only_fields = ["creator", "copied_from", "created_at", "started_at"]

    def validate(self, attrs):
        request = self.context["request"]
        assigned_to = attrs.get("assigned_to")

        if assigned_to and not is_active_trainer(request.user, assigned_to):
            raise serializers.ValidationError({
                "assigned_to": "Możesz wysłać trening tylko do swojego aktywnego podopiecznego."
            })
        return attrs

    def create(self, validated_data):
        exercises_data = validated_data.pop("exercises")
        workout = Workout.objects.create(**validated_data)

        for exercise_data in exercises_data:
            sets_data = exercise_data.pop("sets")
            workout_exercise = WorkoutExercise.objects.create(workout=workout, **exercise_data)
            for set_data in sets_data:
                ExerciseSet.objects.create(workout_exercise=workout_exercise, **set_data)

        return workout

    def update(self, instance, validated_data):
        # Edycja listy ćwiczeń/serii nie jest jeszcze obsługiwana przez PATCH/PUT —
        # na razie pozwalamy edytować tylko pola samego Workoutu (np. status, notes).
        validated_data.pop("exercises", None)
        return super().update(instance, validated_data)


# ==========================================
# WorkoutPlan (grupuje wiele Workoutów)
# ==========================================
class WorkoutPlanItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutPlanItem
        fields = ["id", "workout", "order_index", "label"]


class WorkoutPlanSerializer(serializers.ModelSerializer):
    items = WorkoutPlanItemSerializer(many=True, required=False)

    class Meta:
        model = WorkoutPlan
        fields = [
            "id", "creator", "assigned_to", "copied_from",
            "name", "description", "is_public", "created_at", "items",
        ]
        read_only_fields = ["creator", "copied_from", "created_at"]

    def validate(self, attrs):
        request = self.context["request"]
        assigned_to = attrs.get("assigned_to")

        if assigned_to and not is_active_trainer(request.user, assigned_to):
            raise serializers.ValidationError({
                "assigned_to": "Możesz wysłać plan tylko do swojego aktywnego podopiecznego."
            })
        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        plan = WorkoutPlan.objects.create(**validated_data)

        for item_data in items_data:
            WorkoutPlanItem.objects.create(plan=plan, **item_data)

        return plan

    def update(self, instance, validated_data):
        validated_data.pop("items", None)
        return super().update(instance, validated_data)
