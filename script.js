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
  displayAnime(data.data.Page.media, 'anime-carousel');
}

async function fetchOngoingAnime(page = 1) {
  const query = `
    query {
      Page(page: ${page}, perPage: 50) {
        media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC, genre_not_in: ["Hentai"]) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
        }
        pageInfo {
          currentPage
          lastPage
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
  displayAnime(data.data.Page.media, 'ongoing-anime-grid');
  updatePagination(data.data.Page.pageInfo);
}

function displayAnime(animes, gridId) {
  const animeGrid = document.getElementById(gridId);
  animeGrid.innerHTML = ''; // Clear previous results

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
    animeGrid.appendChild(animeCard);
  });
}

function updatePagination(pageInfo) {
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');
  const pageInfoSpan = document.getElementById('page-info');

  if (pageInfo.currentPage === 1) {
    prevButton.disabled = true;
  } else {
    prevButton.disabled = false;
  }

  if (pageInfo.currentPage === pageInfo.lastPage) {
    nextButton.disabled = true;
  } else {
    nextButton.disabled = false;
  }

  pageInfoSpan.textContent = `Page ${pageInfo.currentPage}`;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('anime-carousel')) {
    fetchAnime();
  }
  if (document.getElementById('ongoing-anime-grid')) {
    fetchOngoingAnime();
  }

  document.getElementById('prev-page').addEventListener('click', () => {
    const currentPage = parseInt(document.getElementById('page-info').textContent.split(' ')[1]);
    fetchOngoingAnime(currentPage - 1);
  });

  document.getElementById('next-page').addEventListener('click', () => {
    const currentPage = parseInt(document.getElementById('page-info').textContent.split(' ')[1]);
    fetchOngoingAnime(currentPage + 1);
  });
});