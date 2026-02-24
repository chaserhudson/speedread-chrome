// ── ORP Anchor Calculator ──
// Lookup table: word length → anchor index (0-based)
function anchorIndex(word) {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 7) return 2;
  if (len <= 11) return 3;
  return 4;
}

// ── Parse text into word tokens ──
function parseText(text) {
  const raw = text.split(/\s+/).filter((w) => w.length > 0);
  return raw.map((word, i) => {
    // Strip leading punctuation for anchor calculation
    const stripped = word.replace(/^[^a-zA-Z0-9]+/, "");
    const offset = word.length - stripped.length;
    const ai = offset + anchorIndex(stripped.length > 0 ? stripped : word);
    const clamped = Math.min(ai, word.length - 1);

    const trailingPunct = /[.!?]$/.test(word);
    const clausePunct = /[,;:\-—]$/.test(word);

    return {
      text: word,
      anchorIdx: clamped,
      trailingPunct,
      clausePunct,
    };
  });
}

// ── Adaptive timing ──
function wordDelay(token, baseMs) {
  let mult = 1.0;
  const len = token.text.length;
  if (len <= 3) mult *= 0.85;
  else if (len >= 12) mult *= 1.4;
  else if (len >= 8) mult *= 1.2;

  if (token.trailingPunct) mult *= 1.6;
  else if (token.clausePunct) mult *= 1.3;

  return baseMs * mult;
}

// ── State ──
let words = [];
let currentIndex = 0;
let isPlaying = false;
let wpm = 300;
let playbackTimer = null;

// ── DOM refs ──
const prefixEl = document.getElementById("prefix");
const anchorEl = document.getElementById("anchor");
const suffixEl = document.getElementById("suffix");
const btnPlay = document.getElementById("btn-play");
const btnBack10 = document.getElementById("btn-back10");
const btnFwd10 = document.getElementById("btn-fwd10");
const btnReset = document.getElementById("btn-reset");
const speedSlider = document.getElementById("speed-slider");
const wpmLabel = document.getElementById("wpm-label");
const progressBar = document.getElementById("progress-bar");
const progressBarContainer = document.getElementById("progress-bar-container");
const progressText = document.getElementById("progress-text");
const wordContainer = document.getElementById("word-container");

// ── Display a word ──
function displayWord(token) {
  if (!token) {
    prefixEl.textContent = "";
    anchorEl.textContent = "";
    suffixEl.textContent = "";
    return;
  }

  const text = token.text;
  const ai = token.anchorIdx;

  prefixEl.textContent = text.slice(0, ai);
  anchorEl.textContent = text[ai] || "";
  suffixEl.textContent = text.slice(ai + 1);

  // Position so the anchor character aligns with the center line.
  // word-container has left:50%, so its left edge is at center.
  // We shift left by (anchorIdx * charWidth + charWidth/2) to center the anchor char.
  const charWidth = measureCharWidth();
  const shift = -(ai * charWidth + charWidth / 2);
  wordContainer.style.left = "50%";
  wordContainer.style.transform = `translateX(${shift}px)`;

  updateProgress();
}

// Cache char width measurement
let cachedCharWidth = null;
function measureCharWidth() {
  if (cachedCharWidth) return cachedCharWidth;
  const span = document.createElement("span");
  span.style.font = getComputedStyle(wordContainer).font;
  span.style.visibility = "hidden";
  span.style.position = "absolute";
  span.textContent = "M";
  document.body.appendChild(span);
  cachedCharWidth = span.getBoundingClientRect().width;
  span.remove();
  return cachedCharWidth;
}

function updateProgress() {
  const pct = words.length > 0 ? (currentIndex / words.length) * 100 : 0;
  progressBar.style.width = pct + "%";
  progressText.textContent = `${currentIndex} / ${words.length}`;
}

// ── Playback ──
function play() {
  if (words.length === 0) return;
  if (currentIndex >= words.length) currentIndex = 0;
  isPlaying = true;
  btnPlay.textContent = "⏸";
  tick();
}

function pause() {
  isPlaying = false;
  btnPlay.textContent = "▶";
  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
}

function togglePlay() {
  isPlaying ? pause() : play();
}

function tick() {
  if (!isPlaying || currentIndex >= words.length) {
    pause();
    return;
  }

  const token = words[currentIndex];
  displayWord(token);
  currentIndex++;

  const baseMs = 60000 / wpm;
  const delay = wordDelay(token, baseMs);
  playbackTimer = setTimeout(tick, delay);
}

function skip(n) {
  currentIndex = Math.max(0, Math.min(words.length, currentIndex + n));
  if (!isPlaying && currentIndex < words.length) {
    displayWord(words[currentIndex]);
  }
}

function reset() {
  pause();
  currentIndex = 0;
  if (words.length > 0) displayWord(words[0]);
  else displayWord(null);
}

function seekTo(fraction) {
  const idx = Math.floor(fraction * words.length);
  currentIndex = Math.max(0, Math.min(words.length - 1, idx));
  if (!isPlaying) displayWord(words[currentIndex]);
}

// ── Speed ──
function setWPM(val) {
  wpm = val;
  speedSlider.value = val;
  wpmLabel.textContent = val + " WPM";
}

// ── Event listeners ──
btnPlay.addEventListener("click", togglePlay);
btnBack10.addEventListener("click", () => skip(-10));
btnFwd10.addEventListener("click", () => skip(10));
btnReset.addEventListener("click", reset);

speedSlider.addEventListener("input", () => {
  setWPM(parseInt(speedSlider.value));
});

document.querySelectorAll(".preset").forEach((btn) => {
  btn.addEventListener("click", () => {
    setWPM(parseInt(btn.dataset.wpm));
  });
});

// Scrub progress bar
progressBarContainer.addEventListener("click", (e) => {
  const rect = progressBarContainer.getBoundingClientRect();
  const fraction = (e.clientX - rect.left) / rect.width;
  seekTo(fraction);
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    togglePlay();
  } else if (e.code === "ArrowLeft") {
    e.preventDefault();
    skip(-10);
  } else if (e.code === "ArrowRight") {
    e.preventDefault();
    skip(10);
  } else if (e.code === "ArrowUp") {
    e.preventDefault();
    setWPM(Math.min(1000, wpm + 25));
  } else if (e.code === "ArrowDown") {
    e.preventDefault();
    setWPM(Math.max(100, wpm - 25));
  } else if (e.code === "KeyR") {
    e.preventDefault();
    reset();
  }
});

// Invalidate char width cache on resize
window.addEventListener("resize", () => {
  cachedCharWidth = null;
});

// ── Load text from storage ──
chrome.storage.local.get("speedReadText", (data) => {
  const text = data.speedReadText;
  if (!text) {
    prefixEl.textContent = "";
    anchorEl.textContent = "No text selected";
    suffixEl.textContent = "";
    return;
  }

  words = parseText(text);
  if (words.length > 0) {
    displayWord(words[0]);
    updateProgress();
  }
});
