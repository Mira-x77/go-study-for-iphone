#!/usr/bin/env node
/**
 * generate-pwa-icons.js
 *
 * Generates all required PWA + Apple touch icons from public/icon.png.
 * Run: node scripts/generate-pwa-icons.js
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
const ICONS_DIR = path.join(ROOT, 'public', 'icons');

if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });

const sizes = [
  // Apple touch icons
  { size: 57,  name: 'apple-touch-icon-57.png' },
  { size: 60,  name: 'apple-touch-icon-60.png' },
  { size: 72,  name: 'apple-touch-icon-72.png' },
  { size: 76,  name: 'apple-touch-icon-76.png' },
  { size: 114, name: 'apple-touch-icon-114.png' },
  { size: 120, name: 'apple-touch-icon-120.png' },
  { size: 144, name: 'apple-touch-icon-144.png' },
  { size: 152, name: 'apple-touch-icon-152.png' },
  { size: 180, name: 'apple-touch-icon-180.png' },
  // Manifest icons
  { size: 192, name: 'icon-192.png' },
  { size: 192, name: 'icon-192-maskable.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 512, name: 'icon-512-maskable.png' },
];

(async () => {
  for (const { size, name } of sizes) {
    await sharp(SRC)
      .resize(size, size, { fit: 'contain', background: { r: 99, g: 102, b: 241, alpha: 1 } })
      .png()
      .toFile(path.join(ICONS_DIR, name));
    console.log(`✓ ${name}`);
  }

  // Copy the 180px icon as the default apple-touch-icon to public root
  fs.copyFileSync(
    path.join(ICONS_DIR, 'apple-touch-icon-180.png'),
    path.join(ROOT, 'public', 'apple-touch-icon.png')
  );
  console.log('✓ apple-touch-icon.png (root)');
  console.log('\nAll icons generated successfully!');
})();
