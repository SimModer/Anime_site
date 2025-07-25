import requests
from jinja2 import Environment, FileSystemLoader
import os

def get_anime_data(anime_id):
    url = "https://graphql.anilist.co"

    query = '''
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
        }
        type
        genres
        description(asHtml: false)
        isAdult
        season
        seasonYear
        startDate { year month day }
        endDate { year month day }
        status
        episodes
        duration
        studios(isMain: true) {
          nodes {
            name
          }
        }
        characters(role: MAIN, sort: [ROLE, RELEVANCE, ID]) {
          nodes {
            name { full }
          }
        }
      }
    }
    '''

    variables = {'id': anime_id}
    response = requests.post(url, json={'query': query, 'variables': variables})
    if response.status_code != 200:
        raise Exception(f"Query failed: {response.status_code} - {response.text}")

    media = response.json()['data']['Media']

    return {
        "id": media["id"],
        "image": media["coverImage"]["large"],
        "title_english": media["title"].get("english") or media["title"]["romaji"],
        "title_japanese": media["title"]["native"],
        "type": media["type"],
        "genres": media["genres"],
        "description": media["description"],
        "isAdult": media["isAdult"],
        "season": media.get("season", "N/A"),
        "seasonYear": media.get("seasonYear", "N/A"),
        "startDate": f"{media['startDate']['year']}-{media['startDate']['month']:02}-{media['startDate']['day']:02}" if media.get("startDate") else "N/A",
        "endDate": f"{media['endDate']['year']}-{media['endDate']['month']:02}-{media['endDate']['day']:02}" if media.get("endDate") else "N/A",
        "main_characters": [char["name"]["full"] for char in media["characters"]["nodes"]],
        "episodes": media.get("episodes"),
        "duration": f"{media['duration']} წთ/სერია" if media.get("duration") else None,
        "status": media.get("status"),
        "studios": media["studios"]["nodes"][0]["name"] if media["studios"]["nodes"] else None
    }

def render_html(data, template_file="anime_template.html", output_file="anime_output.html"):
    base_dir = os.path.dirname(__file__)  # Directory of the current script
    env = Environment(loader=FileSystemLoader(base_dir))
    template = env.get_template(template_file)
    rendered = template.render(**data)
    output_path = os.path.join(base_dir, output_file)  # Full path to output file
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(rendered)
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    anime_id = 1247  # Replace with any AniList ID
    anime_data = get_anime_data(anime_id)
    render_html(anime_data)
