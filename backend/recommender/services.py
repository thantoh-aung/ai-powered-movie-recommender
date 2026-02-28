import os
from pyswip import Prolog
from django.conf import settings

prolog = Prolog()

# Resolve path for Prolog file
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
prolog_file_path = os.path.join(base_dir, 'ai_engine', 'recommendation.pl')
normalized_path = prolog_file_path.replace("\\", "/")

try:
    prolog.consult(normalized_path)
    print(f"Successfully loaded prologue file from {normalized_path}")
except Exception as e:
    print(f"Error loading prolog: {e}")

def get_openrouter_embedding(text):
    import requests
    api_key = os.getenv("OPENROUTER_API_KEY")
    model_name = os.getenv("OPENROUTER_EMBEDDING_MODEL", "nomic-ai/nomic-embed-text-v1.5")
    
    if not api_key:
        print("OPENROUTER_API_KEY not found in environment variables.")
        return None
        
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model_name,
        "input": text
    }
    
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/embeddings",
            headers=headers,
            json=payload,
            timeout=10
        )
        if not response.ok:
            print(f"OpenRouter API Error: {response.status_code} - {response.text}")
        response.raise_for_status()
        data = response.json()
        if data and "data" in data and len(data["data"]) > 0:
            return data["data"][0]["embedding"]
        return None
    except Exception as e:
        print(f"Exception calling OpenRouter embeddings API: {e}")
        return None

def get_chroma_collection():
    try:
        import chromadb
        client = chromadb.PersistentClient(path=settings.CHROMA_DB_DIR)
        return client.get_or_create_collection(name="movies")
    except Exception as e:
        print(f"Exception initializing chromadb: {e}")
        return None

def load_prolog_kb():
    from .models import Movie
    # Only load if not already loaded (check for one movie fact)
    try:
        check = list(prolog.query("movie(_, _, _, _, _, _, _)"))
        if check:
            print("Prolog KB already contains data. Skipping reload.")
            return
    except:
        pass

    print("Loading KB from local DB...")
    movies = Movie.objects.all().only('tmdb_id', 'title', 'genres', 'moods', 'min_age', 'release_year', 'popularity')
    count = 0
    for m in movies:
        genres_str = "[" + ",".join([f"'{g}'" for g in m.genres]) + "]"
        moods_str = "[" + ",".join([f"'{mood}'" for mood in m.moods]) + "]"
        title = m.title.replace("'", "\\'")
        try:
            fact_str = f"movie({m.tmdb_id}, '{title}', {genres_str}, {moods_str}, {m.min_age}, {m.release_year}, {int(m.popularity)})"
            prolog.assertz(fact_str)
            count += 1
        except:
             pass
    print(f"Loaded {count} movies into Prolog KB.")

def get_recommendations(pref_genre, pref_mood, user_age, search_query="", user_id=None):
    from .models import Movie
    chroma_collection = get_chroma_collection()
    pool_ids = []
    
    if search_query and search_query.strip() and chroma_collection:
        query_embedding = get_openrouter_embedding(search_query)
        if query_embedding:
            results = chroma_collection.query(
                query_embeddings=[query_embedding],
                n_results=100
            )
            if results and results.get("ids") and len(results["ids"]) > 0:
                pool_ids = [int(x) for x in results["ids"][0]]
            
    # Always include collaborative filtering if user_id is provided
    results_raw = []
    
    # 1. Content-based / Collaborative search
    if user_id:
        try:
             results_raw.extend(list(prolog.query(f"recommend_similar_to_liked({user_id}, {user_age}, Title, Explanation, Popularity)")))
        except: pass
        
    # 2. Constraints search
    if pool_ids:
        pool_str = "[" + ",".join([str(pid) for pid in pool_ids]) + "]"
        query = f"recommend_movie_in_pool('{pref_genre}', '{pref_mood}', {user_age}, {pool_str}, Title, Explanation, Popularity)"
    else:
        query = f"recommend_movie('{pref_genre}', '{pref_mood}', {user_age}, Title, Explanation, Popularity)"
        
    try:
        results_raw.extend(list(prolog.query(query)))
        
        # Fallbacks if still empty
        if not results_raw and pref_mood != 'any':
            if pool_ids:
                fallback_query = f"recommend_movie_in_pool('{pref_genre}', 'any', {user_age}, {pool_str}, Title, Explanation, Popularity)"
            else:
                fallback_query = f"recommend_movie('{pref_genre}', 'any', {user_age}, Title, Explanation, Popularity)"
            results_raw.extend(list(prolog.query(fallback_query)))
            
        if not results_raw and pref_genre != 'any':
            if pool_ids:
                fallback_query = f"recommend_movie_in_pool('any', '{pref_mood}', {user_age}, {pool_str}, Title, Explanation, Popularity)"
            else:
                fallback_query = f"recommend_movie('any', '{pref_mood}', {user_age}, Title, Explanation, Popularity)"
            results_raw.extend(list(prolog.query(fallback_query)))

        if not results_raw:
            if pool_ids:
                fallback_query = f"recommend_movie_in_pool('any', 'any', {user_age}, {pool_str}, Title, Explanation, Popularity)"
            else:
                fallback_query = f"recommend_movie('any', 'any', {user_age}, Title, Explanation, Popularity)"
            results_raw.extend(list(prolog.query(fallback_query)))

        unique_matches = {}
        for res in results_raw:
            title_raw = res.get("Title")
            if not title_raw: continue
            title = title_raw.decode('utf-8') if isinstance(title_raw, bytes) else str(title_raw)
            explanation_raw = res.get("Explanation", "")
            explanation = explanation_raw.decode('utf-8') if isinstance(explanation_raw, bytes) else str(explanation_raw)
            popularity = int(res.get("Popularity", 50))
            
            # Boost popularity heavily if it's a collaborative match so they appear first!
            if "because you liked" in explanation:
                popularity += 10000
            
            if title not in unique_matches:
                unique_matches[title] = {"title": title, "explanation": explanation, "popularity": popularity}
                
        import random
        match_list = list(unique_matches.values())
        random.shuffle(match_list) # Shuffle first to break ties randomly
        sorted_matches = sorted(match_list, key=lambda x: x['popularity'], reverse=True)[:150]
        
        # Fetch rich data from DB 
        titles = [m['title'] for m in sorted_matches]
        movies_in_db = Movie.objects.filter(title__in=titles)
        movie_lookup = { m.title: m for m in movies_in_db }
        
        final_movies = []
        for m in sorted_matches:
            db_m = movie_lookup.get(m['title'])
            if db_m:
                final_movies.append({
                    "title": db_m.title,
                    "explanation": m["explanation"],
                    "popularity": db_m.popularity,
                    "poster_url": db_m.poster_url,
                    "overview": db_m.overview,
                    "cast": db_m.cast,
                    "rating": db_m.rating,
                    "year": db_m.release_year,
                    "tmdb_id": db_m.tmdb_id
                })
        return final_movies
    except Exception as e:
        print(f"Error executing Prolog query: {e}")
        return []
