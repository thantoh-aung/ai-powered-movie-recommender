import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from recommender.services import get_chroma_collection, get_recommendations
col = get_chroma_collection()
print('Chroma entries:', col.count() if col else 0)

print("\n--- Testing Matrix Search ---")
res = get_recommendations('any', 'any', 18, search_query='matrix')
print('Matrix Found Count:', len(res))
if res:
   print(res[0]['title'])
   
   
