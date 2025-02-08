async function fetchAnime() {
    const query = `
      query {
        Page(page: 1, perPage: 10) {
          media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
      }
    `;
  
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query })
    });
  
    const data = await response.json();
    displayAnime(data.data.Page.media);
  }
  
  function displayAnime(animes) {
    const animeCarousel = document.getElementById('anime-carousel');
    animeCarousel.innerHTML = ''; // Clear previous results
  
    animes.forEach(anime => {
      const animeCard = document.createElement('div');
      animeCard.className = 'card';
  
      const animeImage = document.createElement('img');
      animeImage.src = anime.coverImage.large;
      animeImage.alt = anime.title.romaji || anime.title.english;
  
      const animeTitle = document.createElement('div');
      animeTitle.className = 'card-title';
      animeTitle.textContent = anime.title.romaji || anime.title.english;
  
      animeCard.appendChild(animeImage);
      animeCard.appendChild(animeTitle);
      animeCarousel.appendChild(animeCard);
    });
  }
  
  document.addEventListener('DOMContentLoaded', fetchAnime);