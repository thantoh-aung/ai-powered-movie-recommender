import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
django.setup()

from recommender.services import get_recommendations

print("Testing only genre and mood")
res = get_recommendations("action", "dark", 18, search_query="")
print(f"Genre and Vibe returns {len(res)} results:")
if res:
    print(res[0])
    
print("\nTesting search query")
res2 = get_recommendations("any", "any", 18, search_query="batman")
print(f"Search Query returns {len(res2)} results:")
if res2:
    print(res2[0])
