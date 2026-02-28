import requests
import json
import time

URL = "http://127.0.0.0:8000/api/recommend/"

# 1. Test Action / Dark
try:
    print("Testing Action / Dark...")
    res = requests.post(URL, json={"genre": "action", "mood": "dark", "age": 18})
    print(res.status_code)
    data = res.json()
    recs = data.get("recommendations", [])
    print(f"Found {len(recs)} results.")
    if recs: print(recs[0]["title"], "-", recs[0]["explanation"])
except Exception as e:
    print("API Error:", e)

print("\n----------------\n")

# 2. Test Search Batman
try:
    print("Testing Keyword 'batman'...")
    res2 = requests.post(URL, json={"genre": "any", "mood": "any", "age": 18, "search_query": "batman"})
    print(res2.status_code)
    data2 = res2.json()
    recs2 = data2.get("recommendations", [])
    print(f"Found {len(recs2)} results.")
    if recs2: print(recs2[0]["title"], "-", recs2[0]["explanation"])
except Exception as e:
    print("API Error:", e)
