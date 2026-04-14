/* pomo.js */
const CIRC = 2 * Math.PI * 104;

const ringProg      = document.getElementById('ringProg');
const dotIndicator  = document.getElementById('dotIndicator');
const display       = document.getElementById('timerDisplay');
const stateLabel    = document.getElementById('stateLabel');
const modeTag       = document.getElementById('modeTag');
const startPauseBtn = document.getElementById('startPauseBtn');
const selectEl      = document.getElementById('timeSelect');
const ringContainer = document.getElementById('ringContainer');
const toast         = document.getElementById('toast');
const toastMsg      = document.getElementById('toastMsg');
const dots          = document.querySelectorAll('.dot');

let totalSecs  = 25 * 60;
let remaining  = totalSecs;
let running    = false;
let interval   = null;
let sessionIdx = 0;
const MAX      = 4;

ringProg.style.strokeDasharray  = CIRC;
ringProg.style.strokeDashoffset = 0;
moveDot(0);

/* ── Helpers ── */
function pad(n) { return String(n).padStart(2, '0'); }

function setDisplay(secs) {
  display.textContent = `${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`;
  const pct = 1 - secs / totalSecs;
  ringProg.style.strokeDashoffset = CIRC * (1 - pct);
  moveDot(pct);
}

function moveDot(pct) {
  const angle = pct * 2 * Math.PI - Math.PI / 2;
  const r = 104;
  dotIndicator.setAttribute('cx', (120 + r * Math.cos(angle)).toFixed(2));
  dotIndicator.setAttribute('cy', (120 + r * Math.sin(angle)).toFixed(2));
}

function showToast(msg, ms = 2800) {
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), ms);
}

function setLabel(txt) {
  stateLabel.style.opacity = '0';
  stateLabel.style.transform = 'translateY(5px)';
  setTimeout(() => {
    stateLabel.textContent = txt;
    stateLabel.style.opacity = '1';
    stateLabel.style.transform = 'translateY(0)';
  }, 220);
}

function advanceDot() {
  dots[sessionIdx].classList.remove('active');
  dots[sessionIdx].classList.add('done');
  sessionIdx = (sessionIdx + 1) % MAX;
  if (sessionIdx === 0) {
    dots.forEach(d => { d.classList.remove('active', 'done'); });
  }
  dots[sessionIdx].classList.add('active');
}

/* ── Complete ── */
function onComplete() {
  clearInterval(interval);
  running = false;
  ringContainer.classList.remove('breathing');
  startPauseBtn.textContent = 'Start';
  startPauseBtn.classList.remove('paused');
  selectEl.disabled = false;
  setLabel('Complete ✦');
  modeTag.textContent = 'Well done';
  ringProg.style.strokeDashoffset = 0;
  moveDot(0);
  showToast('Session complete — take a breath ✦', 3500);
  advanceDot();

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification('Flow State', { body: 'Session complete — time for a break.' });
  }

  setTimeout(() => {
    totalSecs = parseInt(selectEl.value) * 60;
    remaining = totalSecs;
    setDisplay(remaining);
    setLabel('Ready');
    modeTag.textContent = 'Focus';
  }, 3000);
}

/* ── Controls ── */
function toggleTimer() { running ? pauseTimer() : startTimer(); }

function startTimer() {
  if (running) return;
  running = true;
  setLabel('Focusing…');
  modeTag.textContent = 'Focus';
  startPauseBtn.textContent = 'Pause';
  startPauseBtn.classList.remove('paused');
  selectEl.disabled = true;
  ringContainer.classList.add('breathing');

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  interval = setInterval(() => {
    remaining--;
    setDisplay(remaining);
    if (remaining <= 0) onComplete();
  }, 1000);
}

function pauseTimer() {
  if (!running) return;
  clearInterval(interval);
  running = false;
  ringContainer.classList.remove('breathing');
  startPauseBtn.textContent = 'Resume';
  startPauseBtn.classList.add('paused');
  setLabel('Paused');
}

function resetTimer() {
  clearInterval(interval);
  running = false;
  ringContainer.classList.remove('breathing');
  totalSecs = parseInt(selectEl.value) * 60;
  remaining = totalSecs;
  setDisplay(remaining);
  setLabel('Ready');
  modeTag.textContent = 'Focus';
  startPauseBtn.textContent = 'Start';
  startPauseBtn.classList.remove('paused');
  selectEl.disabled = false;
}

function skipSession() {
  if (!running && remaining === totalSecs) return;
  clearInterval(interval);
  running = false;
  ringContainer.classList.remove('breathing');
  advanceDot();
  showToast('Session skipped');
  totalSecs = parseInt(selectEl.value) * 60;
  remaining = totalSecs;
  setDisplay(remaining);
  setLabel('Ready');
  modeTag.textContent = 'Focus';
  startPauseBtn.textContent = 'Start';
  startPauseBtn.classList.remove('paused');
  selectEl.disabled = false;
}

selectEl.addEventListener('change', () => {
  if (running) return;
  totalSecs = parseInt(selectEl.value) * 60;
  remaining = totalSecs;
  setDisplay(remaining);
});

stateLabel.style.transition = 'opacity 0.22s ease, transform 0.22s ease';

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'SELECT') return;
  if (e.code === 'Space') { e.preventDefault(); toggleTimer(); }
  if (e.code === 'KeyR') resetTimer();
});

setDisplay(remaining);
