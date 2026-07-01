# Kostudio Audio Cue

A professional live performance audio cue manager. Load sounds onto pads, build cue sequences, and trigger them by keyboard shortcut or button — designed for theatre, events, and live shows.

[![Version](https://img.shields.io/github/v/release/unilordgr/kostudio-audio-cue?style=flat-square&color=brightgreen)](https://github.com/unilordgr/kostudio-audio-cue/releases/latest)

---

## Download

| Platform | | |
|---|---|---|
| **Windows** x64 | Portable — no install needed | [![Windows](https://img.shields.io/badge/Download-.exe-0078d4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/nielsrespondek/kostudio-audio-cue/releases/latest/download/Kostudio-Audio-Cue-x64.exe) |
| **iPad / Browser** | Safari · Chrome · Edge | [![iPad](https://img.shields.io/badge/Download-HTML%20file-00d4ff?style=for-the-badge&logo=safari&logoColor=white)](https://github.com/nielsrespondek/kostudio-audio-cue/releases/latest/download/Kostudio-Audio-Cue-iPad-Web.html) |

> All releases: [github.com/nielsrespondek/kostudio-audio-cue/releases](https://github.com/nielsrespondek/kostudio-audio-cue/releases)

> This is a fork of [unilordgr/kostudio-audio-cue](https://github.com/unilordgr/kostudio-audio-cue) with additional features. For macOS builds, use the original repository.

### First-run warnings (app is unsigned)

**Windows — SmartScreen prompt**

Click **More info** → **Run anyway**.

---

## Features

### Cue Pads
- **Any number of pads** — each with its own audio file, colour, and keyboard shortcut
- **Colour + shortcut** displayed in a left column on each pad for quick identification
- **Rename** any pad by double-clicking its name
- **Drag & drop** audio files directly onto pads

### Playback & Transport
- **Play / Pause / Resume / Stop** — dedicated transport controls per pad
- **Crossfade engine** — playing a new pad automatically fades out the previous one
- **Configurable fade duration** — set the crossfade time in seconds (header control)
- **Per-pad fade toggle** — enable or disable fade-in per pad independently
- **Per-pad volume** — individual sliders plus a master volume control
- **Loop toggle** — loop any cue indefinitely
- **⏏ Global Stop Fade toggle** *(added in this fork)* — a header button that controls whether stopping a pad (click, touch, or keyboard shortcut) fades out smoothly or cuts instantly. Default is OFF so original behavior is preserved. The play button blinks during the fade as visual feedback.

### IN / OUT Points
- **Set an IN point** — scrub the timeline to a position, click **▶ IN** to mark where playback starts
- **Set an OUT point** — scrub to the end position, click **OUT ◼** to mark where playback stops
- **No OUT point** — plays to the end of the track
- **Loop with IN/OUT** — loops within the marked region
- **Click again to reset** — clicking a set IN or OUT point clears it
- Visual markers on the timeline bar show exactly where IN and OUT are set

### Timeline
- **Thick scrub bar** — easy to click and drag-seek with the mouse
- **Active zone highlight** — the region between IN and OUT is shaded on the bar
- **Click to seek** — click anywhere on the bar to jump to that position
- **Live time display** — shows current position and total duration

### Cue Stack
- **Drag cues into a sequence** and step through them with `SPACE` or the Next Cue button
- **Click to select** — clicking a stack item selects it without playing (highlights in blue)
- **▶ PLAY CUE** — dedicated button plays the selected cue, stops all other audio first
- **■ STOP CUE** — the same button transforms while playing; click again to stop with fade
- **Multiple Scenes** — separate stacks per scene (e.g. Act 1, Act 2), tab-switched instantly
- **Auto-advance** — automatically moves to the next cue when the current one finishes
- **Stack text scale** — independently resize the cue stack text with − / + buttons

### Interface & Scale
- **Kcue app icon** — custom icon visible in taskbar, dock, title bar, and browser tab
- **Header always fixed** — Save, Load, VOL, STOP ALL never scale or disappear
- **PADS scale** — zoom the pad grid from 40% to 200% using the − / + controls (bottom-left, always visible)
- **Stack + footer fixed** — cue stack panel and status bar stay at full size regardless of zoom level
- **Stack text scale** — resize stack list text independently (70%–160%)
- **Light & Dark theme** — toggle with one click, preference saved
- **Responsive layout** — header, footer, and stack panel stay anchored at all zoom levels

### Shortcuts
- **Custom hotkeys** — assign Ctrl / Alt / Shift + key combos to any pad
- **Default pad keys** — `1`–`8`, `Q`–`R` trigger crossfade play instantly
- **`SPACE`** — advances to the next cue in the stack
- **`Escape`** *(added in this fork)* — stops all playing pads immediately (respects Stop Fade toggle)

### Save / Load
- **Save / Save As / Load** — project files store audio file paths (Windows app) or copies (browser)
- **Missing file recovery** — if audio has moved, a dialog lets you Locate each file or Browse Folder to reconnect all at once
- **Session autosave** — recovers your layout automatically if you close without saving

### Auto-Update
- On launch, the app silently checks GitHub for a newer version
- If an update is available: a native dialog asks **Download Now** or **Later**
- **Windows**: downloads the new `.exe` in the background, shows a progress bar in the app, then automatically replaces itself and restarts — no browser needed

---

## Stream Deck Integration *(added in this fork)*

A companion Stream Deck plugin (`streamdeck-plugin/`) connects Kostudio Audio Cue to your Elgato Stream Deck via a local HTTP server.

### What it does
- Each Stream Deck button shows the **pad name** and its **live status** as a colored background:
  - 🟢 Dark green = playing
  - 🟠 Dark orange = fading out
  - 🔵 Dark blue = stopped
  - ⬛ Almost black = empty pad
- Pressing a button **toggles the pad** (play/stop, respects the Stop Fade toggle)
- A dedicated **Stop All** button is included
- **Profiles for Stream Deck XL (8×4) and Standard (5×3)** are bundled and install automatically

### Installation
1. Download `Kostudio-Audio-Cue.streamDeckPlugin` from the [latest release](../../releases/latest)
2. Double-click to install — Stream Deck installs the plugin and profile automatically
3. Build Kostudio from source (see below) — the Stream Deck API server is included in `main.js`
4. Start Kostudio, load pads — pad names appear on the Stream Deck buttons automatically

> The Stream Deck integration requires building from source since it adds an HTTP server to `main.js`. The standard `.exe` download does not include this feature.

---

## Getting Started

### Windows (Portable .exe)
1. Download `Kostudio Audio Cue.exe` from the [latest release](../../releases/latest)
2. Double-click — no installation needed
3. Drag audio files onto pads or click a pad to browse

### macOS / Browser (no install)
Open `kostudio cue.html` directly in **Chrome** or **Edge**.
> Safari is not supported — the File System Access API (Save/Load) requires Chrome or Edge.

---

## Saving Projects

| | Windows App | Browser |
|---|---|---|
| **Save As** | Saves a `.cuepro` file anywhere on disk; audio file paths are stored | Copies audio files into a project folder |
| **Save** | Overwrites the last saved `.cuepro` instantly | Same as Save As |
| **Load** | Opens a `.cuepro` file; missing audio can be re-linked | Opens a saved project folder |

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `SPACE` | Next cue in stack |
| `Escape` | Stop all pads *(added in this fork)* |
| `1` – `8`, `Q` – `R` | Default pad shortcuts (crossfade play) |
| Custom | Assign Ctrl/Alt/Shift combos via the Shortcuts panel |

Click the key badge on any pad to reassign it.

---

## Building from Source

**Requirements:** Node.js 18+

```bash
git clone https://github.com/nielsrespondek/kostudio-audio-cue.git
cd kostudio-audio-cue
npm install
npm start          # run in development
npm run dist-win   # build Windows portable .exe
```

---

## Tech Stack

- **Electron** — desktop wrapper
- **Vanilla JS / HTML / CSS** — no frameworks, single file renderer
- **Web Audio API** — playback engine
- **File System Access API** — save/load in browser mode
- **IndexedDB** — project registry in browser mode
- **electron-builder** — packaging
- **GitHub Actions** — automated Windows build and release

---

## License

MIT
