import os
import requests
import re
from pyswip import Prolog
import concurrent.futures

# Initialize Prolog Engine
prolog = Prolog()

# Correctly form path to the prolog knowledge base
# Handle difference between local Windows development and Docker container
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
prolog_file_path = os.path.join(base_dir, 'ai_engine', 'recommendation.pl')

# Windows paths need forward slashes for Prolog
normalized_path = prolog_file_path.replace("\\", "/")

try:
    prolog.consult(normalized_path)
    print(f"Successfully loaded prologue file from {normalized_path}")
except Exception as e:
    print(f"Error loading prolog: {e}")

# Genre mapping from TMDB IDs to our Prolog genres
TMDB_GENRES = {
    28: 'action', 12: 'adventure', 16: 'animation', 35: 'comedy', 80: 'crime',
    99: 'documentary', 18: 'drama', 10751: 'family', 14: 'fantasy', 36: 'history',
    27: 'horror', 10402: 'musical', 9648: 'mystery', 10749: 'romance', 878: 'sci-fi',
    10770: 'tv movie', 53: 'thriller', 10752: 'war', 37: 'western'
}

def infer_mood(overview, genres):
    # Very rudimentary mood inference based on keywords
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
        moods = ['thought-provoking', 'tense'] # Default fallback moods
    return moods

def populate_dynamic_kb():
    api_key = os.getenv("TMDB_API_KEY")
    if not api_key:
        print("No TMDB API key, skipping dynamic population.")
        return
        
    print("Fetching dynamic movies from TMDB...")
    # Fetch 3 pages of popular movies (~60 movies)
    for page in [1, 2, 3]:
        url = f"https://api.themoviedb.org/3/movie/popular?api_key={api_key}&language=en-US&page={page}"
        try:
            response = requests.get(url).json()
            movies = response.get("results", [])
            for m in movies:
                movie_id = m["id"]
                title = m["title"].replace("'", "\\'") # Escape single quotes for Prolog
                overview = m.get("overview", "")
                
                # Default age rating 13 if we can't easily parse it
                min_age = 13
                if m.get("adult"): min_age = 18
                
                release_year = m.get("release_date", "2000")[:4] if m.get("release_date") else 2000
                popularity = int(m.get("popularity", 50))
                
                genre_ids = m.get("genre_ids", [])
                genres = [TMDB_GENRES.get(gid, 'drama') for gid in genre_ids if TMDB_GENRES.get(gid)]
                if not genres: genres = ['drama']
                
                moods = infer_mood(overview, genres)
                
                # Format lists for Prolog: [action, 'sci-fi'] etc
                genres_str = "[" + ",".join([f"'{g}'" for g in genres]) + "]"
                moods_str = "[" + ",".join([f"'{m}'" for m in moods]) + "]"
                
                # Check if it already exists to avoid duplicates during hot reloads
                # Using a safe query that doesn't blow up if PySWIP syntax is weird
                check_query = f"movie({movie_id}, _, _, _, _, _, _)"
                try:
                    exists = list(prolog.query(check_query))
                    if not exists:
                        # Assert the new fact into the Prolog engine
                        fact_str = f"movie({movie_id}, '{title}', {genres_str}, {moods_str}, {min_age}, {release_year}, {popularity})"
                        prolog.assertz(fact_str)
                except Exception as inner_e:
                    print(f"Error checking/asserting movie {movie_id}: {inner_e}")
                    
        except Exception as e:
            print(f"Error dynamically loading TMDB movies: {e}")
            
    print("Finished dynamic KB population.")

# Call the population function on startup
populate_dynamic_kb()

