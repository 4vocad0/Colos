from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BodyPartViewSet, ExerciseViewSet,
    WorkoutViewSet, WorkoutPlanViewSet,
)

router = DefaultRouter()
router.register(r'body-parts', BodyPartViewSet)
router.register(r'exercises', ExerciseViewSet)
router.register(r'workouts', WorkoutViewSet, basename='workout')
router.register(r'plans', WorkoutPlanViewSet, basename='workoutplan')

urlpatterns = [
    path('', include(router.urls)),
]
