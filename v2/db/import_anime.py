import sqlite3
import csv
import os
import glob
import sys

DB_NAME = "media.db"

# Target DB schema
MEDIA_COLUMNS = [
    "id", "name", "english_name", "japanese_name", "other_name", "russian",
    "url", "kind", "type", "episodes", "episodes_aired",
    "volumes", "chapters", "aired", "aired_on", "released_on",
    "premiered", "producers", "licensors", "studios", "source",
    "duration", "rating", "ranked", "popularity", "score",
    "genres", "status", "synopsis", "poster_url"
]

# CSV headers → DB columns
HEADER_MAPPING = {
    "MAL_ID": "id", "anime_id": "id", "id": "id",
    "Name": "name", "name": "name", "English name": "english_name",
    "Japanese name": "japanese_name", "Other name": "other_name", "russian": "russian",
    "url": "url", "Image URL": "poster_url",
    "kind": "kind", "Type": "type", "type": "type",
    "Episodes": "episodes", "episodes": "episodes", "episodes_aired": "episodes_aired",
    "volumes": "volumes", "chapters": "chapters",
    "Aired": "aired", "aired_on": "aired_on", "released_on": "released_on", "Premiered": "premiered",
    "Producers": "producers", "Licensors": "licensors", "Studios": "studios", "Source": "source",
    "Duration": "duration", "Rating": "rating", "Ranked": "ranked", "Rank": "ranked",
    "Popularity": "popularity", "Score": "score", "score": "score",
    "Genres": "genres", "genre": "genres",
    "Status": "status", "status": "status",
    "Synopsis": "synopsis", "synopsis": "synopsis", "sypnopsis": "synopsis"
}

def get_script_dir():
    return os.path.dirname(os.path.abspath(__file__))

def find_csv_files(script_dir):
    files = glob.glob(os.path.join(script_dir, "*.csv"))
    if not files:
        print("❌ No CSV files found. Exiting.")
        sys.exit()
    return files

def create_media_table(cursor):
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY, name TEXT, english_name TEXT, japanese_name TEXT,
        other_name TEXT, russian TEXT, url TEXT, kind TEXT, type TEXT,
        episodes INTEGER, episodes_aired INTEGER, volumes INTEGER, chapters INTEGER,
        aired TEXT, aired_on TEXT, released_on TEXT, premiered TEXT,
        producers TEXT, licensors TEXT, studios TEXT, source TEXT,
        duration TEXT, rating TEXT, ranked INTEGER, popularity INTEGER,
        score REAL, genres TEXT, status TEXT, synopsis TEXT, poster_url TEXT
    )
    """)

def map_row(row):
    """Map CSV row to DB columns efficiently."""
    return {col: row.get(csv_col, None) for csv_col, col in HEADER_MAPPING.items() if csv_col in row}

def import_csv(cursor, filename):
    with open(filename, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            mapped = {col: None for col in MEDIA_COLUMNS}
            mapped.update(map_row(row))
            values = [mapped[col] for col in MEDIA_COLUMNS]
            cursor.execute(f"""
                INSERT OR REPLACE INTO media ({','.join(MEDIA_COLUMNS)})
                VALUES ({','.join('?' for _ in MEDIA_COLUMNS)})
            """, values)
    print(f"✅ Imported/updated {os.path.basename(filename)}")

def remove_duplicates(cursor):
    cursor.execute("""
        DELETE FROM media
        WHERE rowid NOT IN (
            SELECT MAX(rowid) FROM media GROUP BY id
        )
    """)
    print("🗑️ Removed duplicate rows by id (kept latest).")

def main():
    script_dir = get_script_dir()
    db_path = os.path.join(script_dir, DB_NAME)
    csv_files = find_csv_files(script_dir)

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        create_media_table(cursor)
        for file in csv_files:
            import_csv(cursor, file)
        remove_duplicates(cursor)
        conn.commit()

    print(f"🎉 Database '{db_path}' created/updated successfully from CSVs!")

if __name__ == "__main__":
    main()