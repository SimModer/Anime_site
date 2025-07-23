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

  // Auto-open today's dropdown (assuming <details> elements with ids like day-0, day-1, ...)
  const todayDetail = document.getElementById(`day-${todayIndex}`);
  if (todayDetail) {
    todayDetail.setAttribute("open", "true");
  }

  // Mark today's section and setup click toggles
  document.querySelectorAll(".day-section").forEach((section, index) => {
    const header = section.querySelector(".day-header");
    const dayNameElem = header.querySelector(".day-name");

    // Add Georgian day name if needed
    if (dayNameElem && daysGeorgian[index]) {
      dayNameElem.textContent = daysGeorgian[index];
    }

    // Highlight today and expand list
    if (index === todayIndex) {
      header.classList.add("today");
      if (dayNameElem) dayNameElem.textContent += " (დღეს)";
      toggleAnimeList(section, true);
    }

    // Toggle anime list on header click
    header.addEventListener("click", () => {
      const list = section.querySelector(".anime-list");
      const isOpen = list && list.style.display === "block";
      toggleAnimeList(section, !isOpen);
    });
  });

  // Fetch and populate anime schedule
  fetchAnimeSchedule();
});

/**
 * Toggles the anime list visibility for a given section,
 * and ensures all other sections are closed.
 * @param {Element} section - The day-section element to toggle.
 * @param {boolean} open - Whether to open (true) or close (false) the section.
 */
function toggleAnimeList(section, open) {
  const allSections = document.querySelectorAll(".day-section");

  allSections.forEach(s => {
    const list = s.querySelector(".anime-list");
    const btn = s.querySelector(".toggle-button");
    if (list) list.style.display = "none";
    if (btn) btn.textContent = "Развернуть";
  });

  if (open) {
    const list = section.querySelector(".anime-list");
    const btn = section.querySelector(".toggle-button");
    if (list) list.style.display = "block";
    if (btn) btn.textContent = "Свернуть";
  }
}

/**
 * Fetches the upcoming anime airing schedule from AniList GraphQL API,
 * then inserts anime items into the correct day sections.
 */
function fetchAnimeSchedule() {
  const query = `
    query {
      Page(perPage: 50) {
        airingSchedules(notYetAired: true, sort: TIME) {
          airingAt
          episode
          media {
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

      schedules.forEach(item => {
        const airingDate = new Date(item.airingAt * 1000);
        const dayJS = airingDate.getDay();
        const dayIndex = DAY_REMAP[dayJS];

        const section = document.querySelector(`.day-section[data-day="${dayIndex}"]`);
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