// Remapping JS days (Sun=0) to Georgian week order (Mon=0)
const DAY_REMAP = [6, 0, 1, 2, 3, 4, 5];

const daysGeorgian = [
  "ორშაბათი", "სამშაბათი", "ოთხშაბათი",
  "ხუთშაბათი", "პარასკევი", "შაბათი", "კვირა"
];

const monthsGeorgian = [
  "იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"
];

window.addEventListener("DOMContentLoaded", () => {
  const todayJS = new Date().getDay(); // 0=Sunday
  const todayIndex = DAY_REMAP[todayJS];

  // Auto-open today's dropdown WITHOUT "(დღეს)"
  const detailsList = document.querySelectorAll("#schedule details");
  if (detailsList[todayIndex]) {
    detailsList[todayIndex].setAttribute("open", "true");
    detailsList[todayIndex].querySelector("summary").classList.add("today");
    // Remove "(დღეს)" from summary text if present
    let summary = detailsList[todayIndex].querySelector("summary");
    if (summary.textContent.includes("(დღეს)")) {
      summary.textContent = summary.textContent.replace(/\s*\(დღეს\)/, "");
    }
  }

  // Fetch and populate anime schedule
  fetchAnimeSchedule();
});

/**
 * Fetches the upcoming anime airing schedule from AniList GraphQL API,
 * then inserts only the next episode per anime into the correct day sections.
 */
function fetchAnimeSchedule() {
  const query = `
    query {
      Page(perPage: 50) {
        airingSchedules(notYetAired: true, sort: TIME) {
          airingAt
          episode
          media {
            id
            title {
              romaji
            }
            coverImage {
              medium
            }
          }
        }
      }
    }
  `;

  fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ query })
  })
    .then(res => {
      if (!res.ok) throw new Error(`Network error: ${res.statusText}`);
      return res.json();
    })
    .then(data => {
      if (!data?.data?.Page?.airingSchedules) throw new Error("Invalid data format");

      const schedules = data.data.Page.airingSchedules;

      // Map to store only the next episode per anime (by anime id)
      const nextEpisodes = new Map();
      for (const item of schedules) {
        const animeId = item.media?.id;
        if (!animeId) continue;
        // If anime not yet added, or this episode is earlier, add/update
        if (
          !nextEpisodes.has(animeId) ||
          item.airingAt < nextEpisodes.get(animeId).airingAt
        ) {
          nextEpisodes.set(animeId, item);
        }
      }

      // Now insert each next episode into the correct day
      nextEpisodes.forEach(item => {
        const airingDate = new Date(item.airingAt * 1000);
        const dayJS = airingDate.getDay();
        const dayIndex = DAY_REMAP[dayJS];

        const detailsList = document.querySelectorAll("#schedule details");
        const section = detailsList[dayIndex];
        if (!section) return;

        const list = section.querySelector(".anime-list");
        if (!list) return;

        const title = item.media?.title?.romaji || "Unknown Title";
        const cover = item.media?.coverImage?.medium || "";
        const episode = item.episode || "?";

        // Georgian date formatting
        const day = airingDate.getDate().toString().padStart(2, "0");
        const month = monthsGeorgian[airingDate.getMonth()];
        const hour = airingDate.getHours().toString().padStart(2, "0");
        const minute = airingDate.getMinutes().toString().padStart(2, "0");
        const formattedDate = `${day} ${month}, ${hour}:${minute}`;

        const animeHTML = `
          <div class="anime-item">
            <img src="${cover}" alt="${title} Cover Image" />
            <div class="anime-details">
              <div class="anime-title">${escapeHTML(title)}</div>
              <div class="anime-meta">
                ${episode} სერია<br>
                (${formattedDate})
              </div>
            </div>
          </div>
        `;

        list.insertAdjacentHTML("beforeend", animeHTML);
      });
    })
    .catch(error => {
      console.error("Failed to fetch anime schedule:", error);
      // Optionally: Show a user-friendly message here
    });
}

/**
 * Basic HTML escaping to prevent injection in inserted content
 * @param {string} unsafe - Unsafe string possibly containing HTML special chars.
 * @returns {string} Escaped string safe for insertion into HTML.
 */
function escapeHTML(unsafe) {
  return unsafe.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return "&amp;";
      case '<': return "&lt;";
      case '>': return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#039;";
      default: return m;
    }
  });
}