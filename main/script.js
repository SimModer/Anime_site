// Remapping JS days (Sun=0) to Georgian week order (Mon=0)
    const DAY_REMAP = [6, 0, 1, 2, 3, 4, 5];

    const daysGeorgian = [
      "ორშაბათი", "სამშაბათი", "ოთხშაბათი",
      "ხუთშაბათი", "პარასკევი", "შაბათი", "კვირა"
    ];

    const monthsGeorgian = [
      "იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", 
      "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"
    ];

    // Configuration
    const CONFIG = {
      API_URL: "https://graphql.anilist.co",
      ITEMS_PER_PAGE: 50,
      ANIMATION_DURATION: 300
    };

    // State management
    const AppState = {
      searchTerm: '',
      isLoading: false,
      animeData: new Map()
    };

    /**
     * Initialize the application when DOM is loaded
     */
    function initializeApp() {
      setupTodayHighlight();
      setupEventListeners();
      fetchAnimeSchedule();
    }

    /**
     * Set up today's day highlighting and auto-open
     */
    function setupTodayHighlight() {
      const todayJS = new Date().getDay();
      const todayIndex = DAY_REMAP[todayJS];
      
      const detailsList = document.querySelectorAll("#schedule details");
      const todaySection = detailsList[todayIndex];
      
      if (todaySection) {
        todaySection.setAttribute("open", "true");
        const summary = todaySection.querySelector("summary");
        
        if (summary) {
          summary.classList.add("today");
          // Clean up summary text by removing "(დღეს)" if present
          summary.textContent = summary.textContent.replace(/\s*\(დღეს\)/, "");
        }
      }
    }

    /**
     * Set up all event listeners in one place
     */
    function setupEventListeners() {
      // Search functionality
      const searchInput = document.querySelector('.search-box input');
      if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
      }

      // Smooth animations for schedule details
      const scheduleDetails = document.querySelectorAll('#schedule details');
      scheduleDetails.forEach(detail => {
        detail.addEventListener('toggle', handleDetailsToggle);
      });

      // News item interactions
      const newsItems = document.querySelectorAll('.news-item');
      newsItems.forEach(item => {
        item.addEventListener('click', handleNewsClick);
      });

      // New anime button
      const newAnimeButton = document.querySelector('.new-anime-button');
      if (newAnimeButton) {
        newAnimeButton.addEventListener('click', handleNewAnimeClick);
      }

      // Authentication buttons
      const authButtons = document.querySelectorAll('.auth-buttons button');
      authButtons.forEach(button => {
        button.addEventListener('click', handleAuthClick);
      });
    }

    /**
     * Handle search input with filtering
     */
    function handleSearch(event) {
      const searchTerm = event.target.value.toLowerCase().trim();
      AppState.searchTerm = searchTerm;
      
      console.log('Searching for:', searchTerm);
      
      // Filter visible anime items
      const animeItems = document.querySelectorAll('.anime-item');
      animeItems.forEach(item => {
        const title = item.querySelector('.anime-title')?.textContent.toLowerCase() || '';
        const shouldShow = !searchTerm || title.includes(searchTerm);
        
        item.style.display = shouldShow ? 'flex' : 'none';
        
        // Add fade animation
        if (shouldShow) {
          item.classList.add('fade-in-up');
        }
      });
    }

    /**
     * Handle details toggle with smooth animations
     */
    function handleDetailsToggle(event) {
      if (event.target.open) {
        const animeList = event.target.querySelector('.anime-list');
        if (animeList) {
          animeList.classList.add('fade-in-up');
        }
      }
    }

    /**
     * Handle news item clicks
     */
    function handleNewsClick(event) {
      const newsItem = event.currentTarget;
      const newsTitle = newsItem.querySelector('h3')?.textContent || 'Unknown';
      
      console.log('News item clicked:', newsTitle);
      
      // Add click animation
      newsItem.style.transform = 'scale(0.98)';
      setTimeout(() => {
        newsItem.style.transform = 'scale(1)';
      }, 150);
    }

    /**
     * Handle new anime button clicks
     */
    function handleNewAnimeClick(event) {
      console.log('New anime button clicked');
      
      // Add loading state
      const button = event.target;
      const originalText = button.textContent;
      
      button.disabled = true;
      button.textContent = 'Loading...';
      
      // Simulate loading (replace with actual functionality)
      setTimeout(() => {
        button.disabled = false;
        button.textContent = originalText;
      }, 1000);
    }

    /**
     * Handle authentication button clicks
     */
    function handleAuthClick(event) {
      const buttonText = event.target.textContent.trim();
      console.log('Auth button clicked:', buttonText);
      
      // Add visual feedback
      const button = event.target;
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    }

    /**
     * Fetch anime schedule from AniList API
     */
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

      try {
        const response = await fetch(CONFIG.API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ query })
        });

        if (!response.ok) {
          throw new Error(`Network error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data?.data?.Page?.airingSchedules) {
          throw new Error("Invalid data format received from API");
        }

        processAnimeSchedule(data.data.Page.airingSchedules);
        
      } catch (error) {
        console.error("Failed to fetch anime schedule:", error);
        showErrorMessage("Failed to load anime schedule. Please try again later.");
      } finally {
        AppState.isLoading = false;
        showLoadingState(false);
      }
    }

    /**
     * Process and display anime schedule data
     */
    function processAnimeSchedule(schedules) {
      // Clear existing data
      AppState.animeData.clear();
      
      // Get only the next episode per anime
      const nextEpisodes = new Map();
      
      schedules.forEach(item => {
        const animeId = item.media?.id;
        if (!animeId) return;
        
        // Store the earliest episode for each anime
        if (!nextEpisodes.has(animeId) || item.airingAt < nextEpisodes.get(animeId).airingAt) {
          nextEpisodes.set(animeId, item);
        }
      });

      // Insert episodes into their respective day sections
      nextEpisodes.forEach(item => {
        const airingDate = new Date(item.airingAt * 1000);
        const dayJS = airingDate.getDay();
        const dayIndex = DAY_REMAP[dayJS];

        insertAnimeItem(item, dayIndex, airingDate);
      });

      // Store processed data
      AppState.animeData = nextEpisodes;
      
      console.log(`Loaded ${nextEpisodes.size} anime episodes`);
    }

    /**
     * Insert anime item into the correct day section
     */
    function insertAnimeItem(item, dayIndex, airingDate) {
      const detailsList = document.querySelectorAll("#schedule details");
      const section = detailsList[dayIndex];
      
      if (!section) return;

      const list = section.querySelector(".anime-list");
      if (!list) return;

      const title = item.media?.title?.romaji || "Unknown Title";
      const cover = item.media?.coverImage?.medium || "";
      const episode = item.episode || "?";

      // Format date in Georgian
      const formattedDate = formatGeorgianDate(airingDate);

      const animeHTML = createAnimeItemHTML({
        cover,
        title,
        episode,
        formattedDate,
        animeId: item.media?.id
      });

      list.insertAdjacentHTML("beforeend", animeHTML);
    }

    /**
     * Create HTML for anime item
     */
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
        </div>
      `;
    }

    /**
     * Format date in Georgian format
     */
    function formatGeorgianDate(date) {
      const day = date.getDate().toString().padStart(2, "0");
      const month = monthsGeorgian[date.getMonth()];
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");
      
      return `${day} ${month}, ${hour}:${minute}`;
    }

    /**
     * Show/hide loading state
     */
    function showLoadingState(isLoading) {
      const loadingIndicator = document.querySelector('.loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
      }
    }

    /**
     * Show error message to user
     */
    function showErrorMessage(message) {
      // Create or update error message element
      let errorElement = document.querySelector('.error-message');
      
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        
        const scheduleContainer = document.querySelector('#schedule');
        if (scheduleContainer) {
          scheduleContainer.insertBefore(errorElement, scheduleContainer.firstChild);
        }
      }
      
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }

    /**
     * Debounce function to limit API calls
     */
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    /**
     * HTML escaping utility
     */
    function escapeHTML(unsafe) {
      const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      
      return unsafe.replace(/[&<>"']/g, match => escapeMap[match]);
    }

    // Initialize app when DOM is ready
    document.addEventListener("DOMContentLoaded", initializeApp);
