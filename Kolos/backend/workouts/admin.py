from django.contrib import admin
from .models import (
    BodyPart, Exercise,
    Workout, WorkoutExercise, ExerciseSet,
    WorkoutPlan, WorkoutPlanItem,
)

admin.site.register(BodyPart)
admin.site.register(Exercise)
admin.site.register(Workout)
admin.site.register(WorkoutExercise)
admin.site.register(ExerciseSet)
admin.site.register(WorkoutPlan)
admin.site.register(WorkoutPlanItem)
