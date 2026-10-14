from rest_framework import serializers
from .models import SocialGroup, GroupMember, Post, Like, Comment

class SocialGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialGroup
        fields = '__all__'
        read_only_fields = ['creator']

class GroupMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMember
        fields = '__all__'

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'
        read_only_fields = ['user']

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    is_edited = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_name', 'content', 'created_at', 'is_edited']
        read_only_fields = ['author']

    def get_is_edited(self, obj):
        # Jeśli pole updated_at ma jakąkolwiek wartość (nie jest nullem), to znaczy że edytowano
        return obj.updated_at is not None

# ==========================================
# ROZSZERZONY SERIALIZATOR POSTA
# ==========================================
class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    user_like_id = serializers.SerializerMethodField()
    is_edited = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'author_name', 'workout_session', 'group', 
            'title', 'content', 'media_url', 'created_at',
            'likes_count', 'comments_count', 'user_like_id', 'is_edited'
        ]
        read_only_fields = ['author']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_user_like_id(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            like = obj.likes.filter(user=request.user).first()
            if like:
                return like.id
        return None

    def get_is_edited(self, obj):
        # Jeśli pole updated_at ma jakąkolwiek wartość (nie jest nullem), to znaczy że edytowano
        return obj.updated_at is not None