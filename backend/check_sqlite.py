import sqlite3

db_path = r"c:\Users\MSI\Desktop\AI-Prolog\backend\db.sqlite3"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

try:
    cur.execute("SELECT title FROM recommender_movie")
    movies = cur.fetchall()
    
    non_ascii_count = 0
    non_ascii_examples = []
    
    for m in movies:
        title = m[0]
        try:
            title.encode('ascii')
        except UnicodeEncodeError:
            non_ascii_count += 1
            if len(non_ascii_examples) < 10:
                non_ascii_examples.append(title)
                
    print(f"Total titles: {len(movies)}")
    print(f"Titles with non-ASCII characters: {non_ascii_count}")
    print("Examples:")
    for ex in non_ascii_examples:
        print(f" - {ex}")
        
except Exception as e:
    print("Database error:", e)
finally:
    conn.close()
