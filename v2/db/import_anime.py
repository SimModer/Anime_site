import sqlite3
import csv
import os
import glob

# Folder of the script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Database filename (in same folder as script)
db_filename = os.path.join(script_dir, "anime.db")

# Auto-detect all CSV files in the folder
csv_files = glob.glob(os.path.join(script_dir, "*.csv"))

if not csv_files:
    print("⚠️ No CSV files found in the folder.")
    exit()

# Connect to SQLite database (creates file if not exists)
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

# Possible alternative column names
TITLE_COLS = ["title", "name"]
TYPE_COLS = ["type", "kind"]
RATING_COLS = ["rating", "score_rating"]
SYNOPSIS_COLS = ["description", "synopsis", "summary"]
POSTER_COLS = ["image_url", "poster", "image"]
GENRES_COLS = ["genres", "tags"]

def get_first_available(row, possible_cols):
    """Return the first non-empty value from possible column names."""
    for col in possible_cols:
        val = row.get(col)
        if val and val.strip() != "":
            return val
    return None

# Function to import data from a CSV
def import_csv(filename):
    with open(filename, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cursor.execute("""
            INSERT OR IGNORE INTO anime (
                id, title, type, episodes, status, rating, score,
                synopsis, poster_url, genres, start_date, end_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                row.get("id"),
                get_first_available(row, TITLE_COLS),
                get_first_available(row, TYPE_COLS),
                row.get("episodes"),
                row.get("status"),
                get_first_available(row, RATING_COLS),
                row.get("score"),
                get_first_available(row, SYNOPSIS_COLS),
                get_first_available(row, POSTER_COLS),
                get_first_available(row, GENRES_COLS),
                row.get("aired_on"),
                row.get("released_on")
            ))
    print(f"✅ Imported {os.path.basename(filename)}")

# Import all CSV files
for file in csv_files:
    import_csv(file)

conn.commit()
conn.close()

print(f"🎉 Database '{db_filename}' created and filled with anime data from {len(csv_files)} CSV files!")
