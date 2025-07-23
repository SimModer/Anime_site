const DAY_REMAP = [6, 0, 1, 2, 3, 4, 5];
const daysGeorgian = [
  "ორშაბათი", "სამშაბათი", "ოთხშაბათი",
  "ხუთშაბათი", "პარასკევი", "შაბათი", "კვირა"
];

document.addEventListener("DOMContentLoaded", () => {
  renderDaySections();
  autoOpenToday();
  fetchAnimeSchedule();
});

function renderDaySections() {
  const schedule = document.getElementById("schedule");
  schedule.innerHTML = daysGeorgian.map((day, i) => `
    <details id="day-${i}" class="day-section" data-day="${i}">
      <summary class="day-header${isToday(i) ? ' today' : ''}">
        <span class="day-name">${day}</span>
      </summary>
      <div class="anime-list"></div>
    </details>
  `).join('');
}

function isToday(dayIndex) {
  const todayJS = new Date().getDay();
  return DAY_REMAP[todayJS] === dayIndex;
}

function autoOpenToday() {
  const todayJS = new Date().getDay();
  const todayIndex = DAY_REMAP[todayJS];
  const todayDetail = document.getElementById(`day-${todayIndex}`);
  if (todayDetail) todayDetail.open = true;
}

async function fetchAnimeSchedule() {
  document.getElementById("loading").hidden = false;
  try {
    const query = `
      query {
        Page(perPage: 50) {
          airingSchedules(notYetAired: true, sort: TIME) {
            airingAt
            episode
            media {
              title { romaji }
              coverImage { medium }
            }
          }
        }
      }
    `;
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ query })
    });
    if (!res.ok) throw new Error(`Network error: ${res.statusText}`);
    const data = await res.json();
    const schedules = data?.data?.Page?.airingSchedules || [];
    schedules.forEach(item => insertAnime(item));
  } catch (error) {
    document.getElementById("error").textContent = "Failed to fetch anime schedule.";
    document.getElementById("error").hidden = false;
  } finally {
    document.getElementById("loading").hidden = true;
  }
}

function insertAnime(item) {
  const airingDate = new Date(item.airingAt * 1000);
  const dayJS = airingDate.getDay();
  const dayIndex = DAY_REMAP[dayJS];
  const section = document.querySelector(`.day-section[data-day="${dayIndex}"] .anime-list`);
  if (!section) return;

  const title = item.media?.title?.romaji || "Unknown Title";
  const cover = item.media?.coverImage?.medium || "";
  const episode = item.episode || "?";
  const formattedDate = airingDate.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  section.insertAdjacentHTML("beforeend", `
    <div class="anime-item" tabindex="0">
      <img src="${cover}" alt="${escapeHTML(title)} Cover Image" />
      <div class="anime-details">
        <div class="anime-title">${escapeHTML(title)}</div>
        <div class="anime-meta">
          ${episode} серия<br>(${formattedDate})
        </div>
      </div>
    </div>
  `);
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': "&amp;", '<': "&lt;", '>': "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}