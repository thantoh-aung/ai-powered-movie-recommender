from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Movie, WatchHistory, UserProfile
from .services import get_recommendations, prolog

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        age = request.data.get('age')
        
        if not username or not password or not age:
            return Response({'error': 'Please provide username, password, and age'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            age = int(age)
        except ValueError:
             return Response({'error': 'Age must be a valid number'}, status=status.HTTP_400_BAD_REQUEST)
             
        user = User.objects.create_user(username=username, password=password)
        UserProfile.objects.create(user=user, age=age)
        return Response({'user_id': user.id, 'username': user.username, 'age': age}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
             age = None
             try:
                 profile = UserProfile.objects.get(user=user)
                 age = profile.age
             except UserProfile.DoesNotExist:
                 pass
             return Response({'user_id': user.id, 'username': user.username, 'age': age}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LikeMovieView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        tmdb_id = request.data.get('tmdb_id')
        liked = request.data.get('liked', True)
        
        try:
            user = User.objects.get(id=user_id)
            movie = Movie.objects.get(tmdb_id=tmdb_id)
            
            WatchHistory.objects.update_or_create(
                user=user,
                movie=movie,
                defaults={'liked': liked}
            )
            
            if liked:
                try:
                    check = list(prolog.query(f"user_likes({user.id}, {movie.tmdb_id})"))
                    if not check:
                        prolog.assertz(f"user_likes({user.id}, {movie.tmdb_id})")
                except Exception as e:
                    print(f"Error asserting user_likes: {e}")
            else:
                 try:
                    list(prolog.query(f"retractall(user_likes({user.id}, {movie.tmdb_id}))"))
                 except: pass

            return Response({'message': 'Preference saved'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RecommendMovieView(APIView):
    def post(self, request):
        genre = request.data.get('genre', 'any')
        mood = request.data.get('mood', 'any')
        search_query = request.data.get('search_query', '')
        user_id = request.data.get('user_id', None)
        
        try:
            age = int(request.data.get('age', 18))
        except ValueError:
            age = 18

        # ENFORCE BACKEND AGE
        if user_id:
            try:
                user_profile = UserProfile.objects.get(user_id=user_id)
                age = user_profile.age  # Force the profile age, ignoring the frontend slider
            except UserProfile.DoesNotExist:
                pass

        # SYNC FALLBACK FOR SERVERLESS (Vercel/Render)
        # Only auto-trigger if DB is truly empty. For filling to 500, use: python manage.py fetch_movies
        movie_count = Movie.objects.count()
        if movie_count < 10:
            try:
                from .tasks import fetch_popular_movies
                print(f"Very low movie count ({movie_count}). Triggering async sync...")
                fetch_popular_movies.delay() # Run in Celery
                return Response({'message': 'Initializing AI Knowledge Base (this may take a minute on first launch)...', 'status': 'building'}, status=status.HTTP_202_ACCEPTED)
            except Exception as e:
                pass  # Celery not available locally, continue serving what we have

        recommendations = get_recommendations(genre, mood, age, search_query, user_id)
        
        if not recommendations:
             return Response({"message": "No movies found matching your preferences. Try adjusting them!"}, status=status.HTTP_200_OK)
             
        return Response({"recommendations": recommendations}, status=status.HTTP_200_OK)
class SetupDatabaseView(APIView):
    """
    Temporary view to trigger database sync on Render Free Tier 
    where shell access is disabled.
    """
    def get(self, request):
        import threading
        from .tasks import sync_movies_with_tmdb
        
        print("Starting remote setup sync in background thread...")
        
        def run_sync_in_background():
            try:
                sync_movies_with_tmdb(max_pages=25)
                print("Background sync completed successfully!")
            except Exception as e:
                print(f"Background sync failed: {e}")
                
        # Kick off background thread so the web request doesn't timeout
        thread = threading.Thread(target=run_sync_in_background)
        thread.daemon = True
        thread.start()
        
        return Response({
            "message": "Background sync started! It will take about 2-3 minutes to download all 500 movies. Check your Render logs for progress.",
            "status": "processing"
        }, status=status.HTTP_200_OK)
