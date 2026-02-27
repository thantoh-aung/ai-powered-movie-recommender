import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movie_recommender.settings')
django.setup()

from recommender.models import Movie

movies = Movie.objects.all()
for m in movies:
    # Mimic the tasks.py logic
    # Animation: 16, Family: 10751, Comedy: 35
    if m.tmdb_id:
        # We don't have genre_ids saved as IDs, so we check the labels
        # genres are labels: 'animation', 'family', 'comedy'
        genres_lower = [g.lower() for g in m.genres]
        if 'animation' in genres_lower or 'family' in genres_lower:
            m.min_age = 0
        elif 'comedy' in genres_lower:
            m.min_age = 6
        else:
            m.min_age = 12
        m.save()

print(f"Updated {len(movies)} movies with new age constraints.")
