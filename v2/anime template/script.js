// Dropdown functionality for "Add to List"
document.querySelectorAll(".dropdown-btn").forEach(btn => {
  btn.addEventListener("click", function(e) {
    e.stopPropagation();
    const dropdown = this.closest(".dropdown");
    const menu = dropdown.querySelector(".dropdown-menu");

    document.querySelectorAll(".dropdown-menu").forEach(otherMenu => {
      if (otherMenu !== menu) otherMenu.classList.remove("show");
    });

    menu.classList.toggle("show");
    const arrow = this.querySelector(".dropdown-arrow");
    arrow.textContent = menu.classList.contains("show") ? "▲" : "▼";
  });
});

document.addEventListener("click", function(event) {
  if (!event.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown-menu").forEach(menu => menu.classList.remove("show"));
    document.querySelectorAll(".dropdown-arrow").forEach(arrow => arrow.textContent = "▼");
  }
});

document.querySelectorAll(".dropdown-menu a").forEach(link => {
  link.addEventListener("click", function(e) {
    e.preventDefault();
    const statusText = this.textContent;
    const btn = this.closest(".dropdown").querySelector(".dropdown-btn");
    btn.innerHTML = `${statusText} <span class="dropdown-arrow">▼</span>`;
    this.closest(".dropdown-menu").classList.remove("show");
    console.log(`Anime status changed to: ${this.dataset.status} (${statusText})`);
  });
});
