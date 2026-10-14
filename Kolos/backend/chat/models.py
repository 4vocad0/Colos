from django.db import models
from django.conf import settings
from workouts.models import WorkoutPlan

class Message(models.Model):
    # Nadawca i Odbiorca
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_messages')
    
    # Treść wiadomości
    content = models.TextField(blank=True, null=True, help_text="Treść tekstowa wiadomości")
    media_url = models.URLField(max_length=1000, blank=True, null=True, help_text="Link do zdjęcia/wideo")
    
    # Przesyłanie planów treningowych (Klucz obcy do innej aplikacji!)
    shared_plan = models.ForeignKey(
        WorkoutPlan, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='shared_in_messages',
        help_text="Udostępniony szablon planu treningowego"
    )
    
    # Status i czas
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at'] # Wiadomości naturalnie sortują się od najstarszej do najnowszej

    def __str__(self):
        return f"Od {self.sender.username} do {self.receiver.username} | {self.created_at.strftime('%Y-%m-%d %H:%M')}"