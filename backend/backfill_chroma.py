import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from recommender.models import Movie
from recommender.services import get_openrouter_embedding, get_chroma_collection

def backfill_chroma():
    collection = get_chroma_collection()
    if not collection:
        print("Could not initialize ChromaDB")
        return
        
    movies = Movie.objects.all()
    print(f"Found {movies.count()} movies in database to sync to Chroma DB...")
    
    success_count = 0
    for m in movies:
        text_for_embedding = f"Title: {m.title}. Genres: {', '.join(m.genres)}. Cast: {', '.join(m.cast)}. Overview: {m.overview}"
        embedding = get_openrouter_embedding(text_for_embedding)
        
        if embedding:
            collection.upsert(
                documents=[text_for_embedding],
                embeddings=[embedding],
                metadatas=[{"tmdb_id": m.tmdb_id, "title": m.title}],
                ids=[str(m.tmdb_id)]
            )
            success_count += 1
            if success_count % 10 == 0:
                print(f"Synced {success_count} movies...")
        else:
            print(f"Failed to generate embedding for {m.title}")
            
    print(f"Finished backfilling {success_count} movies into Chroma DB.")

if __name__ == "__main__":
    backfill_chroma()
