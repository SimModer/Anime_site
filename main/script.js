const CONFIG = Object.freeze({
  API_URL: "https://graphql.anilist.co",
  ITEMS_PER_PAGE: 20
});

const AppState = {
  searchTerm: '',
  isLoading: false,
  ongoingAnimes: []
};

document.addEventListener("DOMContentLoaded", () => {
  attachEventListeners();
  fetchOngoingAnimes();
});

function attachEventListeners() {
  const input = document.querySelector('.search-box input');
  if (input) input.addEventListener('input', debounce(handleSearch, 300));
}

function handleSearch(e) {
  const term = e.target.value.toLowerCase().trim();
  AppState.searchTerm = term;

  document.querySelectorAll('.anime-card').forEach(card => {
    const title = card.querySelector('.anime-title')?.textContent.toLowerCase() || '';
    const match = !term || title.includes(term);
    card.style.display = match ? 'block' : 'none';
  });
}

async function fetchOngoingAnimes() {
  if (AppState.isLoading) return;
  AppState.isLoading = true;
  toggleLoading(true);

  const query = `
    query {
      Page(perPage: ${CONFIG.ITEMS_PER_PAGE}) {
        media(status: RELEASING, type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
            medium
          }
          studios(isMain: true) {
            nodes {
              name
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ query })
    });

    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    const animes = json?.data?.Page?.media;
    if (!animes) throw new Error("მონაცემები ვერ მოიძებნა");

    AppState.ongoingAnimes = animes;
    renderOngoingAnimes(animes);
  } catch (err) {
    showError("დაფიქსირდა შეცდომა. სცადეთ მოგვიანებით.");
  } finally {
    AppState.isLoading = false;
    toggleLoading(false);
  }
}

function renderOngoingAnimes(animes) {
  const grid = document.getElementById('anime-grid');
  if (!grid) return;
  grid.innerHTML = '';

  animes.forEach(anime => {
    const card = createAnimeCard(anime);
    grid.appendChild(card);
  });
}

function createAnimeCard(anime) {
  const card = document.createElement('div');
  card.className = 'anime-card';
  card.setAttribute('data-anime-id', anime.id);

  const title = anime.title?.romaji || anime.title?.english || 'უსახელო';
  const cover = anime.coverImage?.large || anime.coverImage?.medium || '';
  const studio = anime.studios?.nodes?.[0]?.name || 'სტუდია უცნობია';

  card.innerHTML = `
    <img src="${cover}" alt="${escapeHTML(title)} Cover" class="anime-poster" loading="lazy" />
    <div class="anime-info">
      <div class="anime-title">${escapeHTML(title)}</div>
      <div class="anime-meta">${studio}</div>
    </div>
  `;

  return card;
}

function toggleLoading(show) {
  const loader = document.querySelector('.loading-indicator');
  if (loader) loader.style.display = show ? 'block' : 'none';
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#039;'
  })[char]);
}
