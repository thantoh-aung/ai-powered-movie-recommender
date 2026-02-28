import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from recommender.models import Movie
from recommender.services import get_recommendations, prolog, load_prolog_kb, get_openrouter_embedding, get_chroma_collection

print("Loading KB")
load_prolog_kb()
print("Movies in KB:", len(list(prolog.query('movie(_,_,_,_,_,_,_)'))))

print("\n--- Test Genre and Vibe ---")
res = get_recommendations('action', 'dark', 18)
print('Action/Dark Found:', len(res))
if res: print("Top match:", res[0]['title'], "-", res[0]['explanation'])

print("\n--- Test Genre only ---")
res = get_recommendations('action', 'any', 18)
print('Action/Any Found:', len(res))
if res: print("Top match:", res[0]['title'])

print("\n--- Test Keyword Search ---")
emb = get_openrouter_embedding("batman")
print("Embedding generated:", "Yes" if emb else "No")
col = get_chroma_collection()
print("Chroma items count:", col.count() if col else "None")

res_search = get_recommendations('any', 'any', 18, search_query='batman')
print('Search Query "batman" Found:', len(res_search))
if res_search: print("Top match:", res_search[0]['title'], "-", res_search[0]['explanation'])

