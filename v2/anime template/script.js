    // Enhanced dropdown functionality
    document.querySelectorAll(".dropdown-btn").forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        const dropdown = this.closest(".dropdown");
        const menu = dropdown.querySelector(".dropdown-menu");
        
        // Close other dropdowns
        document.querySelectorAll(".dropdown-menu").forEach(otherMenu => {
          if (otherMenu !== menu) {
            otherMenu.classList.remove("show");
          }
        });
        
        // Toggle current dropdown
        menu.classList.toggle("show");
        
        // Update arrow direction
        const arrow = this.querySelector(".dropdown-arrow");
        arrow.textContent = menu.classList.contains("show") ? "▲" : "▼";
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function(event) {
      if (!event.target.closest(".dropdown")) {
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
          menu.classList.remove("show");
        });
        document.querySelectorAll(".dropdown-arrow").forEach(arrow => {
          arrow.textContent = "▼";
        });
      }
    });

    // Handle dropdown menu selections
    document.querySelectorAll(".dropdown-menu a").forEach(link => {
      link.addEventListener("click", function(e) {
        e.preventDefault();
        const status = this.dataset.status;
        const statusText = this.textContent;
        
        console.log(`Anime status changed to: ${status} (${statusText})`);
        
        // Update button text
        const btn = this.closest(".dropdown").querySelector(".dropdown-btn");
        btn.innerHTML = `${statusText} <span class="dropdown-arrow">▼</span>`;
        
        // Close dropdown
        this.closest(".dropdown-menu").classList.remove("show");
      });
    });

    // Dubbing option functionality
    document.querySelectorAll('.dubbing-option').forEach(dubbingBtn => {
      dubbingBtn.addEventListener('click', function() {
        const dubbingType = this.dataset.dubbing;
        const targetList = document.querySelector(`[data-dubbing-target="${dubbingType}"]`);
        
        // Remove active class from all dubbing options and player lists
        document.querySelectorAll('.dubbing-option').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.player-list').forEach(list => list.classList.remove('active'));
        
        // Activate clicked dubbing option and its player list
        this.classList.add('active');
        if (targetList) {
          targetList.classList.add('active');
        }
        
        console.log(`Selected dubbing: ${dubbingType}`);
      });
    });

    // Player item functionality
    document.querySelectorAll('.player-item').forEach(playerItem => {
      playerItem.addEventListener('click', function() {
        const playerList = this.closest('.player-list');
        
        // Remove active class from siblings in the same player list
        playerList.querySelectorAll('.player-item').forEach(item => {
          item.classList.remove('active');
        });
        
        // Add active class to clicked player
        this.classList.add('active');
        
        const playerId = this.dataset.player;
        console.log(`Selected player: ${playerId} - ${this.textContent.trim()}`);
        
        // Here you would typically change the video source
        // updateVideoSource(playerId);
      });
    });

    // Episode navigation
    document.querySelectorAll('.episode-grid a').forEach(episodeLink => {
      episodeLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove current class from all episodes
        document.querySelectorAll('.episode-grid a').forEach(link => {
          link.classList.remove('current');
        });
        
        // Add current class to clicked episode
        this.classList.add('current');
        
        console.log(`Loading episode: ${this.textContent.trim()}`);
        
        // Here you would typically load the new episode
        // loadEpisode(this.dataset.episode);
      });
    });

    // Add keyboard navigation for better accessibility
    document.addEventListener('keydown', function(e) {
      // Press 'Escape' to close dropdowns
      if (e.key === 'Escape') {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
          menu.classList.remove('show');
        });
        document.querySelectorAll('.dropdown-arrow').forEach(arrow => {
          arrow.textContent = "▼";
        });
      }
      
      // Press 'Tab' to navigate through episodes
      if (e.key === 'Tab' && e.target.closest('.episode-grid')) {
        e.preventDefault();
        const episodes = document.querySelectorAll('.episode-grid a');
        const currentIndex = [...episodes].indexOf(document.activeElement);
        const nextIndex = e.shiftKey 
          ? (currentIndex - 1 + episodes.length) % episodes.length
          : (currentIndex + 1) % episodes.length;
        episodes[nextIndex].focus();
      }
    });

    // Initialize - make sure first dubbing's player list is visible
    document.addEventListener('DOMContentLoaded', function() {
      const firstDubbing = document.querySelector('.dubbing-option.active');
      if (firstDubbing) {
        const dubbingType = firstDubbing.dataset.dubbing;
        const targetList = document.querySelector(`[data-dubbing-target="${dubbingType}"]`);
        if (targetList) {
          targetList.classList.add('active');
        }
      }
    });