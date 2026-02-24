# Chrome Web Store Listing Details

Use this when filling out the Chrome Web Store Developer Dashboard.

---

## Name
SpeedRead

## Summary (132 char max)
Speed read any text on the web — highlight, press Alt+S or right-click, and read one word at a time with RSVP technique.

## Description
SpeedRead lets you speed read any text on the web using the RSVP (Rapid Serial Visual Presentation) technique. Highlight text, press Alt+S or right-click and select "Speed Read Selection", and a reader window opens showing one word at a time with the anchor letter highlighted in red.

Features:
- RSVP speed reading with ORP (Optimal Recognition Point) anchor highlighting
- Adjustable speed from 100 to 1000 WPM
- Adaptive word timing — pauses on punctuation, speeds through short words
- Keyboard shortcuts: Space (play/pause), Arrow keys (skip/speed), R (reset)
- Scrubbable progress bar
- Speed presets (200, 300, 500 WPM)
- Clean, dark interface designed for focus
- Works on any webpage — just highlight and go
- No data collection, no tracking, fully offline

How to use:
1. Highlight any text on a webpage
2. Press Alt+S or right-click and choose "Speed Read Selection"
3. Press Space to start reading
4. Use arrow keys to skip words or adjust speed

## Category
Productivity

## Language
English

---

## Required Assets

### Icon
- 128x128 PNG — use `icons/icon128.png`

### Screenshots (1280x800 or 640x400, at least 1, up to 5)
Take screenshots of:
1. The reader window playing text with the red anchor letter visible
2. The right-click context menu showing "Speed Read Selection"
3. The reader with controls visible (speed slider, progress bar)

### Promo images (optional)
- Small promo tile: 440x280 PNG
- Marquee promo tile: 1400x560 PNG

---

## Justification for Permissions

Use these when the Web Store asks why each permission is needed:

**activeTab**: Required to read the user's text selection on the current page when they activate the extension via keyboard shortcut or context menu.

**scripting**: Required to execute a small script that retrieves the user's text selection from the active tab.

**storage**: Required to temporarily store the selected text in local browser storage so the reader popup window can access it.

**contextMenus**: Required to add a "Speed Read Selection" option to the browser's right-click context menu for easy access.
