const CONFIG = Object.freeze({
  API_URL: "https://graphql.anilist.co",
  ITEMS_PER_PAGE: 30
});

let currentPage = 1;
let isLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  fetchOngoingAnimes();

  // Infinite scroll
  window.addEventListener('scroll', () => {
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 100; // 100px from bottom

    if (scrollPosition >= threshold && !isLoading) {
      currentPage++;
      fetchOngoingAnimes();
    }
  });
});

async function fetchOngoingAnimes() {
  if (isLoading) return;
  isLoading = true;
  toggleLoading(true);

  const query = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(status: RELEASING, type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
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
      body: JSON.stringify({ query, variables: { page: currentPage, perPage: CONFIG.ITEMS_PER_PAGE } })
    });

    const json = await res.json();
    const animes = json?.data?.Page?.media || [];

    if (animes.length === 0 && currentPage > 1) {
      // No more items
      window.removeEventListener('scroll', this);
    }

    renderAnimes(animes);
  } catch {
    showError("შეცდომა მოხდა. სცადეთ მოგვიანებით.");
  } finally {
    toggleLoading(false);
    isLoading = false;
  }
}

function renderAnimes(animes) {
  const grid = document.getElementById('anime-grid');
  animes.forEach(anime => {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.innerHTML = `
      <img src="${anime.coverImage.large}" alt="${anime.title.romaji}" class="anime-poster" />
      <div class="anime-info">
        <div class="anime-title">${anime.title.romaji || anime.title.english}</div>
        <div class="anime-meta">${anime.studios?.nodes?.[0]?.name || "სტუდია უცნობია"}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function toggleLoading(show) {
  const loader = document.querySelector('.loading-indicator');
  loader.style.display = show ? 'block' : 'none';
}

function showError(msg) {
  let el = document.querySelector('.error-message');
  if (!el) {
    el = document.createElement('div');
    el.className = 'error-message';
    document.querySelector('.content-container')?.prepend(el);
  }
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 5000);
}
