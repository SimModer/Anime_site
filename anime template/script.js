    // ============================================================
    //  API DATA INJECTION
    //  Replace this function with your real API call.
    //  Expected shape of `data` object is documented below.
    // ============================================================
    function loadAnime(data) {
      /*
        data = {
          title_english    : String,
          title_japanese   : String,
          title_romanji    : String,
          image            : String (URL),
          type             : String,
          episodes         : Number|String,
          status           : String,
          aired            : String,
          season           : String,
          season_year      : Number|String,
          studio           : String,
          source           : String,
          genres           : Array<String>,
          duration         : String,
          content_rating   : String,
          description_geo  : String,
          description_eng  : String,
          characters       : Array<{ name, role, image }>,
          staff            : Array<{ name, role, image }>
        }
      */

      // Page title
      if (data.title_english) {
        document.getElementById('page-title').textContent = data.title_english + ' - MySite';
      }

      // Titles
      setText('title-en',      data.title_english);
      setText('title-jp',      data.title_japanese);
      setText('title-romanji', data.title_romanji);

      // Poster
      if (data.image) {
        const img = document.getElementById('poster-img');
        img.src = data.image;
        img.style.display = 'block';
        document.getElementById('poster-placeholder').style.display = 'none';
      }

      // Meta fields
      setText('meta-type',     data.type);
      setText('meta-episodes', data.episodes);
      setText('meta-status',   data.status);
      setText('meta-aired',    data.aired);
      setText('meta-season',   data.season && data.season_year ? data.season + ' ' + data.season_year : (data.season || data.season_year || null));
      setText('meta-studio',   data.studio);
      setText('meta-source',   data.source);
      setText('meta-genres',   Array.isArray(data.genres) ? data.genres.join(', ') : data.genres);
      setText('meta-duration', data.duration);
      setText('meta-rating',   data.content_rating);

      // Descriptions
      if (data.description_geo) document.getElementById('desc-geo').innerHTML = data.description_geo;
      if (data.description_eng) document.getElementById('desc-eng').innerHTML = data.description_eng;

      // Characters
      if (Array.isArray(data.characters) && data.characters.length) {
        const grid = document.getElementById('characters-grid');
        grid.innerHTML = '';
        data.characters.forEach(c => {
          grid.innerHTML += `
            <div class="character-card">
              <div class="character-main">
                <img src="${c.image || ''}" alt="${c.name || ''}" class="character-image"
                     onerror="this.style.background='var(--glass-bg-light)';this.src=''">
                <div>
                  <div class="character-name">${c.name || '—'}</div>
                  <div class="character-role">${c.role || '—'}</div>
                </div>
              </div>
            </div>`;
        });
      }

      // Staff
      if (Array.isArray(data.staff) && data.staff.length) {
        const grid = document.getElementById('staff-grid');
        grid.innerHTML = '';
        data.staff.forEach(s => {
          grid.innerHTML += `
            <div class="staff-card">
              <div class="staff-main">
                <img src="${s.image || ''}" alt="${s.name || ''}" class="staff-image"
                     onerror="this.style.background='var(--glass-bg-light)';this.src=''">
                <div>
                  <div class="staff-name">${s.name || '—'}</div>
                  <div class="staff-role">${s.role || '—'}</div>
                </div>
              </div>
            </div>`;
        });
      }
    }

    // Helper: set text content, fall back to '—'
    function setText(id, value) {
      const el = document.getElementById(id);
      if (el) el.textContent = (value !== undefined && value !== null && value !== '') ? value : '—';
    }

    // ============================================================
    //  EXAMPLE: fetch from your API endpoint
    //  Uncomment and replace URL when ready.
    // ============================================================
    /*
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const animeId = params.get('id');
      try {
        const res = await fetch(`/api/anime/${animeId}`);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        loadAnime(data);
      } catch (err) {
        document.getElementById('error-banner').classList.add('show');
        console.error('API error:', err);
      }
    })();
    */

    // ============================================================
    //  UI INTERACTIONS (tabs, stars, dropdown, comments)
    // ============================================================

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab + '-tab').classList.add('active');
      });
    });

    // Language toggle
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('desc-geo').style.display = btn.dataset.lang === 'geo' ? 'block' : 'none';
        document.getElementById('desc-eng').style.display = btn.dataset.lang === 'eng' ? 'block' : 'none';
      });
    });

    // Stars
    const stars = document.querySelectorAll('.star');
    const scoreVal = document.getElementById('score-val');
    let rating = 0;
    stars.forEach((s, i) => {
      s.addEventListener('click', () => { rating = i + 1; updateStars(); scoreVal.textContent = rating * 2; });
      s.addEventListener('mouseenter', () => stars.forEach((x, j) => x.classList.toggle('active', j <= i)));
    });
    document.getElementById('rating-stars').addEventListener('mouseleave', updateStars);
    function updateStars() { stars.forEach((s, i) => s.classList.toggle('active', i < rating)); }

    // Dropdown
    document.getElementById('dd-btn').addEventListener('click', e => {
      e.stopPropagation();
      document.getElementById('dd-menu').classList.toggle('show');
    });
    document.addEventListener('click', () => document.getElementById('dd-menu').classList.remove('show'));
    document.querySelectorAll('#dd-menu a').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        document.getElementById('dd-btn').innerHTML = e.target.textContent + ' <span>▼</span>';
        document.getElementById('dd-menu').classList.remove('show');
      });
    });

    // Comments
    let commentCount = 0;
    function postComment() {
      const inp = document.getElementById('comment-input');
      const text = inp.value.trim();
      if (!text) return;
      commentCount++;
      document.getElementById('comment-count').textContent = commentCount + ' კომენტარი';
      const div = document.createElement('div');
      div.className = 'comment-item';
      div.style.cssText = 'opacity:0;transform:translateY(-14px);';
      div.innerHTML = `
        <div class="comment-avatar"><img src="" alt="me" onerror="this.style.display='none'"></div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">თქვენ</span>
            <span class="comment-date">ახლა</span>
          </div>
          <div class="comment-text">${text.replace(/</g,'&lt;')}</div>
        </div>`;
      const list = document.getElementById('comments-list');
      list.insertBefore(div, list.firstChild);
      inp.value = '';
      requestAnimationFrame(() => { div.style.transition = 'all 0.35s ease'; div.style.opacity = '1'; div.style.transform = 'translateY(0)'; });
    }
    document.getElementById('submit-comment').addEventListener('click', postComment);
    document.getElementById('comment-input').addEventListener('keydown', e => { if (e.key === 'Enter' && e.ctrlKey) postComment(); });