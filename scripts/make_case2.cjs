const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createCase2ExactSquareGraphic() {
  const size = 1024;

  // 1. Woman's hair photo filling the square
  const hairPhotoBuffer = await sharp('public/images/avatar-brunette.jpg')
    .resize(size, size, { fit: 'cover', position: 'top' })
    .toBuffer();

  // 2. SVG overlay matching Image 12 (woman hair + 2 target zoom circles + pointer lines)
  const svgOverlay = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="vignette" cx="70%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.25"/>
        <stop offset="60%" stop-color="#000000" stop-opacity="0.65"/>
        <stop offset="100%" stop-color="#050508" stop-opacity="0.95"/>
      </radialGradient>

      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#eab308"/>
        <stop offset="100%" stop-color="#ca8a04"/>
      </linearGradient>

      <filter id="shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.8"/>
      </filter>
    </defs>

    <!-- Dark vignette gradient -->
    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#vignette)"/>

    <!-- Pointer Line 1 (from hair at x:470, y:370 to Circle 1 at x:620, y:330) -->
    <line x1="470" y1="370" x2="620" y2="330" stroke="#fef08a" stroke-width="3" />
    <circle cx="470" cy="370" r="6" fill="#fef08a" stroke="#ffffff" stroke-width="1.5"/>

    <!-- Pointer Line 2 (from lower hair at x:490, y:870 to Circle 2 at x:620, y:760) -->
    <line x1="490" y1="870" x2="620" y2="760" stroke="#fef08a" stroke-width="3" />
    <circle cx="490" cy="870" r="6" fill="#fef08a" stroke="#ffffff" stroke-width="1.5"/>

    <!-- Circle 1: Porosidade Extrema (Top Right: cx=770, cy=330, r=160) -->
    <g filter="url(#shadow)">
      <circle cx="770" cy="330" r="160" fill="#121319" stroke="url(#goldGrad)" stroke-width="5"/>
      <circle cx="770" cy="330" r="150" fill="none" stroke="#eab308" stroke-width="1.5" stroke-dasharray="6,6"/>
      
      <!-- Porosidade strand close-up graphic -->
      <g transform="translate(770, 330)">
        <path d="M -110 0 Q -40 -50, 0 0 T 110 0" stroke="#fef08a" stroke-width="14" fill="none" stroke-linecap="round"/>
        <path d="M -90 -30 Q -30 -80, 20 -30 T 100 -30" stroke="#ca8a04" stroke-width="8" fill="none" opacity="0.85"/>
        <path d="M -90 30 Q -30 -20, 20 30 T 100 30" stroke="#eab308" stroke-width="8" fill="none" opacity="0.85"/>
        <circle cx="-50" cy="-20" r="5" fill="#ffffff"/>
        <circle cx="10" cy="10" r="6" fill="#fef08a"/>
        <circle cx="60" cy="-25" r="5" fill="#ffffff"/>
      </g>
    </g>

    <!-- Circle 2: Pontas Duplas (Bottom Right: cx=750, cy=730, r=140) -->
    <g filter="url(#shadow)">
      <circle cx="750" cy="730" r="140" fill="#121319" stroke="url(#goldGrad)" stroke-width="5"/>
      <circle cx="750" cy="730" r="130" fill="none" stroke="#eab308" stroke-width="1.5" stroke-dasharray="6,6"/>
      
      <!-- Split ends close-up graphic -->
      <g transform="translate(750, 730)">
        <path d="M -90 0 L 0 0" stroke="#eab308" stroke-width="12" stroke-linecap="round"/>
        <path d="M 0 0 L 80 -60" stroke="#fef08a" stroke-width="9" stroke-linecap="round"/>
        <path d="M 0 0 L 90 0" stroke="#eab308" stroke-width="9" stroke-linecap="round"/>
        <path d="M 0 0 L 80 60" stroke="#ca8a04" stroke-width="9" stroke-linecap="round"/>
      </g>
    </g>
  </svg>`;

  const finalWebpBuffer = await sharp(hairPhotoBuffer)
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toBuffer();

  const finalJpegBuffer = await sharp(finalWebpBuffer)
    .jpeg({ quality: 95 })
    .toBuffer();

  const targets = [
    'public/images/hair-before-after-case2.webp',
    'public/images/hair-before-after-case2.jpg',
    'dist/images/hair-before-after-case2.webp',
    'dist/images/hair-before-after-case2.jpg'
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, t.endsWith('.webp') ? finalWebpBuffer : finalJpegBuffer);
  }
  console.log('Replaced Image 11 with Image 12 across all public and dist locations!');
}

createCase2ExactSquareGraphic().catch(console.error);
