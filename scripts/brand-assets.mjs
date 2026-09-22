import { createRequire } from 'node:module';
import { mkdir, copyFile } from 'node:fs/promises';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const logos = require('@ribocarrew/sandboxmodellen-assets');
const OUT = 'public/brand';
const WEB_OUT = 'apps/web/public/brand';

const jobs = [
  // Hovedlogo med fodspor (2x opløsning til skarpe skærme)
  { src: logos.LOGO_SIMPELT,  name: 'logo-header', width: 112 },
  { src: logos.LOGO_SIMPELT,  name: 'logo-om',     width: 480 },
  // Minimalt logo til små størrelser
  { src: logos.LOGO_MINIMALT, name: 'logo-footer', width: 96 },
  { src: logos.LOGO_MINIMALT, name: 'favicon-32',       width: 32,  png: true },
  { src: logos.LOGO_MINIMALT, name: 'apple-touch-icon', width: 180, png: true },
];

await mkdir(OUT, { recursive: true });
await mkdir(WEB_OUT, { recursive: true });

for (const j of jobs) {
  const img = sharp(j.src).resize({ width: j.width });
  if (j.png) {
    const pngPath = `${OUT}/${j.name}.png`;
    await img.png({ compressionLevel: 9 }).toFile(pngPath);
    await copyFile(pngPath, `${WEB_OUT}/${j.name}.png`);
  } else {
    const webpPath = `${OUT}/${j.name}.webp`;
    const pngPath = `${OUT}/${j.name}.png`;
    await img.clone().webp({ quality: 85 }).toFile(webpPath);
    await img.clone().png({ compressionLevel: 9 }).toFile(pngPath);
    await copyFile(webpPath, `${WEB_OUT}/${j.name}.webp`);
    await copyFile(pngPath, `${WEB_OUT}/${j.name}.png`);
  }
}
console.log('Brand-assets skrevet til', OUT);
