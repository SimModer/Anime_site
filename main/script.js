// Constants (frozen for immutability)
const DAY_REMAP = Object.freeze([6, 0, 1, 2, 3, 4, 5]);
const daysGeorgian = Object.freeze([
  "ორშაბათი", "სამშაბათი", "ოთხშაბათი",
  "ხუთშაბათი", "პარასკევი", "შაბათი", "კვირა"
]);
const monthsGeorgian = Object.freeze([
  "იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", 
  "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"
]);
const CONFIG = Object.freeze({
  API_URL: "https://graphql.anilist.co",
  ITEMS_PER_PAGE: 50,
  ANIMATION_DURATION: 300
});

// State
const AppState = {
  searchTerm: '',
  isLoading: false,
  animeData: new Map()
};

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  setupTodayHighlight();
  setupEventListeners();
  fetchAnimeSchedule();
});

function setupTodayHighlight() {
  const todayIndex = DAY_REMAP[new Date().getDay()];
  const details = document.querySelectorAll("#schedule details")[todayIndex];

  if (details) {
    details.open = true;
    const summary = details.querySelector("summary");
    if (summary) {
      summary.classList.add("today");
      summary.textContent = summary.textContent.replace(/\s*\(დღეს\)/, "");
    }
  }
}

function setupEventListeners() {
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) searchInput.addEventListener('input', debounce(handleSearch, 300));

  document.querySelectorAll('#schedule details').forEach(detail => {
    detail.addEventListener('toggle', handleDetailsToggle);
  });

  document.querySelectorAll('.news-item').forEach(item => {
    item.addEventListener('click', handleNewsClick);
  });

  document.querySelector('.new-anime-button')?.addEventListener('click', handleNewAnimeClick);

  document.querySelectorAll('.auth-buttons button').forEach(btn => {
    btn.addEventListener('click', handleAuthClick);
  });
}

function handleSearch(e) {
  AppState.searchTerm = e.target.value.toLowerCase().trim();
  console.log('Searching for:', AppState.searchTerm);

  document.querySelectorAll('.anime-item').forEach(item => {
    const title = item.querySelector('.anime-title')?.textContent.toLowerCase() || '';
    const match = !AppState.searchTerm || title.includes(AppState.searchTerm);
    item.style.display = match ? 'flex' : 'none';
    if (match) item.classList.add('fade-in-up');
  });
}

function handleDetailsToggle(e) {
  if (e.target.open) {
    e.target.querySelector('.anime-list')?.classList.add('fade-in-up');
  }
}

function handleNewsClick(e) {
  const item = e.currentTarget;
  const title = item.querySelector('h3')?.textContent || 'Unknown';

  console.log('News item clicked:', title);
  item.style.transform = 'scale(0.98)';
  setTimeout(() => item.style.transform = 'scale(1)', 150);
}

function handleNewAnimeClick(e) {
  const btn = e.target;
  console.log('New anime button clicked');

  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Loading...';

  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = originalText;
  }, 1000);
}

function handleAuthClick(e) {
  const btn = e.target;
  const action = btn.textContent.trim();
  console.log('Auth button clicked:', action);

  btn.style.transform = 'scale(0.95)';
  setTimeout(() => btn.style.transform = 'scale(1)', 100);
}

async function fetchAnimeSchedule() {
  if (AppState.isLoading) return;

  AppState.isLoading = true;
  showLoadingState(true);

  const query = `
    query {
      Page(perPage: ${CONFIG.ITEMS_PER_PAGE}) {
        airingSchedules(notYetAired: true, sort: TIME) {
          airingAt
          episode
          media {
            id
            title { romaji }
            coverImage { medium }
          }
        }
      }
    }`;

  try {
    const res = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ query })
    });

    if (!res.ok) throw new Error(`Network error: ${res.statusText}`);
    const data = await res.json();

    if (!data?.data?.Page?.airingSchedules) {
      throw new Error("Invalid data format received from API");
    }

    processAnimeSchedule(data.data.Page.airingSchedules);
  } catch (err) {
    console.error("Failed to fetch anime schedule:", err);
    showErrorMessage("Failed to load anime schedule. Please try again later.");
  } finally {
    AppState.isLoading = false;
    showLoadingState(false);
  }
}

function processAnimeSchedule(schedules) {
  AppState.animeData.clear();
  const nextEpisodes = new Map();

  schedules.forEach(item => {
    const id = item.media?.id;
    if (!id) return;
    if (!nextEpisodes.has(id) || item.airingAt < nextEpisodes.get(id).airingAt) {
      nextEpisodes.set(id, item);
    }
  });

  const detailsList = document.querySelectorAll("#schedule details");

  nextEpisodes.forEach(item => {
    const date = new Date(item.airingAt * 1000);
    const dayIndex = DAY_REMAP[date.getDay()];
    insertAnimeItem(item, detailsList[dayIndex], date);
  });

  AppState.animeData = nextEpisodes;
  console.log(`Loaded ${nextEpisodes.size} anime episodes`);
}

function insertAnimeItem(item, section, airingDate) {
  const list = section?.querySelector(".anime-list");
  if (!list) return;

  const title = item.media?.title?.romaji || "Unknown Title";
  const cover = item.media?.coverImage?.medium || "";
  const episode = item.episode || "?";
  const formattedDate = formatGeorgianDate(airingDate);

  list.insertAdjacentHTML("beforeend", createAnimeItemHTML({
    cover, title, episode, formattedDate, animeId: item.media?.id
  }));
}

function createAnimeItemHTML({ cover, title, episode, formattedDate, animeId }) {
  return `
    <div class="anime-item" data-anime-id="${animeId}">
      <img src="${cover}" alt="${escapeHTML(title)} Cover Image" loading="lazy" />
      <div class="anime-details">
        <div class="anime-title">${escapeHTML(title)}</div>
        <div class="anime-meta">
          ${episode} სერია<br>
          <span class="anime-time">(${formattedDate})</span>
        </div>
      </div>
    </div>`;
}

function formatGeorgianDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = monthsGeorgian[date.getMonth()];
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${month}, ${hour}:${minute}`;
}

function showLoadingState(isLoading) {
  const el = document.querySelector('.loading-indicator');
  if (el) el.style.display = isLoading ? 'block' : 'none';
}

function showErrorMessage(msg) {
  let errorEl = document.querySelector('.error-message');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    document.querySelector('#schedule')?.prepend(errorEl);
  }

  errorEl.textContent = msg;
  errorEl.style.display = 'block';

  setTimeout(() => errorEl.style.display = 'none', 5000);
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function escapeHTML(str) {
  const escapeMap = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, m => escapeMap[m]);
}
