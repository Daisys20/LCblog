import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
const [src, ...ys] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-proxy-server','--disable-gpu','--allow-file-access-from-files'] });
const p = await b.newPage();
await p.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });
const out = await p.evaluate(async (url, list) => {
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
  const { width } = c;
  const res = [];
  for (const y of list) {
    const d = ctx.getImageData(0, y, width, 1).data;
    const ink = (x) => { const i = x*4; return Math.min(d[i], d[i+1], d[i+2]) < 232; };
    const runs = []; let s = null;
    for (let x = 0; x < width; x++) {
      if (ink(x) && s === null) s = x;
      if (!ink(x) && s !== null) { if (x - s >= 25) runs.push([s, x]); s = null; }
    }
    if (s !== null && width - s >= 25) runs.push([s, width]);
    res.push({ y, runs });
  }
  return res;
}, pathToFileURL(resolve(src)).href, ys.map(Number));
for (const r of out) console.log(`y=${r.y}: ` + r.runs.map(([a,bb]) => `${a}-${bb}(w${bb-a})`).join('  '));
await b.close();
