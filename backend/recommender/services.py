import os
try:
    import chromadb
except Exception as e:
    print(f"Failed to import chromadb: {e}")
    chromadb = None

try:
    from sentence_transformers import SentenceTransformer
except Exception as e:
    print(f"Failed to import sentence_transformers: {e}")
    SentenceTransformer = None

from pyswip import Prolog
from django.conf import settings

prolog = Prolog()

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
prolog_file_path = os.path.join(base_dir, 'ai_engine', 'recommendation.pl')
normalized_path = prolog_file_path.replace("\\", "/")

try:
    prolog.consult(normalized_path)
    print(f"Successfully loaded prologue file from {normalized_path}")
except Exception as e:
    print(f"Error loading prolog: {e}")

embedding_model = None

def get_embedding_model():
    global embedding_model
    if SentenceTransformer is None:
        return None
    if embedding_model is None:
        try:
            embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Exception initializing sentence_transformers: {e}")
            return None
    return embedding_model

def get_chroma_collection():
    if chromadb is None:
        return None
    try:
        client = chromadb.PersistentClient(path=settings.CHROMA_DB_DIR)
        return client.get_or_create_collection(name="movies")
    except Exception as e:
        print(f"Exception initializing chromadb: {e}")
        return None

def load_prolog_kb():
    from .models import Movie
    print("Loading KB from local DB...")
    # Retract all dynamic movie facts
    list(prolog.query("retractall(movie(_, _, _, _, _, _, _))"))
    
    movies = Movie.objects.all()
    count = 0
    for m in movies:
        genres_str = "[" + ",".join([f"'{g}'" for g in m.genres]) + "]"
        moods_str = "[" + ",".join([f"'{mood}'" for mood in m.moods]) + "]"
        title = m.title.replace("'", "\\'")
        try:
            fact_str = f"movie({m.tmdb_id}, '{title}', {genres_str}, {moods_str}, {m.min_age}, {m.release_year}, {int(m.popularity)})"
            prolog.assertz(fact_str)
            count += 1
        except Exception as e:
             pass
    print(f"Loaded {count} movies into Prolog KB.")

def get_recommendations(pref_genre, pref_mood, user_age, search_query="", user_id=None):
    from .models import Movie
    chroma_collection = get_chroma_collection()
    pool_ids = []
    
    if search_query and search_query.strip() and chroma_collection:
        model = get_embedding_model()
        if model:
            query_embedding = model.encode(search_query).tolist()
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
