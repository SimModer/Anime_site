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
        
        // Here you would typically send the status to your backend
        // updateAnimeStatus(animeId, status);
      });
    });

    // Enhanced tab functionality
    document.querySelectorAll('.video-player-side .nav-link').forEach(tabBtn => {
      tabBtn.addEventListener('click', function() {
        const container = this.closest('.video-player-side');
        
        // Remove active class from all tabs and panes
        container.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
        container.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // Activate clicked tab
        this.classList.add('active');
        
        // Activate corresponding pane
        const targetId = this.getAttribute('data-target');
        const targetPane = container.querySelector(`#${targetId}`);
        if (targetPane) {
          targetPane.classList.add('active');
        }
      });
    });

    // Video player toggle items functionality
    document.querySelectorAll('.video-player-toggle-item').forEach(item => {
      item.addEventListener('click', function() {
        // Remove active class from siblings
        const container = this.closest('.tab-pane');
        container.querySelectorAll('.video-player-toggle-item').forEach(sibling => {
          sibling.classList.remove('active');
        });
        
        // Add active class to clicked item
        this.classList.add('active');
        
        console.log(`Selected option: ${this.textContent.trim()}`);
        
        // Here you would typically change the video source
        // updateVideoSource(this.dataset.source);
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

    // Smooth scroll animations for better UX
    function addScrollAnimations() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
          }
        });
      }, observerOptions);

      document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
      });
    }

    // Initialize animations when page loads
    document.addEventListener('DOMContentLoaded', addScrollAnimations);

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