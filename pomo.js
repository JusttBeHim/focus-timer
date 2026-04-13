/* pomo.js — Flow State Pomodoro Logic */

const CIRC = 2 * Math.PI * 104; // 653.45

/* --- DOM refs --- */
const ringProg     = document.getElementById('ringProg');
const dotIndicator = document.getElementById('dotIndicator');
const display      = document.getElementById('timerDisplay');
const stateLabel   = document.getElementById('stateLabel');
const modeTag      = document.getElementById('modeTag');
const startPauseBtn = document.getElementById('startPauseBtn');
const selectEl     = document.getElementById('timeSelect');
const ringContainer = document.getElementById('ringContainer');
const toast        = document.getElementById('toast');
const toastMsg     = document.getElementById('toastMsg');
const sessionDots  = document.querySelectorAll('.session-dot');

/* --- State --- */
let totalSecs   = 25 * 60;
let remaining   = totalSecs;
let running     = false;
let interval    = null;
let sessionIdx  = 0;          // 0-3 (four sessions tracked)
const MAX_SESSIONS = 4;

/* --- Init ring --- */
ringProg.style.strokeDasharray  = CIRC;
ringProg.style.strokeDashoffset = 0;
updateDot(0);

/* --- Helpers --- */
function pad(n) { return String(n).padStart(2, '0'); }

function setDisplay(secs) {
  display.textContent = `${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`;
  const pct = 1 - secs / totalSecs;
  ringProg.style.strokeDashoffset = CIRC * (1 - pct);
  updateDot(pct);
}

/** Moves the gold dot around the ring based on progress (0–1) */
function updateDot(pct) {
  const angle  = pct * 2 * Math.PI - Math.PI / 2; // start at top
  const r      = 104;
  const cx     = 120 + r * Math.cos(angle);
  const cy     = 120 + r * Math.sin(angle);
  dotIndicator.setAttribute('cx', cx.toFixed(2));
  dotIndicator.setAttribute('cy', cy.toFixed(2));
}

function showToast(msg, duration = 2800) {
  toastMsg.textContent = msg;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 400);
  }, duration);
}

function setLabel(txt) {
  stateLabel.style.opacity = '0';
  stateLabel.style.transform = 'translateY(6px)';
  setTimeout(() => {
    stateLabel.textContent = txt;
    stateLabel.style.opacity = '1';
    stateLabel.style.transform = 'translateY(0)';
  }, 250);
}

function advanceSessionDot() {
  if (sessionIdx < MAX_SESSIONS) {
    sessionDots[sessionIdx].classList.remove('active');
    sessionDots[sessionIdx].classList.add('done');
    sessionIdx++;
    if (sessionIdx < MAX_SESSIONS) {
      sessionDots[sessionIdx].classList.add('active');
    } else {
      sessionIdx = 0; // loop back
      sessionDots.forEach(d => { d.classList.remove('active','done'); });
      sessionDots[0].classList.add('active');
    }
  }
}

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
  dotIndicator.setAttribute('cx', '120');
  dotIndicator.setAttribute('cy', '16');
  showToast('Session complete — take a breath ✦', 3500);
  advanceSessionDot();

  // Browser notification
  if (Notification.permission === 'granted') {
    new Notification('Flow State', {
      body: 'Session complete — time for a break.',
      icon: '' // add favicon path here later
    });
  }

  // Reset for next session after a beat
  setTimeout(() => {
    totalSecs = parseInt(selectEl.value) * 60;
    remaining = totalSecs;
    setDisplay(remaining);
    setLabel('Ready');
    modeTag.textContent = 'Focus';
  }, 3000);
}

/* --- Core controls --- */
function toggleTimer() {
  if (running) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  if (running) return;
  running = true;
  setLabel('Focusing…');
  modeTag.textContent = 'Focus';
  startPauseBtn.textContent = 'Pause';
  startPauseBtn.classList.remove('paused');
  selectEl.disabled = true;
  ringContainer.classList.add('breathing');

  // Request notification permission on first start
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
  if (!running && remaining === totalSecs) return; // nothing to skip
  clearInterval(interval);
  running = false;
  ringContainer.classList.remove('breathing');
  advanceSessionDot();
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

/* --- Duration change --- */
selectEl.addEventListener('change', () => {
  if (running) return;
  totalSecs = parseInt(selectEl.value) * 60;
  remaining = totalSecs;
  setDisplay(remaining);
});

/* --- Keyboard shortcuts --- */
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'SELECT') return;
  if (e.code === 'Space') { e.preventDefault(); toggleTimer(); }
  if (e.code === 'KeyR')  { resetTimer(); }
});

/* --- CSS transition for label --- */
const labelEl = document.getElementById('stateLabel');
labelEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

/* --- Init display --- */
setDisplay(remaining);
