from django.db import models
from django.contrib.auth.models import User

class Movie(models.Model):
    tmdb_id = models.IntegerField(unique=True)
    title = models.CharField(max_length=255)
    overview = models.TextField(blank=True)
    poster_url = models.URLField(blank=True, null=True)
    release_year = models.IntegerField(default=2000)
    rating = models.FloatField(default=0)
    popularity = models.FloatField(default=0)
    min_age = models.IntegerField(default=13)
    genres = models.JSONField(default=list)  
    moods = models.JSONField(default=list)   
    cast = models.JSONField(default=list)    
    
    def __str__(self):
        return self.title

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    age = models.IntegerField(default=18)
    preferences = models.JSONField(default=dict) 

    def __str__(self):
        return self.user.username

class WatchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    liked = models.BooleanField(default=True)
    watched_on = models.DateTimeField(auto_now_add=True)
