/**
 * Kostudio Audio Cue – Stream Deck Plugin
 *
 * Enthält zwei Aktionen:
 *   com.kostudio.audiocue.padcontrol  – steuert ein einzelnes Pad
 *   com.kostudio.audiocue.stopall     – stoppt alle Pads (= Escape in Kostudio)
 *
 * Beim Installieren aktiviert das Plugin automatisch das mitgelieferte
 * "Kostudio Audio Cue"-Profil mit 12 Pad-Buttons + 1 Stop-All-Button.
 */

'use strict';

const http = require('http');
const { WebSocket } = require('ws');

// ── Stream Deck launch arguments ──────────────────────────
const args       = Object.fromEntries(
  process.argv.slice(2).reduce((acc, v, i, a) => {
    if (v.startsWith('-')) acc.push([v.slice(1), a[i + 1]]);
    return acc;
  }, [])
);
const SD_PORT     = args.port;
const PLUGIN_UUID = args.pluginUUID;
const REG_EVENT   = args.registerEvent;

// ── State ─────────────────────────────────────────────────
const padInstances  = new Map(); // context → padId  (for padcontrol action)
const stopInstances = new Set(); // contexts           (for stopall action)
let   firstDevice   = null;      // first connected SD device ID
let   padState      = [];        // live pad data from Kostudio
let   kosConnected  = false;      // SSE connection to Kostudio active

// ── Stream Deck WebSocket ─────────────────────────────────
const sdWS = new WebSocket(`ws://127.0.0.1:${SD_PORT}`);

function sdSend(obj) {
  if (sdWS.readyState === WebSocket.OPEN) sdWS.send(JSON.stringify(obj));
}

sdWS.on('open', () => {
  sdSend({ event: REG_EVENT, uuid: PLUGIN_UUID });
});

