// Constants
const DAY_REMAP = Object.freeze([6, 0, 1, 2, 3, 4, 5]);
const DAYS_GEORGIAN = Object.freeze([
  "ორშაბათი", "სამშაბათი", "ოთხშაბათი",
  "ხუთშაბათი", "პარასკევი", "შაბათი", "კვირა"
]);
const MONTHS_GEORGIAN = Object.freeze([
  "იან", "თებ", "მარ", "აპრ", "მაი", "ივნ",
  "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"
]);
const CONFIG = Object.freeze({
  API_URL: "https://graphql.anilist.co",
  ITEMS_PER_PAGE: 50,
  ANIMATION_DURATION: 300
});

// App State
const AppState = {
  searchTerm: '',
  isLoading: false,
  animeData: new Map()
};

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  highlightToday();
  attachEventListeners();
  fetchAnimeSchedule();
});

// Highlight current day
function highlightToday() {
  const todayIndex = DAY_REMAP[new Date().getDay()];
  const todayDetails = document.querySelectorAll("#schedule details")[todayIndex];

  if (!todayDetails) return;

  todayDetails.open = true;
  const summary = todayDetails.querySelector("summary");
  if (summary) {
    summary.classList.add("today");
    summary.textContent = summary.textContent.replace(/\s*\(დღეს\)/, "");
  }
}

// Event listeners
function attachEventListeners() {
  const input = document.querySelector('.search-box input');
  if (input) input.addEventListener('input', debounce(handleSearch, 300));

  document.querySelectorAll('#schedule details').forEach(detail =>
    detail.addEventListener('toggle', onDetailToggle)
  );

  document.querySelectorAll('.news-item').forEach(item =>
    item.addEventListener('click', onNewsClick)
  );

  const newAnimeBtn = document.querySelector('.new-anime-button');
  if (newAnimeBtn) newAnimeBtn.addEventListener('click', onNewAnimeClick);

  document.querySelectorAll('.auth-buttons button').forEach(btn =>
    btn.addEventListener('click', onAuthClick)
  );
}

// Handle search
function handleSearch(e) {
  const term = e.target.value.toLowerCase().trim();
  AppState.searchTerm = term;

  document.querySelectorAll('.anime-item').forEach(item => {
    const title = item.querySelector('.anime-title')?.textContent.toLowerCase() || '';
    const match = !term || title.includes(term);
    item.style.display = match ? 'flex' : 'none';
    if (match) item.classList.add('fade-in-up');
  });
}

// Toggle animation on expand
function onDetailToggle(e) {
  if (e.target.open) {
    const list = e.target.querySelector('.anime-list');
    if (list) list.classList.add('fade-in-up');
  }
}

// News click animation
function onNewsClick(e) {
  const item = e.currentTarget;
  item.style.transform = 'scale(0.98)';
  setTimeout(() => (item.style.transform = 'scale(1)'), 150);
}

// New anime click
function onNewAnimeClick(e) {
  const btn = e.target;
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Loading...';

  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = originalText;
  }, 1000);
}

// Auth button feedback
function onAuthClick(e) {
  const btn = e.target;
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => (btn.style.transform = 'scale(1)'), 100);
}

// Fetch schedule from AniList
async function fetchAnimeSchedule() {
  if (AppState.isLoading) return;

  AppState.isLoading = true;
  toggleLoading(true);

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
    const schedules = json?.data?.Page?.airingSchedules;
    if (!schedules) throw new Error("No schedule data");

    processSchedules(schedules);
  } catch (err) {
    console.error(err);
    showError("დაფიქსირდა შეცდომა. სცადეთ მოგვიანებით.");
  } finally {
    AppState.isLoading = false;
    toggleLoading(false);
  }
}

// Process API data
function processSchedules(schedules) {
  AppState.animeData.clear();
  const nextEpisodes = new Map();

  for (const item of schedules) {
    const id = item.media?.id;
    if (!id) continue;

    const existing = nextEpisodes.get(id);
    if (!existing || item.airingAt < existing.airingAt) {
      nextEpisodes.set(id, item);
    }
  }

  nextEpisodes.forEach((item) => {
    const date = new Date(item.airingAt * 1000);
    const dayIndex = DAY_REMAP[date.getDay()];
    insertAnimeItem(item, dayIndex, date);
  });

  AppState.animeData = nextEpisodes;
}

// Insert item into DOM
function insertAnimeItem(item, dayIndex, airingDate) {
  const details = document.querySelectorAll("#schedule details")[dayIndex];
  const list = details?.querySelector(".anime-list");
  if (!list) return;

  const { id, title, coverImage } = item.media;
  const html = createAnimeHTML({
    animeId: id,
    title: title?.romaji || "Untitled",
    cover: coverImage?.medium || "",
    episode: item.episode || "?",
    date: formatDate(airingDate)
  });

  list.insertAdjacentHTML("beforeend", html);
}

// Create HTML string for anime
function createAnimeHTML({ cover, title, episode, date, animeId }) {
  return `
    <div class="anime-item" data-anime-id="${animeId}">
      <img src="${cover}" alt="${escapeHTML(title)} Cover" loading="lazy" />
      <div class="anime-details">
        <div class="anime-title">${escapeHTML(title)}</div>
        <div class="anime-meta">
          ${episode} სერია<br>
          <span class="anime-time">(${date})</span>
        </div>
      </div>
    </div>
  `;
}

// Format Georgian date
function formatDate(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = MONTHS_GEORGIAN[date.getMonth()];
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${d} ${m}, ${h}:${min}`;
}

// Toggle loading visibility
function toggleLoading(show) {
  const loader = document.querySelector('.loading-indicator');
  if (loader) loader.style.display = show ? 'block' : 'none';
}

// Show error to user
function showError(msg) {
  let el = document.querySelector('.error-message');
  if (!el) {
    el = document.createElement('div');
    el.className = 'error-message';
    document.querySelector('#schedule')?.prepend(el);
  }
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 5000);
}

// Debounce utility
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Escape HTML
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#039;'
  })[char]);
}
