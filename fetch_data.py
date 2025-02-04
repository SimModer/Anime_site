import requests
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shikimori_clone.settings')
django.setup()

from anime.models import Anime

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
      averageScore
      coverImage {
        large
      }
    }
  }
}
'''

def fetch_anime_data():
    page = 1
    per_page = 50
    has_next_page = True

    while has_next_page:
        variables = {"page": page, "perPage": per_page}
        response = requests.post(API_URL, json={'query': QUERY, 'variables': variables})
        data = response.json()
        anime_list = data['data']['Page']['media']
        has_next_page = data['data']['Page']['pageInfo']['hasNextPage']

        for anime in anime_list:
            Anime.objects.update_or_create(
                title=anime['title']['romaji'],
                defaults={
                    'description': anime['description'],
                    'episodes': anime['episodes'],
                    'score': anime['averageScore'],
                    'image_url': anime['coverImage']['large']
                }
            )

        page += 1

if __name__ == "__main__":
    fetch_anime_data()