document.getElementById("dropdownBtn").addEventListener("click", function () {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", function (event) {
  const dropdown = document.querySelector(".dropdown");
  if (!dropdown.contains(event.target)) {
    document.getElementById("dropdownMenu").style.display = "none";
  }
});

