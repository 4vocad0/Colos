from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Dziedziczymy: username, email, password, first_name, last_name, date_joined

    class Role(models.TextChoices):
        USER = 'USER', 'Użytkownik'
        ADMIN = 'ADMIN', 'Administrator'

    class Gender(models.TextChoices):
        MALE = 'M', 'Mężczyzna'
        FEMALE = 'F', 'Kobieta'
        OTHER = 'O', 'Inna'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)
    
    is_open_to_train = models.BooleanField(
        default=False, 
        help_text="Czy użytkownik chce wyświetlać się na liście dostępnych trenerów"
    )
    
    country = models.CharField(max_length=2, blank=True, null=True, help_text="Kod ISO kraju (np. PL)")
    gender = models.CharField(max_length=1, choices=Gender.choices, blank=True, null=True)
    age = models.PositiveIntegerField(blank=True, null=True)
    height = models.FloatField(help_text="Wzrost w cm", blank=True, null=True)
    weight = models.FloatField(help_text="Waga w kg", blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.email})"


class TrainerTrainee(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Oczekuje na akceptację'
        ACTIVE = 'ACTIVE', 'Aktywna współpraca'
        REJECTED = 'REJECTED', 'Odrzucono'

    # Relacja User <-> User
    trainer = models.ForeignKey(User, related_name='trainees', on_delete=models.CASCADE)
    trainee = models.ForeignKey(User, related_name='trainers', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            # zabezpieczenie przed wysłaniem dwóch zapytań do tego samego trenerea
            models.UniqueConstraint(fields=['trainer', 'trainee'], name='unique_trainer_trainee_relation')
        ]

    def __str__(self):
        return f"Trener: {self.trainer.username} | Podopieczny: {self.trainee.username} [{self.status}]"