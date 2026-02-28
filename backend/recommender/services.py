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

class SimpleVectorDB:
    def __init__(self, path):
        import json, os
        self.path = path
        self.data = {"ids": [], "embeddings": [], "documents": [], "metadatas": []}
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
            except: pass

    def save(self):
        import json
        with open(self.path, 'w', encoding='utf-8') as f:
            json.dump(self.data, f)

    def upsert(self, documents, embeddings, metadatas, ids):
        for doc, emb, meta, _id in zip(documents, embeddings, metadatas, ids):
            if _id in self.data["ids"]:
                idx = self.data["ids"].index(_id)
                self.data["embeddings"][idx] = emb
                self.data["documents"][idx] = doc
                self.data["metadatas"][idx] = meta
            else:
                self.data["ids"].append(_id)
                self.data["embeddings"].append(emb)
                self.data["documents"].append(doc)
                self.data["metadatas"].append(meta)
        self.save()

    def query(self, query_embeddings, n_results=10):
        import numpy as np
        if not self.data["embeddings"]: return {"ids": [[]], "distances": [[]]}
        
        q_emb = np.array(query_embeddings[0])
        db_embs = np.array(self.data["embeddings"])
        
        # Cosine similarity calculation
        q_norm = np.linalg.norm(q_emb)
        db_norms = np.linalg.norm(db_embs, axis=1)
        
        # Avoid division by zero
        norms = q_norm * db_norms
        norms[norms == 0] = 1e-10
        
        similarities = np.dot(db_embs, q_emb) / norms
        
        top_indices = np.argsort(similarities)[::-1][:n_results]
        
        return {
            "ids": [[self.data["ids"][i] for i in top_indices]],
            "distances": [[1.0 - similarities[i] for i in top_indices]]
        }

def get_chroma_collection():
    try:
        db_path = os.path.join(settings.BASE_DIR, "simple_chroma.json")
        return SimpleVectorDB(db_path)
    except Exception as e:
        print(f"Exception initializing SimpleVectorDB: {e}")
        return None

_loaded_tmdb_ids = set()  # Track which movies are already in Prolog

