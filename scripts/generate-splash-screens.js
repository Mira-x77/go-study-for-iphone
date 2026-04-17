#!/usr/bin/env node
/**
 * generate-splash-screens.js
 *
 * Generates iOS splash screens from public/icon.png.
 * Run: node scripts/generate-splash-screens.js
 *
 * Requires: sharp  →  npm install -D sharp
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public', 'icon.png');
const SPLASH_DIR = path.join(ROOT, 'public', 'splash');

if (!fs.existsSync(SPLASH_DIR)) fs.mkdirSync(SPLASH_DIR, { recursive: true });

const BG = { r: 99, g: 102, b: 241 }; // #6366f1 — matches theme-color

// [width, height] in actual pixels (device resolution, not CSS pixels)
const sizes = [
  [1290, 2796], // iPhone 14 Pro Max
  [1179, 2556], // iPhone 14 Pro
  [1170, 2532], // iPhone 14 / 13 / 12
  [1284, 2778], // iPhone 14 Plus / 13 Pro Max
  [750,  1334], // iPhone SE
  [828,  1792], // iPhone XR / 11
  [1125, 2436], // iPhone X / XS / 11 Pro
  [1242, 2688], // iPhone XS Max / 11 Pro Max
  [1536, 2048], // iPad
  [1668, 2388], // iPad Pro 11"
  [2048, 2732], // iPad Pro 12.9"
];

const ICON_SIZE_RATIO = 0.25; // icon takes up 25% of the shortest dimension

(async () => {
  for (const [w, h] of sizes) {
    const iconSize = Math.round(Math.min(w, h) * ICON_SIZE_RATIO);
    const iconLeft = Math.round((w - iconSize) / 2);
    const iconTop  = Math.round((h - iconSize) / 2);

    const icon = await sharp(SRC)
      .resize(iconSize, iconSize, { fit: 'contain', background: { ...BG, alpha: 1 } })
      .png()
      .toBuffer();

    await sharp({
      create: { width: w, height: h, channels: 4, background: { ...BG, alpha: 1 } },
    })
      .composite([{ input: icon, left: iconLeft, top: iconTop }])
      .png()
      .toFile(path.join(SPLASH_DIR, `splash-${w}x${h}.png`));

    console.log(`✓ splash-${w}x${h}.png`);
  }
  console.log('\nAll splash screens generated!');
})();
