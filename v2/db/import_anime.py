import sqlite3
import csv
import os
import glob
import requests
import time

# Folder of the script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Database filename
db_filename = os.path.join(script_dir, "media.db")

# Remove existing DB if exists
if os.path.exists(db_filename):
    os.remove(db_filename)
    print(f"⚠️ Existing database '{db_filename}' removed, creating a new one.")

# Auto-detect all CSV files
csv_files = glob.glob(os.path.join(script_dir, "*.csv"))
if not csv_files:
    exit()

# Connect to SQLite database
conn = sqlite3.connect(db_filename)
cursor = conn.cursor()

# Create media table (anime, manga, novels)
cursor.execute("""
CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY,
    title TEXT,
    type TEXT,
    episodes INTEGER,
    chapters INTEGER,
    volumes INTEGER,
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

# Function to import CSV
def import_csv(filename):
    with open(filename, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            media_id = row.get("id")
            title = row.get("name") or row.get("title")
            type_ = row.get("kind") or row.get("type")  # anime, manga, novel
            status = row.get("status")
            score = row.get("score") or row.get("rating")
            episodes = row.get("episodes") if type_ == "anime" else None
            chapters = row.get("chapters") if type_ == "manga" else None
            volumes = row.get("volumes")
            start_date = row.get("aired_on") or row.get("published_on") or row.get("start_date")
            end_date = row.get("released_on") or row.get("end_date")

            cursor.execute("""
            INSERT OR IGNORE INTO media (
                id, title, type, episodes, chapters, volumes, status,
                rating, score, synopsis, poster_url, genres, start_date, end_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                media_id, title, type_, episodes, chapters, volumes, status,
                None, score, None, None, None, start_date, end_date
            ))
    print(f"✅ Imported {os.path.basename(filename)}")

# Import all CSV files
for file in csv_files:
    import_csv(file)
conn.commit()

# Remove duplicates based on ID, keep first
cursor.execute("""
DELETE FROM media
WHERE rowid NOT IN (
    SELECT MIN(rowid)
    FROM media
    GROUP BY id
)
""")
conn.commit()

# AniList GraphQL endpoint
ANILIST_API = "https://graphql.anilist.co"

# Function to fetch media info from AniList (errors silently skipped)
def fetch_anilist_data(title, type_):
    media_type = "ANIME" if type_ == "anime" else "MANGA"
    query = '''
    query ($search: String, $type: MediaType) {
      Media(search: $search, type: $type) {
        averageScore
        description(asHtml: false)
        genres
        coverImage { large }
      }
    }
    '''
    variables = {"search": title, "type": media_type}
    try:
        response = requests.post(ANILIST_API, json={'query': query, 'variables': variables}, timeout=10)
        data = response.json()
        media = data.get("data", {}).get("Media")
        if media:
            return {
                "rating": None,
                "synopsis": media.get("description"),
                "poster_url": media.get("coverImage", {}).get("large"),
                "genres": ", ".join(media.get("genres", [])),
                "score": media.get("averageScore")
            }
    except:
        return {}
    return {}

# Update missing info from AniList
cursor.execute("SELECT id, title, type FROM media WHERE synopsis IS NULL OR poster_url IS NULL OR genres IS NULL")
rows = cursor.fetchall()
print(f"ℹ️ Updating {len(rows)} items with AniList API...")

for media_id, title, type_ in rows:
    info = fetch_anilist_data(title, type_)
    if info:
        cursor.execute("""
        UPDATE media
        SET rating = ?, synopsis = ?, poster_url = ?, genres = ?, score = ?
        WHERE id = ?
        """, (
            info.get("rating"),
            info.get("synopsis"),
            info.get("poster_url"),
            info.get("genres"),
            info.get("score"),
            media_id
        ))
        conn.commit()
        time.sleep(0.5)  # avoid hitting rate limits

print("🎉 AniList API update completed!")

conn.close()
print(f"🎉 Database '{db_filename}' created, duplicates removed, and missing info updated!")