/* theme.js — shared across both pages */
(function () {
  // Apply saved theme instantly, before paint (no flash)
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  const sun  = document.getElementById('iconSun');
  const moon = document.getElementById('iconMoon');
  if (!sun || !moon) return;
  sun.style.display  = isDark  ? 'block' : 'none';
  moon.style.display = isDark  ? 'none'  : 'block';
}

// Run on DOM ready to sync icon with current state
document.addEventListener('DOMContentLoaded', () => {
  updateThemeIcon(document.documentElement.classList.contains('dark'));
});
