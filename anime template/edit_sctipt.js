// ============================================================
//  GENRE LIST — customise as needed
// ============================================================
    const ALL_GENRES = [
        'სეინენი','შონენი','შოუჯო','ჯოსეი',
        'სამოქმედო','სათავგადასავლო','კომედია','დრამა',
        'ფენტეზი','საშინელება','საიდუმლო','სიყვარული',
        'მეცნიერული ფანტასტიკა','სპორტი','ზებუნებრივი',
        'ფსიქოლოგიური','ისტორიული','სლაის ოფ ლაიფი'
      ];
      const selectedGenres = new Set();
  
      // Build genre chips
      const genreGrid = document.getElementById('genres-grid');
      ALL_GENRES.forEach(g => {
        const chip = document.createElement('div');
        chip.className = 'genre-chip';
        chip.dataset.genre = g;
        chip.textContent = g;
        chip.addEventListener('click', () => {
          if (selectedGenres.has(g)) { selectedGenres.delete(g); chip.classList.remove('selected'); }
          else { selectedGenres.add(g); chip.classList.add('selected'); }
          track();
        });
        genreGrid.appendChild(chip);
      });
  
      // ============================================================
      //  API DATA INJECTION
      //  Call loadEditForm(data) after fetching from your API.
      //  The function populates all form fields from the data object.
      // ============================================================
      function loadEditForm(data) {
        /*
          data = {
            title_english   : String,
            title_georgian  : String,
            title_other     : String,   // comma-separated aliases
            title_japanese  : String,
            franchise       : String,
            type            : String,   // must match one of the <option> values
            content_rating  : String,
            source          : String,
            status          : String,
            studio          : String,
            genres          : Array<String>,
            episodes        : Number|String,
            duration        : String,
            aired_from      : String,   // YYYY-MM-DD
            aired_to        : String,   // YYYY-MM-DD
            season          : String,
            season_year     : Number|String,
            image           : String,   // URL
            description_geo : String,
            description_eng : String,
            history         : Array<{ id, date, user, action, status }>
          }
        */
  
        // Breadcrumb & page title
        const name = data.title_english || '—';
        document.getElementById('bc-name').textContent    = name;
        document.getElementById('edit-title').textContent = 'რედაქტირება: ' + name;
        document.getElementById('page-title').textContent = 'რედაქტირება: ' + name + ' - MySite';
  
        // Text inputs
        setVal('f-title-en',    data.title_english);
        setVal('f-title-ka',    data.title_georgian);
        setVal('f-title-other', data.title_other);
        setVal('f-title-jp',    data.title_japanese);
        setVal('f-franchise',   data.franchise);
        setVal('f-studio',      data.studio);
        setVal('f-episodes',    data.episodes);
        setVal('f-duration',    data.duration);
        setVal('f-aired-from',  data.aired_from);
        setVal('f-aired-to',    data.aired_to);
        setVal('f-season-year', data.season_year);
        setVal('f-desc-ka',     data.description_geo);
        setVal('f-desc-en',     data.description_eng);
  
        // Selects
        setSelect('f-type',    data.type);
        setSelect('f-rating',  data.content_rating);
        setSelect('f-source',  data.source);
        setSelect('f-status',  data.status);
        setSelect('f-season',  data.season);
  
        // Genres
        if (Array.isArray(data.genres)) {
          data.genres.forEach(g => {
            selectedGenres.add(g);
            const chip = genreGrid.querySelector(`[data-genre="${g}"]`);
            if (chip) chip.classList.add('selected');
          });
        }
  
        // Image preview
        if (data.image) {
          setVal('f-img-url', data.image);
          previewImg(data.image);
        }
  
        // History
        if (Array.isArray(data.history) && data.history.length) {
          const hList = document.getElementById('history-list');
          hList.innerHTML = '';
          data.history.forEach(h => {
            hList.innerHTML += `
              <div class="history-item">
                <span class="history-id">${h.id || ''}</span>
                <span class="history-date">${h.date || ''}</span>
                <div class="history-avatar">${(h.user || '?')[0].toUpperCase()}</div>
                <span class="history-user">${h.user || '—'}</span>
                <span class="history-action">
                  ${h.action || '—'} — <a href="#">${name}</a>
                  ${h.status ? `· <span class="badge-ok">✓ ${h.status}</span>` : ''}
                </span>
              </div>`;
          });
        }
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
          loadEditForm(data);
        } catch (err) {
          document.getElementById('error-banner').classList.add('show');
          console.error('API error:', err);
        }
      })();
      */
  
      // ============================================================
      //  SAVE — replace with your real PATCH/PUT calls
      // ============================================================
      function save(fieldId) {
        const el = document.getElementById(fieldId);
        if (!el) return;
        const val = el.tagName === 'SELECT'
          ? (el.options[el.selectedIndex]?.text || '—')
          : (el.value || '—');
  
        // TODO: replace with actual API call
        // await fetch(`/api/anime/${animeId}`, { method: 'PATCH', body: JSON.stringify({ [fieldId]: val }) });
  
        showToast(`შენახულია: "${val}"`);
        if (unsaved > 0) { unsaved--; document.getElementById('unsaved-count').textContent = unsaved; }
      }
  
      function saveAll() {
        // TODO: gather all field values and PATCH to API
        unsaved = 0;
        document.getElementById('unsaved-count').textContent = 0;
        showToast('ყველა ცვლილება შენახულია! ✓');
      }
  
      // ============================================================
      //  HELPERS
      // ============================================================
      function setVal(id, val) {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) el.value = val;
      }
  
      function setSelect(id, val) {
        const sel = document.getElementById(id);
        if (!sel || !val) return;
        for (const opt of sel.options) {
          if (opt.value === val || opt.text === val) { opt.selected = true; break; }
        }
      }
  
      function previewImg(url) {
        const box = document.getElementById('img-box');
        if (url) {
          box.innerHTML = `<img src="${url}" alt="preview" onerror="this.parentElement.innerHTML='სურათი ვერ ჩაიტვირთა'">`;
        } else {
          box.innerHTML = 'სურათი<br>არ არის';
        }
        track();
      }
  
      // Change tracking
      let unsaved = 0;
      function track() { unsaved++; document.getElementById('unsaved-count').textContent = unsaved; }
      document.querySelectorAll('.edit-input, .edit-select, .edit-textarea').forEach(el => el.addEventListener('input', track));
  
      // Toast
      let toastTimer;
      function showToast(msg) {
        clearTimeout(toastTimer);
        const t = document.getElementById('toast');
        document.getElementById('toast-msg').textContent = msg;
        t.classList.add('show');
        toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}