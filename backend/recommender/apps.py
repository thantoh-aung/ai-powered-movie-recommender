from django.apps import AppConfig
import sys

class RecommenderConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'recommender'

    def ready(self):
        # Prevent loading KB during migrations
        if 'runserver' in sys.argv or any('gunicorn' in arg for arg in sys.argv):
            try:
                from .services import load_prolog_kb
                load_prolog_kb()
            except Exception as e:
                print(f"Failed to load Prolog KB from DB on startup: {e}")
