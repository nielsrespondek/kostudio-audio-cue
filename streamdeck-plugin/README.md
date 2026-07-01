# Kostudio Audio Cue — Stream Deck Plugin

A companion Stream Deck plugin that connects Kostudio Audio Cue to your Elgato Stream Deck. Each button shows a pad's name and live status as a colored background, and pressing a button toggles the pad.

---

## Requirements

- **Stream Deck software** v6.6 or later
- **Kostudio Audio Cue** built from source (this fork) — the standard `.exe` download does not include the HTTP API server required for Stream Deck integration
- **Node.js 18+** (for building the plugin)

---

## Installation

### Option A: Ready-to-use installer (recommended)

1. Download `Kostudio-Audio-Cue.streamDeckPlugin` from the [latest release](https://github.com/nielsrespondek/kostudio-audio-cue/releases/latest)
2. Double-click the file — Stream Deck installs the plugin and the bundled profile automatically
3. Start Kostudio Audio Cue (built from source) and load pads — pad names appear on the buttons automatically

### Option B: Build from source

```bash
cd streamdeck-plugin/com.kostudio.audiocue.sdPlugin
npm install
```

Then copy the entire `com.kostudio.audiocue.sdPlugin` folder to:
```
%AppData%\Elgato\StreamDeck\Plugins\
```

Restart Stream Deck.

---

## How it works

The plugin connects to Kostudio Audio Cue via a local HTTP server on port **28491**. This server is started automatically when Kostudio launches (requires the modified `main.js` from this fork).

### Button colors

| Color | Status |
|---|---|
| 🟢 Dark green | Pad is playing |
| 🟠 Dark orange | Pad is fading out |
| 🔵 Dark blue | Pad is stopped |
| ⬛ Almost black | Pad is empty |

### Included actions

- **Pad steuern** — control a single pad (play/stop toggle). Configure which pad in the Stream Deck property inspector.
- **Stop All** — stops all playing pads immediately

### Bundled profiles

The plugin includes pre-configured profiles for:
- **Stream Deck XL** (8×4 = 32 buttons): Pads 1–31 + Stop All
- **Stream Deck Standard** (5×3 = 15 buttons): Pads 1–14 + Stop All

The correct profile is installed and activated automatically when the plugin is first installed.

---

## Folder structure

```
com.kostudio.audiocue.sdPlugin/
  app.js                        ← main plugin logic
  manifest.json                 ← plugin metadata and profile references
  package.json                  ← npm dependencies (ws)
  property-inspector/
    index.html                  ← per-button pad selector UI
  Profiles/
    XL.streamDeckProfile        ← pre-configured profile for Stream Deck XL
    Standard.streamDeckProfile  ← pre-configured profile for Stream Deck Standard
  imgs/
    *.svg                       ← button icons
```

---

## Building the `.streamDeckPlugin` installer

```bash
cd streamdeck-plugin/com.kostudio.audiocue.sdPlugin
npm install
cd ../..
# Then zip com.kostudio.audiocue.sdPlugin/ and rename to .streamDeckPlugin
```

Or use the GitHub Actions workflow to build automatically on release.

---

## Troubleshooting

**Buttons show no names / stay dark**
→ Make sure Kostudio Audio Cue (built from source) is running. Test: open `http://127.0.0.1:28491/ping` in a browser — it should return `{"ok":true}`.

**Profile did not install automatically**
→ Use the standalone `Kostudio-Audio-Cue.streamDeckProfile` from the releases page. Double-click to import manually.

**Property inspector shows "Kostudio nicht verbunden"**
→ Start Kostudio first, then click "↻ Aktualisieren" in the property inspector.
