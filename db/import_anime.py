import sqlite3, csv, os, glob, sys, json, re

DB_NAME = "media.db"

MEDIA_COLUMNS = [
    "id","name","english_name","japanese_name","other_name","russian",
    "type","episodes","episodes_aired","volumes","chapters",
    "aired","aired_on","released_on","premiered","producers",
    "licensors","studios","source","duration","rating",
    "genres","status","synopsis","poster_url"
]

HEADER_MAPPING = {
    "MAL_ID":"id","anime_id":"id","id":"id",
    "Name":"name","name":"name","English name":"english_name",
    "Japanese name":"japanese_name","Other name":"other_name","russian":"russian",
    "Image URL":"poster_url",
    "kind":"type","Type":"type","type":"type",
    "Episodes":"episodes","episodes":"episodes","episodes_aired":"episodes_aired",
    "volumes":"volumes","chapters":"chapters",
    "Aired":"aired","aired_on":"aired_on","released_on":"released_on","Premiered":"premiered",
    "Producers":"producers","Licensors":"licensors","Studios":"studios","Source":"source",
    "Duration":"duration","Rating":"rating",
    "Genres":"genres","genre":"genres",
    "Status":"status","status":"status",
    "Synopsis":"synopsis","synopsis":"synopsis","sypnopsis":"synopsis"
}

MAL_RE = re.compile(r"myanimelist\.net/anime/(\d+)")
ANILIST_RE = re.compile(r"anilist\.co/anime/(\d+)")
KITSU_RE = re.compile(r"kitsu\.io/anime/(\d+)")

def get_script_dir():
    return os.path.dirname(os.path.abspath(__file__))

def find_files(dir, ext):
    return glob.glob(os.path.join(dir, f"*.{ext}"))

def create_media_table(c):
    c.execute(f"""
        CREATE TABLE IF NOT EXISTS media (
            {', '.join(
                f"{col} INTEGER" if col in ('id','episodes','episodes_aired','volumes','chapters')
                else f"{col} TEXT"
                for col in MEDIA_COLUMNS
            )},
            PRIMARY KEY(id)
        )
    """)

def map_row(row):
    return {
        db_col: row[csv_col]
        for csv_col, db_col in HEADER_MAPPING.items()
        if csv_col in row
    }

def import_csv(c, fn):
    with open(fn, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = []
        for row in reader:
            mapped = map_row(row)
            rows.append([mapped.get(col) for col in MEDIA_COLUMNS])

    c.executemany(
        f"INSERT OR REPLACE INTO media ({','.join(MEDIA_COLUMNS)}) "
        f"VALUES ({','.join('?' * len(MEDIA_COLUMNS))})",
        rows
    )
    print(f"✅ Imported CSV: {os.path.basename(fn)}")

def extract_id_from_sources(sources):
    if not sources:
        return None
    for s in sources:
        for r in (MAL_RE, ANILIST_RE, KITSU_RE):
            m = r.search(s)
            if m:
                return int(m.group(1))
    return None

def import_jsonl(c, fn):
    rows = []
    with open(fn, encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue

            e = json.loads(line)

            m = {col: None for col in MEDIA_COLUMNS}

            m.update({
                "id": extract_id_from_sources(e.get("sources")),
                "name": e.get("title"),
                "type": e.get("type"),
                "episodes": e.get("episodes"),
                "status": e.get("status"),
                "genres": ", ".join(e.get("tags", [])),
                "poster_url": e.get("picture")
            })

            season = e.get("animeSeason", {}).get("season")
            year = e.get("animeSeason", {}).get("year")

            if year:
                m["aired_on"] = f"{year}-01-01"
                m["premiered"] = f"{season} {year}" if season else str(year)

            rows.append([m[col] for col in MEDIA_COLUMNS])

    c.executemany(
        f"INSERT OR REPLACE INTO media ({','.join(MEDIA_COLUMNS)}) "
        f"VALUES ({','.join('?' * len(MEDIA_COLUMNS))})",
        rows
    )
    print(f"✅ Imported {len(rows)} entries from {os.path.basename(fn)}")

def remove_duplicates(c):
    c.execute("""
        DELETE FROM media
        WHERE rowid NOT IN (
            SELECT MAX(rowid)
            FROM media
            GROUP BY id, name
        )
    """)
    print("🗑️ Removed duplicate rows.")

def main():
    d = get_script_dir()
    csvs = find_files(d, "csv")
    jsonls = find_files(d, "jsonl")

    if not csvs and not jsonls:
        print("❌ No CSV or JSONL files found.")
        sys.exit(1)

    with sqlite3.connect(os.path.join(d, DB_NAME)) as conn:
        c = conn.cursor()
        create_media_table(c)

        for f in csvs:
            import_csv(c, f)

        for f in jsonls:
            import_jsonl(c, f)

        remove_duplicates(c)
        conn.commit()

    print(f"🎉 Database '{DB_NAME}' updated successfully!")

if __name__ == "__main__":
    main()