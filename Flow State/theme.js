/* theme.js */
(function () {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();

function toggleTheme() {
  const dark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  syncIcon();
}

function syncIcon() {
  const dark = document.documentElement.classList.contains('dark');
  const sun  = document.getElementById('iconSun');
  const moon = document.getElementById('iconMoon');
  if (sun)  sun.style.display  = dark ? 'block' : 'none';
  if (moon) moon.style.display = dark ? 'none'  : 'block';
}

document.addEventListener('DOMContentLoaded', syncIcon);
