from django.apps import AppConfig
import sys

class RecommenderConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'recommender'

    def ready(self):
        # Prevent loading KB during migrations or collectstatic
        if any(cmd in sys.argv for cmd in ['makemigrations', 'migrate', 'collectstatic', 'test']):
            return
            
        try:
            from .services import load_prolog_kb
            load_prolog_kb()
        except Exception as e:
            print(f"Failed to auto-load Prolog KB: {e}")
