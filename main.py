import requests
import sqlite3
import time
import logging
from requests.exceptions import RequestException, HTTPError

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# MyAnimeList API URL
API_URL = "https://api.myanimelist.net/v2/anime"

# Your MyAnimeList API Key
API_KEY = "your_mal_api_key"  # Replace with your actual API key

# Function to fetch all anime data with pagination
def fetch_all_anime():
    page = 1
    limit = 50  # MyAnimeList allows max 50 per request
    all_anime = []
    headers = {"Authorization": f"Bearer {API_KEY}"}

    while True:
        params = {"limit": limit, "offset": (page - 1) * limit}
        try:
            response = requests.get(API_URL, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            anime_list = data.get("data", [])
            all_anime.extend(anime_list)

            logging.info(f"Fetched {len(anime_list)} anime from page {page}...")

            if len(anime_list) < limit:
                break
            page += 1
            time.sleep(1)  # Delay to avoid API rate limits
        except HTTPError as http_err:
            logging.error(f"HTTP error occurred: {http_err}")
            if response.status_code == 429:
                logging.warning("Rate limit exceeded. Retrying in 60 seconds...")
                time.sleep(60)
            else:
                break
        except RequestException as req_err:
            logging.error(f"Request exception occurred: {req_err}")
            break

    logging.info(f"Total anime fetched: {len(all_anime)}")
    return all_anime

# Function to create the database and table
def create_database():
    with sqlite3.connect("anime.db") as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS anime (
                id INTEGER PRIMARY KEY,
                title TEXT,
                description TEXT,
                episodes INTEGER,
                status TEXT,
                start_date TEXT,
                end_date TEXT,
                genres TEXT,
                score REAL,
                popularity INTEGER,
                studios TEXT,
                cover_image TEXT
            )
        ''')
        conn.commit()

# Function to insert or update anime data
def insert_or_update_anime(anime_list):
    with sqlite3.connect("anime.db") as conn:
        cursor = conn.cursor()
        anime_data = [
            (
                anime["node"]["id"],
                anime["node"]["title"],
                anime["node"].get("synopsis", ""),
                anime["node"].get("num_episodes", 0),
                anime["node"]["status"],
                anime["node"].get("start_date", ""),
                anime["node"].get("end_date", ""),
                ", ".join([genre["name"] for genre in anime["node"].get("genres", [])]),
                anime["node"].get("mean", 0),
                anime["node"].get("popularity", 0),
                ", ".join([studio["name"] for studio in anime["node"].get("studios", [])]),
                anime["node"]["main_picture"]["large"]
            )
            for anime in anime_list
        ]
        cursor.executemany('''
            INSERT INTO anime (id, title, description, episodes, status, start_date, end_date, genres, score, popularity, studios, cover_image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                description = excluded.description,
                episodes = excluded.episodes,
                status = excluded.status,
                start_date = excluded.start_date,
                end_date = excluded.end_date,
                genres = excluded.genres,
                score = excluded.score,
                popularity = excluded.popularity,
                studios = excluded.studios,
                cover_image = excluded.cover_image
        ''', anime_data)
        conn.commit()

# Function to continuously update the database at the minimum interval
def update_loop(interval=300):  # Updates every 5 minutes
    while True:
        logging.info("Starting anime database update...")
        anime_list = fetch_all_anime()
        
        if anime_list:
            insert_or_update_anime(anime_list)
            logging.info("Anime database successfully updated!")
        
        logging.info(f"Waiting {interval} seconds before the next update...")
        time.sleep(interval)

# Main function
if __name__ == "__main__":
    create_database()
    update_loop(interval=300)  # Updates every 5 minutes
