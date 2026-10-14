from django.db import models
from django.conf import settings

class BodyPart(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


# ==========================================
# 1. BIBLIOTEKA ĆWICZEŃ (Słownik)
# ==========================================
class Exercise(models.Model):
    class Type(models.TextChoices):
        WEIGHTED = 'WEIGHTED', 'Weighted'
        BODY_WEIGHTED = 'BODY_WEIGHTED', 'BodyWeighted'
        TIMED = 'TIMED', 'Timed'
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.WEIGHTED)
    primary = models.ForeignKey(BodyPart, on_delete=models.PROTECT, related_name='primary_exercises')
    secondary = models.ForeignKey(BodyPart, on_delete=models.PROTECT, related_name='secondary_exercises', blank=True, null=True)
    link_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


# ==========================================
# 2. SESJE TRENINGOWE (Workout)
# ==========================================
class Workout(models.Model):
    class Status(models.TextChoices):
        PLANNED = 'PLANNED', 'Zaplanowany'
        IN_PROGRESS = 'IN_PROGRESS', 'W trakcie'
        COMPLETED = 'COMPLETED', 'Zakończony'

    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_workouts')
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_workouts',
        help_text="Dla kogo jest ten trening. Puste = własny trening twórcy."
    )
    copied_from = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='copies',
        help_text="Oryginał, z którego skopiowano ten trening"
    )
    name = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNED)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(blank=True, null=True)
    finished_at = models.DateTimeField(blank=True, null=True, help_text="Puste oznacza, że trening wciąż trwa")
    is_public = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name or 'Trening'} ({self.creator.username})"


class WorkoutExercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.PROTECT)
    order_index = models.PositiveIntegerField()

    class Meta:
        ordering = ['order_index']

    def __str__(self):
        return f"{self.workout} - {self.exercise.name}"


class ExerciseSet(models.Model):
    workout_exercise = models.ForeignKey(WorkoutExercise, on_delete=models.CASCADE, related_name='sets')
    set_number = models.PositiveIntegerField()

    # Weighted + BodyWeighted
    reps = models.PositiveIntegerField(blank=True, null=True)
    # Weighted
    weight_kg = models.FloatField(blank=True, null=True)
    # Timed
    duration_seconds = models.PositiveIntegerField(blank=True, null=True)

    class Meta:
        ordering = ['set_number']

    def __str__(self):
        return f"{self.workout_exercise.exercise.name} - Seria {self.set_number}"


# ==========================================
# 3. PLANY TRENINGOWE (grupują wiele Workoutów)
# ==========================================
class WorkoutPlan(models.Model):
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_plans')
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_plans',
        help_text="Dla kogo jest ten plan. Puste = własny plan twórcy."
    )
    copied_from = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='copies',
        help_text="Oryginał, z którego skopiowano ten plan"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class WorkoutPlanItem(models.Model):
    plan = models.ForeignKey(WorkoutPlan, on_delete=models.CASCADE, related_name='items')
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name='plan_items')
    order_index = models.PositiveIntegerField(help_text="Kolejność w planie, np. Dzień 1, Dzień 2")
    label = models.CharField(max_length=100, blank=True, help_text="Np. 'Dzień A - Push'")

    class Meta:
        ordering = ['order_index']

    def __str__(self):
        return f"{self.plan.name} - {self.label or self.workout.name}"