def get_recommendations(pref_genre, pref_mood, user_age, search_query=None):
    query = f"recommend_movie('{pref_genre}', '{pref_mood}', {user_age}, Title, Explanation, Popularity)"
    try:
        results = list(prolog.query(query))
        
        # Fallback: if strict genre/mood combination yields 0 results, 
        # try again with 'any' mood to broaden the search and give the user options.
        if not results and pref_mood != 'any':
            fallback_query = f"recommend_movie('{pref_genre}', 'any', {user_age}, Title, Explanation, Popularity)"
            results = list(prolog.query(fallback_query))
            
        # Fallback 2: if still empty, try 'any' genre and 'any' mood
        if not results and (pref_genre != 'any' or pref_mood != 'any'):
             fallback_query = f"recommend_movie('any', 'any', {user_age}, Title, Explanation, Popularity)"
             results = list(prolog.query(fallback_query))

        # 1. Collect unique matches from Prolog
        unique_matches = {}
        for res in results:
            title = res["Title"].decode('utf-8') if isinstance(res["Title"], bytes) else str(res["Title"])
            explanation = res["Explanation"].decode('utf-8') if isinstance(res["Explanation"], bytes) else str(res["Explanation"])
            popularity = int(res["Popularity"]) if "Popularity" in res else 50
            
            if title not in unique_matches:
                unique_matches[title] = {
                    "title": title,
                    "explanation": explanation,
                    "popularity": popularity
                }
        
        # 2. Sort by popularity and get top 50
        sorted_matches = sorted(list(unique_matches.values()), key=lambda x: x['popularity'], reverse=True)
        top_matches = sorted_matches[:50]
        
        # 3. Fetch rich TMDB metadata CONCURRENTLY
        fetched_movies = []
        
        def fetch_and_update(match):
            metadata = get_tmdb_metadata(match["title"])
            match.update({
                "poster_url": metadata["poster_url"],
                "overview": metadata["overview"],
                "cast": metadata["cast"],
                "rating": metadata["rating"],
                "year": metadata["year"]
            })
            return match

        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            fetched_movies = list(executor.map(fetch_and_update, top_matches))
            
        # 4. Filter by search query AFTER fetching metadata to allow searching by actor/keyword
        final_movies = []
        if search_query:
            sq = search_query.lower()
            for movie in fetched_movies:
                # Check title
                if sq in movie["title"].lower():
                    final_movies.append(movie)
                    continue
                # Check overview
                if sq in movie.get("overview", "").lower():
                    final_movies.append(movie)
                    continue
                # Check cast
                cast_str = " ".join(movie.get("cast", [])).lower()
                if sq in cast_str:
                    final_movies.append(movie)
                    continue
        else:
            final_movies = fetched_movies
            
        return final_movies
    except Exception as e:
        print(f"Error executing Prolog query: {e}")
        return []

def get_tmdb_metadata(movie_title):
    api_key = os.getenv("TMDB_API_KEY")
    default_meta = {
        "poster_url": "https://via.placeholder.com/500x750?text=No+Poster",
        "overview": "No description available.",
        "cast": [],
        "rating": 0,
        "year": "Unknown",
        "popularity": 0
    }
    
    if not api_key:
        return default_meta
    
    url = f"https://api.themoviedb.org/3/search/movie?api_key={api_key}&query={movie_title}"
    try:
        response = requests.get(url).json()
        if response.get("results") and len(response["results"]) > 0:
            movie = response["results"][0]
            movie_id = movie["id"]
            
            default_meta["poster_url"] = f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get('poster_path') else default_meta["poster_url"]
            default_meta["overview"] = movie.get("overview", "")
            default_meta["rating"] = round(movie.get("vote_average", 0), 1)
            default_meta["year"] = movie.get("release_date", "")[:4] if movie.get("release_date") else ""
            default_meta["popularity"] = movie.get("popularity", 0)
            
            # Fetch credits
            credits_url = f"https://api.themoviedb.org/3/movie/{movie_id}/credits?api_key={api_key}"
            credits_resp = requests.get(credits_url).json()
            if credits_resp.get("cast"):
                # Get top 3 actors
                default_meta["cast"] = [actor["name"] for actor in credits_resp["cast"][:3]]
                
    except Exception as e:
        print(f"TMDB Fetch Error: {e}")
        
    return default_meta
