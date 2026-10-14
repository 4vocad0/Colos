from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from .models import SocialGroup, GroupMember, Post, Like, Comment
from .serializers import (
    SocialGroupSerializer, GroupMemberSerializer, PostSerializer, 
    LikeSerializer, CommentSerializer
)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class SocialGroupViewSet(viewsets.ModelViewSet):
    queryset = SocialGroup.objects.all()
    serializer_class = SocialGroupSerializer

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class GroupMemberViewSet(viewsets.ModelViewSet):
    queryset = GroupMember.objects.all()
    serializer_class = GroupMemberSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    # DODANE: Włączamy paginację również dla komentarzy!
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = super().get_queryset().order_by('-created_at')
        post_id = self.request.query_params.get('post')
        if post_id is not None:
            queryset = queryset.filter(post_id=post_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)