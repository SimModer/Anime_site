import requests
import sqlite3
import time
import logging
import os
from requests.exceptions import RequestException, HTTPError

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

API_URL = "https://graphql.anilist.co"
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

def fetch_all_anime():
    page = 1
    per_page = 50
    has_next_page = True
    all_anime = []

    while has_next_page:
        variables = {"page": page, "perPage": per_page}
        try:
            response = requests.post(API_URL, json={"query": QUERY, "variables": variables})
            response.raise_for_status()
            data = response.json()
            anime_list = data["data"]["Page"]["media"]
            has_next_page = data["data"]["Page"]["pageInfo"]["hasNextPage"]

            all_anime.extend(anime_list)
            logging.info(f"Fetched {len(anime_list)} anime from page {page}...")

            page += 1
            time.sleep(1)  # To avoid hitting rate limits
        except HTTPError as http_err:
            logging.error(f"HTTP error occurred: {http_err}")
            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 60))
                logging.warning(f"Rate limit exceeded. Retrying in {retry_after} seconds...")
                time.sleep(retry_after)
            else:
                break
        except RequestException as req_err:
            logging.error(f"Request exception occurred: {req_err}")
            break

    logging.info(f"Total anime fetched: {len(all_anime)}")
    return all_anime

def create_database():
    with sqlite3.connect("anime.db") as conn:
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

def insert_or_update_anime(anime_list):
    with sqlite3.connect("anime.db") as conn:
        cursor = conn.cursor()
        anime_data = [
            (
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
            )
            for anime in anime_list
        ]
        try:
            cursor.executemany('''
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
            ''', anime_data)
            conn.commit()
        except sqlite3.Error as db_err:
            logging.error(f"Database error occurred: {db_err}")

def update_database():
    logging.info("Starting anime database update...")
    anime_list = fetch_all_anime()
    
    if anime_list:
        insert_or_update_anime(anime_list)
        logging.info("Anime database successfully updated!")

if __name__ == "__main__":
    create_database()
    update_database()