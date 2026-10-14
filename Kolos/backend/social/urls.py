from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SocialGroupViewSet, GroupMemberViewSet, PostViewSet, 
    LikeViewSet, CommentViewSet
)

router = DefaultRouter()
router.register(r'groups', SocialGroupViewSet)
router.register(r'members', GroupMemberViewSet)
router.register(r'posts', PostViewSet)
router.register(r'likes', LikeViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]