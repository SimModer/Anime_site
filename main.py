import requests
import sqlite3
import time

# AniList GraphQL API URL
API_URL = "https://graphql.anilist.co"

# GraphQL Query to Fetch All Anime Data
QUERY = '''
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    }
    media(type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description
      episodes
      duration
      status
      season
      seasonYear
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      genres
      averageScore
      popularity
      studios {
        nodes {
          name
        }
      }
      characters {
        edges {
          node {
            name {
              full
            }
          }
        }
      }
      coverImage {
        large
      }
    }
  }
}
'''

# Function to fetch all anime data with pagination
def fetch_all_anime():
    page = 1
    per_page = 50  # AniList allows max 50 per request
    has_next_page = True
    all_anime = []

    while has_next_page:
        variables = {"page": page, "perPage": per_page}
        response = requests.post(API_URL, json={"query": QUERY, "variables": variables})

        if response.status_code == 200:
            data = response.json()
            anime_list = data["data"]["Page"]["media"]
            has_next_page = data["data"]["Page"]["pageInfo"]["hasNextPage"]

            all_anime.extend(anime_list)
            print(f"Fetched {len(anime_list)} anime from page {page}...")

            page += 1
            time.sleep(1)  # Delay to avoid API rate limits
        else:
            print(f"Error {response.status_code}: {response.text}")
            break

    print(f"Total anime fetched: {len(all_anime)}")
    return all_anime

# Function to create the database and table
def create_database():
    conn = sqlite3.connect("anime.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS anime (
            id INTEGER PRIMARY KEY,
            romaji_title TEXT,
            english_title TEXT,
            native_title TEXT,
            description TEXT,
            episodes INTEGER,
            duration INTEGER,
            status TEXT,
            season TEXT,
            season_year INTEGER,
            start_date TEXT,
            end_date TEXT,
            genres TEXT,
            average_score INTEGER,
            popularity INTEGER,
            studios TEXT,
            characters TEXT,
            cover_image TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Function to insert or update anime data
def insert_or_update_anime(anime_list):
    conn = sqlite3.connect("anime.db")
    cursor = conn.cursor()

    for anime in anime_list:
        cursor.execute('''
            INSERT INTO anime (id, romaji_title, english_title, native_title, description, episodes, duration, status, 
                              season, season_year, start_date, end_date, genres, average_score, popularity, studios, 
                              characters, cover_image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                romaji_title = excluded.romaji_title,
                english_title = excluded.english_title,
                native_title = excluded.native_title,
                description = excluded.description,
                episodes = excluded.episodes,
                duration = excluded.duration,
                status = excluded.status,
                season = excluded.season,
                season_year = excluded.season_year,
                start_date = excluded.start_date,
                end_date = excluded.end_date,
                genres = excluded.genres,
                average_score = excluded.average_score,
                popularity = excluded.popularity,
                studios = excluded.studios,
                characters = excluded.characters,
                cover_image = excluded.cover_image
        ''', (
            anime["id"],
            anime["title"]["romaji"],
            anime["title"]["english"],
            anime["title"]["native"],
            anime["description"],
            anime["episodes"],
            anime["duration"],
            anime["status"],
            anime["season"],
            anime["seasonYear"],
            f'{anime["startDate"]["year"]}-{anime["startDate"]["month"]}-{anime["startDate"]["day"]}' if anime["startDate"]["year"] else None,
            f'{anime["endDate"]["year"]}-{anime["endDate"]["month"]}-{anime["endDate"]["day"]}' if anime["endDate"]["year"] else None,
            ", ".join(anime["genres"]) if anime["genres"] else None,
            anime["averageScore"],
            anime["popularity"],
            ", ".join([studio["name"] for studio in anime["studios"]["nodes"]]) if anime["studios"]["nodes"] else None,
            ", ".join([char["node"]["name"]["full"] for char in anime["characters"]["edges"]]) if anime["characters"]["edges"] else None,
            anime["coverImage"]["large"]
        ))

    conn.commit()
    conn.close()

# Function to continuously update the database at the minimum interval
def update_loop(interval=5):  # Updates every 5 seconds
    while True:
        print("\nStarting anime database update...")
        anime_list = fetch_all_anime()
        
        if anime_list:
            insert_or_update_anime(anime_list)
            print("Anime database successfully updated!")
        
        print(f"Waiting {interval} seconds before the next update...\n")
        time.sleep(interval)

# Main function
if __name__ == "__main__":
    create_database()
    update_loop(interval=5)  # Updates every 5 seconds
