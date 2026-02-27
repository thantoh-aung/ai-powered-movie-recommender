from django.urls import path
from .views import RecommendMovieView, RegisterView, LoginView, LikeMovieView

urlpatterns = [
    path('recommend/', RecommendMovieView.as_view(), name='recommend'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('movie/like/', LikeMovieView.as_view(), name='like_movie'),
]