sdWS.on('message', (raw) => {
  let msg;
  try { msg = JSON.parse(raw); } catch { return; }

  switch (msg.event) {

    // ── Device connected → Profil anhand Gerätetyp wählen ──
    case 'deviceDidConnect': {
      if (!firstDevice) {
        firstDevice = msg.device;

        // Gerätetyp erkennen: 2 = XL (8x4), sonst Standard
        const deviceType  = msg.deviceInfo?.type ?? 0;
        const profileName = deviceType === 2 ? 'Profiles/XL' : 'Profiles/Standard';

        // switchToProfile: wenn Profil nicht installiert,
        // fragt SD den User ob er es installieren möchte
        sdSend({
          event:   'switchToProfile',
          context: PLUGIN_UUID,
          device:  firstDevice,
          payload: { profile: profileName },
        });
      }
      break;
    }

    // ── Pad control: button appears ───────────────────────
    case 'willAppear': {
      const ctx    = msg.context;
      const uuid   = msg.action;
      const padId  = msg.payload?.settings?.padId ?? null;

      if (uuid === 'com.kostudio.audiocue.padcontrol') {
        padInstances.set(ctx, padId);
        updatePadButton(ctx, padId);
      } else if (uuid === 'com.kostudio.audiocue.stopall') {
        stopInstances.add(ctx);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144">
  <rect width="144" height="144" rx="16" fill="#2a0000"/>
  <text x="72" y="72" font-family="system-ui,sans-serif" font-size="52" text-anchor="middle" dominant-baseline="middle" fill="#ff3355">■</text>
  <text x="72" y="118" font-family="system-ui,sans-serif" font-size="20" font-weight="700" text-anchor="middle" fill="#ff3355">STOP ALL</text>
</svg>`;
        const img = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
        sdSend({ event: 'setTitle', context: ctx, payload: { title: '', target: 0 } });
        sdSend({ event: 'setImage', context: ctx, payload: { image: img, target: 0 } });
      }
      break;
    }

    case 'willDisappear': {
      padInstances.delete(msg.context);
      stopInstances.delete(msg.context);
      break;
    }

    // ── Settings saved in property inspector ──────────────
    case 'didReceiveSettings': {
      const ctx   = msg.context;
      const padId = msg.payload?.settings?.padId ?? null;
      if (padInstances.has(ctx) || padId != null) {
        padInstances.set(ctx, padId);
        updatePadButton(ctx, padId);
      }
      break;
    }

    // ── Key pressed ───────────────────────────────────────
    case 'keyDown': {
      const ctx  = msg.context;
      const uuid = msg.action;

      if (uuid === 'com.kostudio.audiocue.padcontrol') {
        const padId = padInstances.get(ctx);
        if (padId != null) kostudioCommand({ type: 'toggle', id: padId });

      } else if (uuid === 'com.kostudio.audiocue.stopall') {
        kostudioCommand({ type: 'stop_all' });
      }
      break;
    }

    // ── Property inspector communication ──────────────────
    case 'sendToPlugin': {
      const ctx   = msg.context;
      const padId = msg.payload?.padId ?? null;

      if (padId != null) {
        padInstances.set(ctx, padId);
        sdSend({ event: 'setSettings', context: ctx, payload: { padId } });
        updatePadButton(ctx, padId);
      }

      // Always send current pad list + connection status to property inspector
      sdSend({
        event:   'sendToPropertyInspector',
        context: ctx,
        action:  'com.kostudio.audiocue.padcontrol',
        payload: { pads: padState, kostudioConnected: kosConnected },
      });
      break;
    }

    default: break;
  }
});

// ── Button rendering ──────────────────────────────────────

// Status-Farben (Hintergrund des Buttons)
const COLOR = {
  empty:   '#111111',   // kein Pad zugewiesen / leer
  stopped: '#0d1a2e',   // hat Datei, gestoppt   → dunkles Blau
  playing: '#0a2a0a',   // spielt                 → dunkles Grün
  fading:  '#2a1200',   // faded aus              → dunkles Orange
  paused:  '#1a1a3a',   // pausiert               → dunkles Violett
};

function makePadSvg(name, color, padNum) {
  // Langer Name → ggf. zwei Zeilen
  const words = (name || '').split(' ');
  let line1 = '', line2 = '';
  for (const w of words) {
    if ((line1 + ' ' + w).trim().length <= 11) line1 = (line1 + ' ' + w).trim();
    else line2 = (line2 + ' ' + w).trim();
  }
  if (line2.length > 12) line2 = line2.substring(0, 11) + '…';

  const numLabel  = `<text x="10" y="18" font-family="system-ui,sans-serif" font-size="14" fill="rgba(255,255,255,0.35)">${padNum}</text>`;
  const textY     = line2 ? '75' : '82';
  const textBlock = line2
    ? `<text x="72" y="${textY}" font-family="system-ui,sans-serif" font-size="22" font-weight="700" text-anchor="middle" fill="#fff">${line1}</text>
       <text x="72" y="${parseInt(textY)+26}" font-family="system-ui,sans-serif" font-size="22" font-weight="700" text-anchor="middle" fill="#fff">${line2}</text>`
    : `<text x="72" y="${textY}" font-family="system-ui,sans-serif" font-size="24" font-weight="700" text-anchor="middle" fill="#fff">${line1}</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144">
  <rect width="144" height="144" rx="16" fill="${color}"/>
  ${numLabel}
  ${textBlock}
</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

function updatePadButton(ctx, padId) {
  if (padId == null) {
    sdSend({ event: 'setTitle', context: ctx, payload: { title: '', target: 0 } });
    sdSend({ event: 'setImage', context: ctx, payload: { image: makePadSvg('—', COLOR.empty, ''), target: 0 } });
    return;
  }

  const pad    = padState.find(p => p.id === padId);
  const num    = padId + 1;
  const name   = (pad?.name) || `Pad ${num}`;

  let color;
  if (!pad || !pad.hasFile)    color = COLOR.empty;
  else if (pad.fading)         color = COLOR.fading;
  else if (pad.playing)        color = COLOR.playing;
  else if (pad.paused)         color = COLOR.paused;
  else                         color = COLOR.stopped;

  const displayName = (!pad || !pad.hasFile) ? `Pad ${num}` : name;

  sdSend({ event: 'setTitle', context: ctx, payload: { title: '', target: 0 } });
  sdSend({ event: 'setImage', context: ctx, payload: { image: makePadSvg(displayName, color, num), target: 0 } });
  sdSend({ event: 'setState', context: ctx, payload: { state: (pad?.playing || pad?.fading) ? 1 : 0 } });
}

function updateAllButtons() {
  for (const [ctx, padId] of padInstances) updatePadButton(ctx, padId);
}

// ── Kostudio SSE connection ───────────────────────────────

const RETRY_MS = 3000;

function connectToKostudio() {
  const req = http.get('http://127.0.0.1:28491/events', (res) => {
    if (res.statusCode !== 200) {
      res.resume();
      kosConnected = false;
      setTimeout(connectToKostudio, RETRY_MS);
      return;
    }

    kosConnected = true;

    let buffer = '';
    res.on('data', (chunk) => {
      buffer += chunk.toString();
      const parts = buffer.split('\n\n');
      buffer = parts.pop();
      for (const part of parts) {
        for (const line of part.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const msg = JSON.parse(line.slice(6));
              if (msg.type === 'pads' && Array.isArray(msg.pads)) {
                padState = msg.pads;
                updateAllButtons();
              }
            } catch { /* ignore */ }
          }
        }
      }
    });

    res.on('end', () => {
      kosConnected = false;
      setTimeout(connectToKostudio, RETRY_MS);
    });
    res.on('error', () => {
      kosConnected = false;
      setTimeout(connectToKostudio, RETRY_MS);
    });
  });

  req.on('error', () => {
    kosConnected = false;
    setTimeout(connectToKostudio, RETRY_MS);
  });
}

// ── Kostudio command ──────────────────────────────────────

function kostudioCommand(cmd) {
  const body = JSON.stringify(cmd);
  const req  = http.request({
    hostname: '127.0.0.1', port: 28491, path: '/command', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  });
  req.on('error', () => {});
  req.write(body);
  req.end();
}

// ── Start ─────────────────────────────────────────────────
connectToKostudio();
