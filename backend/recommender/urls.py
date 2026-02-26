from django.urls import path
from .views import RecommendMovieView

urlpatterns = [
    path('recommend/', RecommendMovieView.as_view(), name='recommend'),
]
