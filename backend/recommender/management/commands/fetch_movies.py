from django.core.management.base import BaseCommand
from recommender.tasks import sync_movies_with_tmdb

class Command(BaseCommand):
    help = 'Fetches new movies from TMDB (up to 500)'

    def add_arguments(self, parser):
        parser.add_argument('--pages', type=int, default=25, help='Number of pages to fetch (20 movies per page)')

    def handle(self, *args, **options):
        pages = options['pages']
        self.stdout.write(f"Starting TMDB sync for {pages} pages (approx {pages*20} movies)...")
        self.stdout.write("This may take a few minutes due to rate-limiting safety sleeps...")
        
        count = sync_movies_with_tmdb(max_pages=pages)
        
        self.stdout.write(self.style.SUCCESS(f"Successfully processed {count} movies!"))
