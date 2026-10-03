const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function fixCreative2() {
  console.log('Converting dyusar-creative-2.png (Hair Model Image) to Case 2 assets...');

  const buf = fs.readFileSync('public/images/dyusar-creative-2.png');
  const webpBuf = await sharp(buf).webp({ quality: 98 }).toBuffer();
  const jpegBuf = await sharp(buf).jpeg({ quality: 98 }).toBuffer();

  const case2Targets = [
    'public/images/hair-before-after-case2.webp',
    'public/images/hair-before-after-case2.jpg',
    'dist/images/hair-before-after-case2.webp',
    'dist/images/hair-before-after-case2.jpg',
    'public/hair-before-after-case2.webp',
    'public/hair-before-after-case2.jpg'
  ];

  for (const t of case2Targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, t.endsWith('.webp') ? webpBuf : jpegBuf);
  }

  console.log('Successfully fixed Case 2 assets with dyusar-creative-2.png!');
}

fixCreative2().catch(console.error);
