/**
 * build.js – erstellt Kostudio-Audio-Cue.streamDeckPlugin
 * Aufruf: node build.js
 * Voraussetzung: npm install wurde im com.kostudio.audiocue.sdPlugin/ Ordner ausgeführt
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PLUGIN_DIR = path.join(__dirname, 'com.kostudio.audiocue.sdPlugin');
const OUT_FILE   = path.join(__dirname, '..', 'Kostudio-Audio-Cue.streamDeckPlugin');
const ZIP_TEMP   = OUT_FILE.replace('.streamDeckPlugin', '.zip');

if (fs.existsSync(OUT_FILE)) fs.unlinkSync(OUT_FILE);
if (fs.existsSync(ZIP_TEMP)) fs.unlinkSync(ZIP_TEMP);

console.log('Erstelle .streamDeckPlugin...');

execSync(
  `powershell -Command "Compress-Archive -Path '${PLUGIN_DIR}' -DestinationPath '${ZIP_TEMP}'"`,
  { stdio: 'inherit', shell: 'powershell.exe' }
);

fs.renameSync(ZIP_TEMP, OUT_FILE);
console.log(`\n✓ Erstellt: ${OUT_FILE}`);
