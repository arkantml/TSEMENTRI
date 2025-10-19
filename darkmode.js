const themeToggle = document.getElementById("themeToggle");
function updateThemeIcon() {
    themeToggle.textContent = document.documentElement.classList.contains("dark") ? "🌙" : "☀️";
}
updateThemeIcon();
themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    if (document.documentElement.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
    updateThemeIcon();
});





