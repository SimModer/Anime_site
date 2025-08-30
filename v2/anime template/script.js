  // Tab functionality
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      
      // Remove active from all tabs and content
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active to clicked tab and corresponding content
      btn.classList.add('active');
      document.getElementById(tabId + '-tab').classList.add('active');
    });
  });
  
  // Language toggle functionality
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      
      // Remove active from all language buttons
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show/hide descriptions based on language
      if (lang === 'geo') {
        document.querySelector('.geo-text').style.display = 'block';
        document.querySelector('.eng-text').style.display = 'none';
      } else {
        document.querySelector('.geo-text').style.display = 'none';
        document.querySelector('.eng-text').style.display = 'block';
      }
    });
  });
  
  // Star rating functionality
  const stars = document.querySelectorAll('.star');
  const scoreValue = document.querySelector('.score-value');
  let currentRating = 0;
  
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      currentRating = index + 1;
      updateStars();
      scoreValue.textContent = currentRating * 2; // Convert to 10-point scale
    });
    
    star.addEventListener('mouseenter', () => {
      highlightStars(index + 1);
    });
  });
  
  document.getElementById('rating-stars').addEventListener('mouseleave', () => {
    updateStars();
  });
  
  function updateStars() {
    stars.forEach((star, index) => {
      star.classList.toggle('active', index < currentRating);
    });
  }
  
  function highlightStars(rating) {
    stars.forEach((star, index) => {
      star.classList.toggle('active', index < rating);
    });
  }
  
  // Dropdown functionality
  document.querySelector('.dropdown-btn').addEventListener('click', () => {
    const menu = document.querySelector('.dropdown-menu');
    menu.classList.toggle('show');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.querySelector('.dropdown-menu').classList.remove('show');
    }
  });
  
  // Status selection
  document.querySelectorAll('.dropdown-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const status = e.target.dataset.status;
      const statusText = e.target.textContent;
      
      document.querySelector('.dropdown-btn').innerHTML = 
        statusText + ' <span class="dropdown-arrow">▼</span>';
      document.querySelector('.dropdown-menu').classList.remove('show');
      
      // Here you would typically send the status to your backend
      console.log('Status changed to:', status);
    });
  });
  
  // Comment submission
  document.querySelector('.submit-comment-btn').addEventListener('click', () => {
    const commentInput = document.getElementById('comment-input');
    const commentText = commentInput.value.trim();
    
    if (commentText) {
      // Create new comment element
      const newComment = document.createElement('div');
      newComment.className = 'comment-item';
      newComment.innerHTML = `
        <div class="comment-avatar">
          <img src="https://via.placeholder.com/40x40/4ecdc4/fff?text=თქვენ" alt="Your Avatar">
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">თქვენ</span>
            <span class="comment-date">ახლა</span>
          </div>
          <div class="comment-text">${commentText}</div>
        </div>
      `;
      
      // Add to top of comments list
      const commentsList = document.querySelector('.comments-list');
      commentsList.insertBefore(newComment, commentsList.firstChild);
      
      // Clear input
      commentInput.value = '';
      
      // Update comment count
      const commentsStats = document.querySelector('.comments-stats');
      const currentCount = parseInt(commentsStats.textContent.match(/\d+/)[0]) + 1;
      commentsStats.textContent = `${currentCount} კომენტარი`;
      
      // Animate new comment
      newComment.style.opacity = '0';
      newComment.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        newComment.style.transition = 'all 0.3s ease';
        newComment.style.opacity = '1';
        newComment.style.transform = 'translateY(0)';
      }, 100);
    }
  });
  
  // Enter key submission for comments
  document.getElementById('comment-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      document.querySelector('.submit-comment-btn').click();
    }
  });