import sqlite3
import csv
import os
import glob
import requests

# Folder of the script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Database filename
db_filename = os.path.join(script_dir, "anime.db")

# CSV files to import
csv_files = glob.glob(os.path.join(script_dir, "*.csv"))

if not csv_files:
    print("⚠️ No CSV files found in the folder.")
    exit()

# Connect to SQLite database
conn = sqlite3.connect(db_filename)
cursor = conn.cursor()

# Create anime table
cursor.execute("""
CREATE TABLE IF NOT EXISTS anime (
    id INTEGER PRIMARY KEY,
    title TEXT,
    type TEXT,
    episodes INTEGER,
    status TEXT,
    rating TEXT,
    score REAL,
    synopsis TEXT,
    poster_url TEXT,
    genres TEXT,
    start_date TEXT,
    end_date TEXT
)
""")
conn.commit()

# AniList GraphQL query
ANILIST_URL = "https://graphql.anilist.co"
def fetch_anilist_info(title):
    query = '''
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        averageScore
        description
        genres
        coverImage {
          large
        }
        source
        status
        episodes
        format
        title {
          romaji
          english
          native
        }
      }
    }
    '''
    variables = {"search": title}
    try:
        response = requests.post(ANILIST_URL, json={"query": query, "variables": variables})
        data = response.json()
        if "data" in data and "Media" in data["data"]:
            media = data["data"]["Media"]
            return {
                "rating": None,  # AniList rating type not directly matching MyAnimeList
                "synopsis": media.get("description"),
                "poster_url": media.get("coverImage", {}).get("large"),
                "genres": ", ".join(media.get("genres", [])),
                "score": media.get("averageScore")
            }
    except Exception as e:
        print(f"⚠️ AniList API error for '{title}': {e}")
    return {}

# Function to import CSV
def import_csv(filename):
    with open(filename, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            anime_id = row.get("id")
            title = row.get("name")
            type_ = row.get("kind")
            episodes = row.get("episodes")
            status = row.get("status")
            score = row.get("score")
            aired_on = row.get("aired_on")
            released_on = row.get("released_on")

            cursor.execute("""
            INSERT OR IGNORE INTO anime (
                id, title, type, episodes, status, rating, score,
                synopsis, poster_url, genres, start_date, end_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                anime_id,
                title,
                type_,
                episodes,
                status,
                None,
                score,
                None,
                None,
                None,
                aired_on,
                released_on
            ))

# Import all CSV files
for file in csv_files:
    import_csv(file)
conn.commit()

# Remove duplicates based on title, keep first
cursor.execute("""
DELETE FROM anime
WHERE rowid NOT IN (
    SELECT MIN(rowid)
    FROM anime
    GROUP BY title
)
""")
conn.commit()

# Update missing info using AniList
cursor.execute("SELECT id, title, rating, synopsis, poster_url, genres FROM anime")
all_rows = cursor.fetchall()

for anime_id, title, rating, synopsis, poster_url, genres in all_rows:
    if not all([rating, synopsis, poster_url, genres]):
        info = fetch_anilist_info(title)
        if info:
            cursor.execute("""
            UPDATE anime
            SET rating = COALESCE(rating, ?),
                synopsis = COALESCE(synopsis, ?),
                poster_url = COALESCE(poster_url, ?),
                genres = COALESCE(genres, ?),
                score = COALESCE(score, ?)
            WHERE id = ?
            """, (
                info.get("rating"),
                info.get("synopsis"),
                info.get("poster_url"),
                info.get("genres"),
                info.get("score"),
                anime_id
            ))

conn.commit()
conn.close()

print(f"🎉 Database '{db_filename}' created, duplicates removed, and API info filled!")
