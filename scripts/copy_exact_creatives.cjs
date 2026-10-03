const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function copyExactCreatives() {
  console.log('Converting dyusar-creative-2.png (Image 12) directly to Case 2 WebP & JPEG...');

  // CASE 2: Exact dyusar-creative-2.png (Image 12)
  const img12Buffer = fs.readFileSync('public/images/dyusar-creative-2.png');
  const img12Webp = await sharp(img12Buffer).webp({ quality: 98 }).toBuffer();
  const img12Jpeg = await sharp(img12Buffer).jpeg({ quality: 98 }).toBuffer();

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
    fs.writeFileSync(t, t.endsWith('.webp') ? img12Webp : img12Jpeg);
  }

  // CASE 1: Exact dyusar-creative-1.png (Image 13 / Case 1)
  console.log('Converting dyusar-creative-1.png directly to Case 1 WebP & JPEG...');
  const img13Buffer = fs.readFileSync('public/images/dyusar-creative-1.png');
  const img13Webp = await sharp(img13Buffer).webp({ quality: 98 }).toBuffer();
  const img13Jpeg = await sharp(img13Buffer).jpeg({ quality: 98 }).toBuffer();

  const case1Targets = [
    'public/images/hair-before-after-case1.webp',
    'public/images/hair-before-after-case1.jpg',
    'dist/images/hair-before-after-case1.webp',
    'dist/images/hair-before-after-case1.jpg',
    'public/hair-before-after-case1.webp',
    'public/hair-before-after-case1.jpg'
  ];

  for (const t of case1Targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, t.endsWith('.webp') ? img13Webp : img13Jpeg);
  }

  console.log('Exact direct conversion complete!');
}

copyExactCreatives().catch(console.error);
