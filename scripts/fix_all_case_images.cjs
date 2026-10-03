const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function fixAllCaseImages() {
  console.log('Fixing Case 1 (Brunette) and Case 2 (Blonde) images...');

  // 1. Brunette Image (dyusar-creative-2.png)
  const brunetteBuf = fs.readFileSync('public/images/dyusar-creative-2.png');
  const brunetteWebp = await sharp(brunetteBuf).webp({ quality: 98 }).toBuffer();
  const brunetteJpg = await sharp(brunetteBuf).jpeg({ quality: 98 }).toBuffer();

  const brunetteTargets = [
    'public/images/hair-before-after-case2.webp',
    'public/images/hair-before-after-case2.jpg',
    'public/images/brunette-hair-case.png',
    'dist/images/hair-before-after-case2.webp',
    'dist/images/hair-before-after-case2.jpg',
    'dist/images/brunette-hair-case.png',
    'public/hair-before-after-case2.webp'
  ];

  for (const t of brunetteTargets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (t.endsWith('.png')) fs.writeFileSync(t, brunetteBuf);
    else if (t.endsWith('.webp')) fs.writeFileSync(t, brunetteWebp);
    else fs.writeFileSync(t, brunetteJpg);
  }

  // 2. Blonde Image (dyusar-creative-1.png -> 0123.png)
  const blondeBuf = fs.readFileSync('public/images/dyusar-creative-1.png');
  const blondeWebp = await sharp(blondeBuf).webp({ quality: 98 }).toBuffer();
  const blondeJpg = await sharp(blondeBuf).jpeg({ quality: 98 }).toBuffer();

  const blondeTargets = [
    'public/images/hair-before-after-case1.webp',
    'public/images/hair-before-after-case1.jpg',
    'public/images/blonde-hair-case.png',
    'dist/images/hair-before-after-case1.webp',
    'dist/images/hair-before-after-case1.jpg',
    'dist/images/blonde-hair-case.png',
    'public/hair-before-after-case1.webp'
  ];

  for (const t of blondeTargets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (t.endsWith('.png')) fs.writeFileSync(t, blondeBuf);
    else if (t.endsWith('.webp')) fs.writeFileSync(t, blondeWebp);
    else fs.writeFileSync(t, blondeJpg);
  }

  console.log('Successfully fixed Case 1 (Brunette) and Case 2 (Blonde 0123) image assets!');
}

fixAllCaseImages().catch(console.error);