def load_prolog_kb():
    global _loaded_tmdb_ids
    from .models import Movie, WatchHistory
    
    # 1. Load NEW movies that aren't in Prolog yet
    try:
        movies = Movie.objects.all().only('tmdb_id', 'title', 'genres', 'moods', 'min_age', 'release_year', 'popularity')
        new_count = 0
        for m in movies:
            if m.tmdb_id in _loaded_tmdb_ids:
                continue  # Already in Prolog, skip
            
            genres_str = "[" + ",".join([f"'{str(g).lower()}'" for g in m.genres]) + "]"
            moods_str = "[" + ",".join([f"'{str(mood).lower()}'" for mood in m.moods]) + "]"
            title = m.title.replace("'", "\\'")
            try:
                fact_str = f"movie({m.tmdb_id}, '{title}', {genres_str}, {moods_str}, {m.min_age}, {m.release_year}, {int(m.popularity)})"
                prolog.assertz(fact_str)
                _loaded_tmdb_ids.add(m.tmdb_id)
                new_count += 1
            except: pass
        
        if new_count > 0:
            print(f"Loaded {new_count} new movies into Prolog KB (total: {len(_loaded_tmdb_ids)})")
    except Exception as e:
        print(f"Error loading movies into Prolog: {e}")

    # 2. Load User Likes if not already loaded
    try:
        likes = WatchHistory.objects.filter(liked=True)
        for like in likes:
            try:
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
    
    # ── KEYWORD SEARCH POOL (ChromaDB / Local Fallback) ──
    if search_query and search_query.strip():
        search_query_lower = search_query.lower()
        print(f"DEBUG: Searching for '{search_query}'")
        query_embedding = None
        if chroma_collection:
             query_embedding = get_openrouter_embedding(search_query)
        
        if query_embedding and chroma_collection:
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
            print("DEBUG: Failed to generate AI embedding from OpenRouter. Falling back to local offline search.")
            from .models import Movie
            from django.db.models import Q
            matching_movies = Movie.objects.filter(
                Q(title__icontains=search_query_lower) | 
                Q(overview__icontains=search_query_lower) |
                Q(genres__icontains=search_query_lower) |
                Q(cast__icontains=search_query_lower)
            ).only('tmdb_id')
            pool_ids = [m.tmdb_id for m in matching_movies]
            print(f"DEBUG: Local search found {len(pool_ids)} matching movies.")

    # ══════════════════════════════════════════════════════════
    # PIPELINE 1: QUERY CONTEXT (mandatory filters — always primary)
    # Genre/Mood/Search filters are HARD constraints.
    # ══════════════════════════════════════════════════════════
    query_results = []
    
    if search_query and search_query.strip():
        # Keyword search — restrict to pool
        if pool_ids:
            pool_str = "[" + ",".join(map(str, pool_ids)) + "]"
            query = f"recommend_movie_in_pool('{pref_genre}', '{pref_mood}', {user_age}, {pool_str}, ID, Title, Explanation, Popularity)"
            try:
                query_results = list(prolog.query(query))
                
                # Fallbacks strictly within the semantic pool
                if not query_results and pref_mood != 'any':
                    query_results.extend(list(prolog.query(f"recommend_movie_in_pool('{pref_genre}', 'any', {user_age}, {pool_str}, ID, Title, Explanation, Popularity)")))
                if not query_results and pref_genre != 'any':
                    query_results.extend(list(prolog.query(f"recommend_movie_in_pool('any', '{pref_mood}', {user_age}, {pool_str}, ID, Title, Explanation, Popularity)")))
                if not query_results:
                    query_results.extend(list(prolog.query(f"recommend_movie_in_pool('any', 'any', {user_age}, {pool_str}, ID, Title, Explanation, Popularity)")))
            except Exception as e:
                print(f"Error querying search pool: {e}")
    else:
        # No search query — global recommendation based on Genre/Mood
        query = f"recommend_movie('{pref_genre}', '{pref_mood}', {user_age}, ID, Title, Explanation, Popularity)"
        try:
            query_results = list(prolog.query(query))
            
            # Fallbacks evaluated ONLY against query_results
            if not query_results and pref_mood != 'any':
                query_results.extend(list(prolog.query(f"recommend_movie('{pref_genre}', 'any', {user_age}, ID, Title, Explanation, Popularity)")))
            if not query_results and pref_genre != 'any':
                query_results.extend(list(prolog.query(f"recommend_movie('any', '{pref_mood}', {user_age}, ID, Title, Explanation, Popularity)")))
            if not query_results:
                query_results.extend(list(prolog.query(f"recommend_movie('any', 'any', {user_age}, ID, Title, Explanation, Popularity)")))
        except Exception as e:
            print(f"Error querying global recommendations: {e}")

    # ══════════════════════════════════════════════════════════
    # PIPELINE 2: TRAINING CONTEXT (soft ranking signal — never overrides)
    # Swipe likes boost ranking of filter-matching movies only.
    # ══════════════════════════════════════════════════════════
    training_titles = set()  # Titles the user liked — used for ranking boost only
    
    if user_id:
        try:
            collab_query = f"recommend_similar_to_liked({user_id}, {user_age}, ID, Title, Explanation, Popularity)"
            training_results = list(prolog.query(collab_query))
            for r in training_results:
                t = r.get("Title")
                if t:
                    title = t.decode('utf-8') if isinstance(t, bytes) else str(t)
                    training_titles.add(title)
        except:
            pass
    
    print(f"DEBUG: Query context returned {len(query_results)} results. Training context found {len(training_titles)} liked-similar titles.")

    # ══════════════════════════════════════════════════════════
    # MERGE: Query results are primary. Training data only boosts rank.
    # ══════════════════════════════════════════════════════════
    try:
        unique_matches = {}
        for res in query_results:
            title_raw = res.get("Title")
            if not title_raw: continue
            title = title_raw.decode('utf-8') if isinstance(title_raw, bytes) else str(title_raw)
            explanation_raw = res.get("Explanation", "")
            explanation = explanation_raw.decode('utf-8') if isinstance(explanation_raw, bytes) else str(explanation_raw)
            popularity = int(res.get("Popularity", 50))
            
            # SOFT BOOST: If this movie also appears in training context, give it a gentle rank boost
            if title in training_titles:
                popularity += 500  # Soft signal, not hard override
                explanation = explanation + " ⭐ Also matches your watch history!"
            
            if title not in unique_matches:
                unique_matches[title] = {"title": title, "explanation": explanation, "popularity": popularity}
                
        import random
        match_list = list(unique_matches.values())
        random.shuffle(match_list) # Shuffle first to break ties randomly
        sorted_matches = sorted(match_list, key=lambda x: x['popularity'], reverse=True)[:500]
        
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
