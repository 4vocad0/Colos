from django.db import models
from django.conf import settings
from workouts.models import Workout

# ==========================================
# GRUPY SPOŁECZNOŚCIOWE
# ==========================================
class SocialGroup(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_groups')
    is_private = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({'Prywatna' if self.is_private else 'Publiczna'})"

class GroupMember(models.Model):
    class Role(models.TextChoices):
        MEMBER = 'MEMBER', 'Członek'
        MODERATOR = 'MODERATOR', 'Moderator'
        OWNER = 'OWNER', 'Właściciel'

    group = models.ForeignKey(SocialGroup, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='group_memberships')
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['group', 'user'], name='unique_group_member')
        ]

    def __str__(self):
        return f"{self.user.username} w {self.group.name} [{self.role}]"

# ==========================================
# POSTY, LAJKI, KOMENTARZE
# ==========================================
class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    
    # Opcjonalne powiązania
    workout_session = models.OneToOneField(Workout, on_delete=models.SET_NULL, null=True, blank=True, related_name='post')
    group = models.ForeignKey(SocialGroup, on_delete=models.CASCADE, null=True, blank=True, related_name='posts')
    
    title = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    media_url = models.URLField(max_length=1000, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Post by {self.author.username} at {self.created_at.strftime('%Y-%m-%d')}"

class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='unique_post_like')
        ]

    def __str__(self):
        return f"{self.user.username} likes Post {self.post.id}"

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Comment by {self.author.username} on Post {self.post.id}"