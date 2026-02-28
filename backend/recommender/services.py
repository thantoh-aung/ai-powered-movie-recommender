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
    from .models import Movie, WatchHistory
    # 1. Load Movies if not already loaded
    try:
        check = list(prolog.query("movie(_, _, _, _, _, _, _)"))
        if not check:
            print("Loading Movies into Prolog KB...")
            movies = Movie.objects.all().only('tmdb_id', 'title', 'genres', 'moods', 'min_age', 'release_year', 'popularity')
            for m in movies:
                genres_str = "[" + ",".join([f"'{str(g).lower()}'" for g in m.genres]) + "]"
                moods_str = "[" + ",".join([f"'{str(mood).lower()}'" for mood in m.moods]) + "]"
                title = m.title.replace("'", "\\'")
                try:
                    fact_str = f"movie({m.tmdb_id}, '{title}', {genres_str}, {moods_str}, {m.min_age}, {m.release_year}, {int(m.popularity)})"
                    prolog.assertz(fact_str)
                except: pass
    except: pass

    # 2. Load User Likes if not already loaded
    try:
        likes = WatchHistory.objects.filter(liked=True)
        for like in likes:
            try:
                # Check if fact already exists to avoid duplicates
                check_like = list(prolog.query(f"user_likes({like.user.id}, {like.movie.tmdb_id})"))
                if not check_like:
                    prolog.assertz(f"user_likes({like.user.id}, {like.movie.tmdb_id})")
            except: pass
    except Exception as e:
        print(f"Error loading likes into Prolog: {e}")

def get_recommendations(pref_genre, pref_mood, user_age, search_query="", user_id=None):
    pref_genre = pref_genre.lower() if pref_genre else 'any'
    pref_mood = pref_mood.lower() if pref_mood else 'any'
    from .models import Movie
    load_prolog_kb() # Ensure KB is ready
    chroma_collection = get_chroma_collection()
    pool_ids = []
    
    if search_query and search_query.strip() and chroma_collection:
        print(f"DEBUG: Searching for '{search_query}'")
        query_embedding = get_openrouter_embedding(search_query)
        if query_embedding:
            print("DEBUG: Embedding generated successfully. Querying Chroma DB...")
            results = chroma_collection.query(
                query_embeddings=[query_embedding],
                n_results=100
            )
            if results and results.get("ids") and len(results["ids"]) > 0:
                pool_ids = [int(x) for x in results["ids"][0] if str(x).isdigit()]
                print(f"DEBUG: Found {len(pool_ids)} matching pool_ids in ChromaDB.")
            else:
                print("DEBUG: ChromaDB returned no results.")
        else:
            print("DEBUG: Failed to generate embedding from OpenRouter.")
            
    # Always include collaborative filtering if user_id is provided
    results_raw = []
    
    # 1. Collaborative search (Similar to liked)
    if user_id:
        try:
             # If searching, we optionally filter collaborative results by the pool
             collab_query = f"recommend_similar_to_liked({user_id}, {user_age}, ID, Title, Explanation, Popularity)"
             collab_results = list(prolog.query(collab_query))
             
             if pool_ids:
                 # Strictly filter collaborative results to only those in the search pool
                 collab_results = [r for r in collab_results if int(r.get("ID", 0)) in pool_ids]
             
             results_raw.extend(collab_results)
        except: pass
        
    # 2. Constraints search (Search Pool OR Global)
    if search_query and search_query.strip():
        # Searching via keywords - ONLY search within the pool
        if pool_ids:
            pool_str = "[" + ",".join(map(str, pool_ids)) + "]"
            query = f"recommend_movie_in_pool('{pref_genre}', '{pref_mood}', {user_age}, {pool_str}, ID, Title, Explanation, Popularity)"
            try:
                pool_results = list(prolog.query(query))
                
                # Fallbacks strictly within the semantic pool
                if not pool_results and pref_mood != 'any':
                    pool_results.extend(list(prolog.query(f"recommend_movie_in_pool('{pref_genre}', 'any', {user_age}, {pool_str}, ID, Title, Explanation, Popularity)")))
                if not pool_results and pref_genre != 'any':
                    pool_results.extend(list(prolog.query(f"recommend_movie_in_pool('any', '{pref_mood}', {user_age}, {pool_str}, ID, Title, Explanation, Popularity)")))
                if not pool_results:
                    # If semantic pool has no exact genre/mood match, keyword intent overrides genre/mood.
                    # Return EVERYTHING in the keyword pool.
                    pool_results.extend(list(prolog.query(f"recommend_movie_in_pool('any', 'any', {user_age}, {pool_str}, ID, Title, Explanation, Popularity)")))
                
                results_raw.extend(pool_results)
            except Exception as e:
                print(f"Error querying search pool: {e}")
        else:
            # They searched a keyword but Chroma found 0 embeddings for it. Do not return all movies.
            pass
    else:
        # NO search query: Global recommendation based on Genre/Mood only
        query = f"recommend_movie('{pref_genre}', '{pref_mood}', {user_age}, ID, Title, Explanation, Popularity)"
        try:
            results_raw.extend(list(prolog.query(query)))
            
            # Fallbacks globally
            if not results_raw and pref_mood != 'any':
                results_raw.extend(list(prolog.query(f"recommend_movie('{pref_genre}', 'any', {user_age}, ID, Title, Explanation, Popularity)")))
            if not results_raw and pref_genre != 'any':
                results_raw.extend(list(prolog.query(f"recommend_movie('any', '{pref_mood}', {user_age}, ID, Title, Explanation, Popularity)")))
            if not results_raw:
                results_raw.extend(list(prolog.query(f"recommend_movie('any', 'any', {user_age}, ID, Title, Explanation, Popularity)")))
        except Exception as e:
            print(f"Error querying global recommendations: {e}")

    try:
        unique_matches = {}
        # If we are searching, we want to boost pool results even more
        is_searching = bool(search_query and search_query.strip())
        for res in results_raw:
            title_raw = res.get("Title")
            if not title_raw: continue
            title = title_raw.decode('utf-8') if isinstance(title_raw, bytes) else str(title_raw)
            explanation_raw = res.get("Explanation", "")
            explanation = explanation_raw.decode('utf-8') if isinstance(explanation_raw, bytes) else str(explanation_raw)
            popularity = int(res.get("Popularity", 50))
            
            # Boost popularity heavily if it's a collaborative match
            if "because you liked" in explanation:
                popularity += 10000
            
            # If we are searching, we should boost results that were actually found in the search pool
            # (Prolog might have mixed them up)
            if is_searching:
                popularity += 5000 
            
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
