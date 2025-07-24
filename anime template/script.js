// Toggle dropdown on button click
document.querySelectorAll(".dropdownBtn").forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    e.stopPropagation(); // Prevent closing immediately
    const dropdown = this.closest(".dropdown");
    const menu = dropdown.querySelector(".dropdown-menu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });
});

// Close dropdown if clicked outside
document.addEventListener("click", function (event) {
  document.querySelectorAll(".dropdown-menu").forEach(function (menu) {
    if (!menu.contains(event.target)) {
      menu.style.display = "none";
    }
  });
});

// Tabs toggle for video-player-side
document.querySelectorAll('.video-player-side .nav-link').forEach((tabBtn) => {
  tabBtn.addEventListener('click', () => {
    const container = tabBtn.closest('.video-player-side');
    
    // Deactivate all tabs and panes
    container.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
    container.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    // Activate clicked tab
    tabBtn.classList.add('active');
    
    // Activate related pane
    const targetId = tabBtn.getAttribute('data-target');
    const targetPane = container.querySelector(`#${targetId}`);
    if (targetPane) targetPane.classList.add('active');
  });
});