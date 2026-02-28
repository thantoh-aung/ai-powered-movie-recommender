from django.core.management.base import BaseCommand
from recommender.models import Movie
from recommender.services import get_openrouter_embedding, get_chroma_collection

class Command(BaseCommand):
    help = 'Backfills ChromaDB with existing movies in the SQLite database'

    def handle(self, *args, **kwargs):
        self.stdout.write("Initializing ChromaDB...")
        collection = get_chroma_collection()
        if not collection:
            self.stdout.write(self.style.ERROR("Could not initialize ChromaDB"))
            return
            
        movies = Movie.objects.all()
        count = movies.count()
        self.stdout.write(f"Found {count} movies in database to sync to Chroma DB...")
        
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
                    self.stdout.write(self.style.SUCCESS(f"Synced {success_count}/{count} movies..."))
            else:
                self.stdout.write(self.style.WARNING(f"Failed to generate embedding for {m.title}"))
                
        self.stdout.write(self.style.SUCCESS(f"Finished backfilling {success_count} movies into Chroma DB!"))
