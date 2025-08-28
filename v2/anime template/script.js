// --- Utils ---
const select = s => document.querySelector(s);
const selectAll = s => document.querySelectorAll(s);

// --- Dropdown ---
selectAll('.dropdown-btn').forEach(btn=>{
  btn.addEventListener('click', e=>{
    e.stopPropagation();
    const menu = btn.closest('.dropdown').querySelector('.dropdown-menu');
    selectAll('.dropdown-menu').forEach(m=>{if(m!==menu)m.classList.remove('show')});
    menu.classList.toggle('show');
    btn.querySelector('.dropdown-arrow').textContent = menu.classList.contains('show')?'▲':'▼';
  });
});
document.addEventListener('click', ()=>{
  selectAll('.dropdown-menu').forEach(m=>m.classList.remove('show'));
  selectAll('.dropdown-arrow').forEach(a=>a.textContent='▼');
});
selectAll('.dropdown-menu a').forEach(link=>{
  link.addEventListener('click', e=>{
    e.preventDefault();
    const btn = link.closest('.dropdown').querySelector('.dropdown-btn');
    btn.innerHTML = `${link.textContent} <span class="dropdown-arrow">▼</span>`;
    link.closest('.dropdown-menu').classList.remove('show');
    console.log(`Anime status changed to: ${link.dataset.status} (${link.textContent})`);
  });
});

// --- Edit Title ---
select('.edit-title-btn').addEventListener('click', ()=>{
  const titleEl = select('.anime-title');
  const current = titleEl.textContent;
  const input = document.createElement('input');
  input.type='text'; input.value=current;
  Object.assign(input.style,{background:'var(--glass-bg-light)',border:'1px solid var(--primary)',borderRadius:'var(--radius-sm)',padding:'8px 12px',color:'var(--text-light)',fontSize:'28px',fontWeight:'bold',width:'100%'});
  titleEl.replaceWith(input); input.focus(); input.select();

  const save=()=>{
    const h1 = document.createElement('h1');
    h1.className='anime-title'; h1.textContent = input.value.trim()||current;
    input.replaceWith(h1);
    select('.edit-title-btn').addEventListener('click',arguments.callee);
  };
  input.addEventListener('blur',save);
  input.addEventListener('keydown', e=>{
    if(e.key==='Enter') input.blur();
    if(e.key==='Escape'){ input.value=current; input.blur(); }
  });
});

// --- Language Toggle ---
selectAll('.lang-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    selectAll('.lang-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    select('.geo-text').style.display = btn.dataset.lang==='geo'?'block':'none';
    select('.eng-text').style.display = btn.dataset.lang==='eng'?'block':'none';
  });
});

// --- Comments ---
const commentsList = select('#comments-list');
const commentsCount = select('#comments-count');
const commentInput = select('#comment-input');

const renderComment=(text)=>{
  const div = document.createElement('div'); div.className='comment-item';
  div.innerHTML=`
    <div class="comment-avatar"><img src="https://via.placeholder.com/40" alt="avatar"></div>
    <div class="comment-content">
      <div class="comment-header"><span class="comment-author">Guest</span> • <span class="comment-date">${new Date().toLocaleString()}</span></div>
      <div class="comment-text">${text}</div>
    </div>`;
  commentsList.prepend(div);
  commentsCount.textContent = commentsList.children.length;
};

select('#submit-comment').addEventListener('click', ()=>{
  const text = commentInput.value.trim();
  if(text){ renderComment(text); commentInput.value=''; }
});
