const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function restoreOriginalImages() {
  console.log('Restoring original project creative images for each case...');

  // Case 1: dyusar-creative-1.png -> hair-before-after-case1
  const case1Buffer = fs.readFileSync('public/images/dyusar-creative-1.png');
  const case1Webp = await sharp(case1Buffer).webp({ quality: 95 }).toBuffer();
  const case1Jpeg = await sharp(case1Buffer).jpeg({ quality: 95 }).toBuffer();

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
    fs.writeFileSync(t, t.endsWith('.webp') ? case1Webp : case1Jpeg);
  }

  // Case 2: dyusar-creative-2.png -> hair-before-after-case2
  const case2Buffer = fs.readFileSync('public/images/dyusar-creative-2.png');
  const case2Webp = await sharp(case2Buffer).webp({ quality: 95 }).toBuffer();
  const case2Jpeg = await sharp(case2Buffer).jpeg({ quality: 95 }).toBuffer();

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
    fs.writeFileSync(t, t.endsWith('.webp') ? case2Webp : case2Jpeg);
  }

  console.log('Successfully restored original creative 1 & creative 2 images for both descriptions!');
}

restoreOriginalImages().catch(console.error);
