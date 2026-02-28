import os
import requests
from celery import shared_task
from .models import Movie
try:
    import chromadb
except Exception as e:
    print(f"Failed to import chromadb in Celery tasks: {e}")
    chromadb = None
from django.conf import settings
try:
    from .services import get_openrouter_embedding
except Exception as e:
    print(f"Failed to import get_openrouter_embedding in Celery tasks: {e}")
    get_openrouter_embedding = None

TMDB_GENRES = {
    28: 'action', 12: 'adventure', 16: 'animation', 35: 'comedy', 80: 'crime',
    99: 'documentary', 18: 'drama', 10751: 'family', 14: 'fantasy', 36: 'history',
    27: 'horror', 10402: 'musical', 9648: 'mystery', 10749: 'romance', 878: 'sci-fi',
    10770: 'tv movie', 53: 'thriller', 10752: 'war', 37: 'western'
}

def infer_mood(overview, genres):
    overview_lower = overview.lower()
    moods = []
    if 'dark' in overview_lower or 'murder' in overview_lower or 'crime' in overview_lower: moods.append('dark')
    if 'funny' in overview_lower or 'hilarious' in overview_lower or 'comedy' in genres: moods.append('funny')
    if 'mind' in overview_lower or 'twist' in overview_lower or 'complex' in overview_lower: moods.append('mind-bending')
    if 'action' in genres or 'explosive' in overview_lower: moods.append('action-packed')
    if 'thrill' in overview_lower or 'suspense' in overview_lower: moods.append('thrilling')
    if 'love' in overview_lower or 'romance' in genres: moods.append('romantic')
    if 'family' in genres or 'heartwarming' in overview_lower: moods.append('heartwarming')
    if not moods:
        moods = ['thought-provoking', 'tense']
    return moods

@shared_task
def fetch_popular_movies():
    return sync_movies_with_tmdb(max_pages=10)

def sync_movies_with_tmdb(max_pages=10):
    api_key = os.getenv("TMDB_API_KEY")
    if not api_key:
        print("No TMDB API key, skipping.")
        return 0

    # Initialize chromadb client and model
    collection = None
    model = None
    if chromadb is not None and get_openrouter_embedding is not None:
        try:
            from django.conf import settings
            chroma_client = chromadb.PersistentClient(path=settings.CHROMA_DB_DIR)
            collection = chroma_client.get_or_create_collection(name="movies")
        except Exception as e:
            print(f"Error initializing ChromaDB: {e}")

    print(f"Syncing {max_pages} pages of movies from TMDB...")
    
    new_movies_processed = 0
    for page in range(1, max_pages + 1):
        url = f"https://api.themoviedb.org/3/movie/popular?api_key={api_key}&language=en-US&page={page}"
        try:
            response = requests.get(url, timeout=10).json()
            movies_data = response.get("results", [])
            for m in movies_data:
                movie_id = m["id"]
                title = m.get("title", "")
                overview = m.get("overview", "")
                
                if not m.get("poster_path") or title.lower() in ["the orphans", "orphans"]:
                    continue
                
                # Fetch credits for this movie to get cast
                credits_url = f"https://api.themoviedb.org/3/movie/{movie_id}/credits?api_key={api_key}"
                credits_resp = requests.get(credits_url, timeout=10).json()
                cast = [actor["name"] for actor in credits_resp.get("cast", [])[:5]]

                # Improved age inference 
                is_adult = m.get("adult", False)
                genre_ids = m.get("genre_ids", [])
                
                if is_adult:
                    min_age = 18
                elif 16 in genre_ids or 10751 in genre_ids: # Animation or Family
                    min_age = 0
                elif 35 in genre_ids: # Comedy
                    min_age = 6
                else:
                    min_age = 12
                
                release_year = int(m.get("release_date", "2000")[:4]) if m.get("release_date") else 2000
                popularity = float(m.get("popularity", 50))
                rating = float(m.get("vote_average", 0))
                
                genre_ids = m.get("genre_ids", [])
                genres = [TMDB_GENRES.get(gid, 'drama') for gid in genre_ids if TMDB_GENRES.get(gid)]
                if not genres: genres = ['drama']
                
                moods = infer_mood(overview, genres)
                poster_url = f"https://image.tmdb.org/t/p/w500{m['poster_path']}"
                
                movie_obj, created = Movie.objects.update_or_create(
                    tmdb_id=movie_id,
                    defaults={
                        'title': title,
                        'overview': overview,
                        'poster_url': poster_url,
                        'release_year': release_year,
                        'rating': rating,
                        'popularity': popularity,
                        'min_age': min_age,
                        'genres': genres,
                        'moods': moods,
                        'cast': cast
                    }
                )
                
                if collection and get_openrouter_embedding:
                    # Add/Update ChromaDB Entry
                    text_for_embedding = f"Title: {title}. Genres: {', '.join(genres)}. Cast: {', '.join(cast)}. Overview: {overview}"
                    embedding = get_openrouter_embedding(text_for_embedding)
                    
                    if embedding:
                        collection.upsert(
                            documents=[text_for_embedding],
                            embeddings=[embedding],
                            metadatas=[{"tmdb_id": movie_id, "title": title}],
                            ids=[str(movie_id)]
                        )
                new_movies_processed += 1
                
        except Exception as e:
            print(f"Error loading TMDB movies page {page}: {e}")

    print(f"Finished processing {new_movies_processed} movies.")
    return new_movies_processed
