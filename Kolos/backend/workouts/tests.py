from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import TrainerTrainee
from .models import BodyPart, Exercise, Workout, WorkoutPlan

User = get_user_model()


class WorkoutApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alice', password='pass12345')
        self.trainer = User.objects.create_user(username='coach', password='pass12345')
        self.trainee = User.objects.create_user(username='bob', password='pass12345')
        self.stranger = User.objects.create_user(username='eve', password='pass12345')

        TrainerTrainee.objects.create(
            trainer=self.trainer, trainee=self.trainee, status=TrainerTrainee.Status.ACTIVE
        )

        self.chest = BodyPart.objects.create(name='Chest')
        self.core = BodyPart.objects.create(name='Core')
        self.bench = Exercise.objects.create(name='Bench Press', type=Exercise.Type.WEIGHTED, primary=self.chest)
        self.plank = Exercise.objects.create(name='Plank', type=Exercise.Type.TIMED, primary=self.core)

    def _mixed_payload(self, name="Push Day"):
        return {
            "name": name,
            "is_public": True,
            "exercises": [
                {
                    "exercise": self.bench.id,
                    "order_index": 1,
                    "sets": [
                        {"set_number": 1, "reps": 8, "weight_kg": 60},
                        {"set_number": 2, "reps": 8, "weight_kg": 60},
                    ],
                },
                {
                    "exercise": self.plank.id,
                    "order_index": 2,
                    "sets": [{"set_number": 1, "duration_seconds": 60}],
                },
            ],
        }

    def test_create_workout_with_mixed_exercise_types(self):
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/workouts/workouts/', self._mixed_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        workout = Workout.objects.get(id=response.data['id'])
        self.assertEqual(workout.creator, self.user)
        self.assertIsNotNone(workout.started_at)  # własny trening startuje od razu
        self.assertEqual(workout.exercises.count(), 2)

        bench_exercise = workout.exercises.get(exercise=self.bench)
        self.assertEqual(bench_exercise.sets.count(), 2)
        self.assertEqual(bench_exercise.sets.first().weight_kg, 60)

        plank_exercise = workout.exercises.get(exercise=self.plank)
        self.assertEqual(plank_exercise.sets.first().duration_seconds, 60)

    def test_weighted_exercise_requires_weight_and_reps(self):
        self.client.force_authenticate(self.user)
        payload = {
            "name": "Bad Workout",
            "exercises": [
                {"exercise": self.bench.id, "order_index": 1, "sets": [{"set_number": 1, "reps": 8}]},
            ],
        }
        response = self.client.post('/api/workouts/workouts/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_trainer_can_send_workout_to_active_trainee(self):
        self.client.force_authenticate(self.trainer)
        payload = self._mixed_payload("Sent by trainer")
        payload["assigned_to"] = self.trainee.id

        response = self.client.post('/api/workouts/workouts/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        workout = Workout.objects.get(id=response.data['id'])
        self.assertEqual(workout.creator, self.trainer)
        self.assertEqual(workout.assigned_to, self.trainee)
        self.assertIsNone(workout.started_at)  # nie zaczęte przez odbiorcę

    def test_cannot_send_workout_to_non_trainee(self):
        self.client.force_authenticate(self.trainer)
        payload = self._mixed_payload()
        payload["assigned_to"] = self.stranger.id

        response = self.client.post('/api/workouts/workouts/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_trainee_sees_assigned_workout_but_stranger_does_not(self):
        self.client.force_authenticate(self.trainer)
        payload = self._mixed_payload()
        payload["assigned_to"] = self.trainee.id
        payload["is_public"] = False  # ważne: inaczej każdy by to widział przez is_public
        created = self.client.post('/api/workouts/workouts/', payload, format='json')
        workout_id = created.data['id']

        self.client.force_authenticate(self.trainee)
        self.assertEqual(self.client.get(f'/api/workouts/workouts/{workout_id}/').status_code, 200)

        self.client.force_authenticate(self.stranger)
        self.assertEqual(self.client.get(f'/api/workouts/workouts/{workout_id}/').status_code, 404)

    def test_copy_workout_creates_independent_deep_copy(self):
        self.client.force_authenticate(self.user)
        created = self.client.post('/api/workouts/workouts/', self._mixed_payload(), format='json')
        original_id = created.data['id']

        self.client.force_authenticate(self.trainee)
        # trainee robi trening publicznym więc widzi go i może skopiować
        original = Workout.objects.get(id=original_id)
        original.is_public = True
        original.save(update_fields=['is_public'])

        response = self.client.post(f'/api/workouts/workouts/{original_id}/copy/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

        copy = Workout.objects.get(id=response.data['id'])
        self.assertEqual(copy.creator, self.trainee)
        self.assertEqual(copy.copied_from_id, original_id)
        self.assertEqual(copy.exercises.count(), 2)

        # niezależność: zmiana kopii nie rusza oryginału
        copy_bench = copy.exercises.get(exercise=self.bench)
        copy_bench.sets.first().weight_kg = 999
        copy_bench.sets.first().save()
        original_bench = Workout.objects.get(id=original_id).exercises.get(exercise=self.bench)
        self.assertEqual(original_bench.sets.first().weight_kg, 60)

    def test_copy_workout_with_assigned_to_requires_active_trainer(self):
        self.client.force_authenticate(self.user)
        created = self.client.post('/api/workouts/workouts/', self._mixed_payload(), format='json')
        original_id = created.data['id']
        Workout.objects.filter(id=original_id).update(is_public=True)

        # trainer (nie jest trenerem `self.user`, ale to nieistotne - liczy się relacja z odbiorcą)
        self.client.force_authenticate(self.trainer)
        response = self.client.post(
            f'/api/workouts/workouts/{original_id}/copy/',
            {"assigned_to": self.stranger.id},
            format='json',
        )
        self.assertEqual(response.status_code, 400)

        response_ok = self.client.post(
            f'/api/workouts/workouts/{original_id}/copy/',
            {"assigned_to": self.trainee.id},
            format='json',
        )
        self.assertEqual(response_ok.status_code, status.HTTP_201_CREATED, response_ok.data)
        self.assertEqual(response_ok.data['assigned_to'], self.trainee.id)


class WorkoutPlanApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alice2', password='pass12345')
        self.trainer = User.objects.create_user(username='coach2', password='pass12345')
        self.trainee = User.objects.create_user(username='bob2', password='pass12345')

        TrainerTrainee.objects.create(
            trainer=self.trainer, trainee=self.trainee, status=TrainerTrainee.Status.ACTIVE
        )

        self.chest = BodyPart.objects.create(name='Chest2')
        self.bench = Exercise.objects.create(name='Bench2', type=Exercise.Type.WEIGHTED, primary=self.chest)

        self.client.force_authenticate(self.user)
        workout_payload = {
            "name": "Day A",
            "exercises": [
                {
                    "exercise": self.bench.id,
                    "order_index": 1,
                    "sets": [{"set_number": 1, "reps": 5, "weight_kg": 100}],
                },
            ],
        }
        self.workout = Workout.objects.get(
            id=self.client.post('/api/workouts/workouts/', workout_payload, format='json').data['id']
        )

    def test_create_plan_with_items(self):
        payload = {
            "name": "PPL",
            "items": [{"workout": self.workout.id, "order_index": 1, "label": "Dzien A"}],
        }
        response = self.client.post('/api/workouts/plans/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

        plan = WorkoutPlan.objects.get(id=response.data['id'])
        self.assertEqual(plan.items.count(), 1)
        self.assertEqual(plan.items.first().workout, self.workout)

    def test_copy_plan_deep_copies_workouts(self):
        payload = {
            "name": "PPL",
            "is_public": True,
            "items": [{"workout": self.workout.id, "order_index": 1, "label": "Dzien A"}],
        }
        plan_id = self.client.post('/api/workouts/plans/', payload, format='json').data['id']

        self.client.force_authenticate(self.trainee)
        response = self.client.post(f'/api/workouts/plans/{plan_id}/copy/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

        new_plan = WorkoutPlan.objects.get(id=response.data['id'])
        self.assertEqual(new_plan.creator, self.trainee)
        self.assertEqual(new_plan.items.count(), 1)
        new_workout = new_plan.items.first().workout
        self.assertNotEqual(new_workout.id, self.workout.id)  # to kopia, nie ten sam rekord
        self.assertEqual(new_workout.creator, self.trainee)

    def test_send_plan_to_trainee_sends_deep_copies_assigned_to_trainee(self):
        payload = {
            "name": "PPL",
            "items": [{"workout": self.workout.id, "order_index": 1, "label": "Dzien A"}],
        }
        plan_id = self.client.post('/api/workouts/plans/', payload, format='json').data['id']

        response = self.client.post(
            f'/api/workouts/plans/{plan_id}/copy/', {"assigned_to": self.trainee.id}, format='json'
        )
        # self.user nie jest trenerem `trainee` -> odrzucone
        self.assertEqual(response.status_code, 400)

        self.client.force_authenticate(self.trainer)
        plan2_id = self.client.post('/api/workouts/plans/', payload, format='json').data['id']
        response_ok = self.client.post(
            f'/api/workouts/plans/{plan2_id}/copy/', {"assigned_to": self.trainee.id}, format='json'
        )
        self.assertEqual(response_ok.status_code, status.HTTP_201_CREATED, response_ok.data)
        new_workout = WorkoutPlan.objects.get(id=response_ok.data['id']).items.first().workout
        self.assertEqual(new_workout.assigned_to, self.trainee)
