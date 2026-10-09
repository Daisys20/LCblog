import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
const [src] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-proxy-server','--disable-gpu','--allow-file-access-from-files'] });
const p = await b.newPage();
await p.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });
const res = await p.evaluate(async (url) => {
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
  const { width } = c;
  const y0 = 225, y1 = 985, rows = y1 - y0;
  const d = ctx.getImageData(0, y0, width, rows).data;
  const cnt = new Array(width).fill(0);
  for (let y = 0; y < rows; y++) for (let x = 0; x < width; x++) {
    const i = (y*width + x)*4;
    if (Math.min(d[i], d[i+1], d[i+2]) < 246) cnt[x]++;
  }
  // 按 4px 分桶
  const bk = [];
  for (let x = 0; x < width; x += 4) { let s = 0, n = 0; for (let k = 0; k < 4 && x+k < width; k++) { s += cnt[x+k]; n++; } bk.push(Math.round(s/n/rows*100)); }
  // 找宽 >=8px 的低谷段（占比 < 8%）
  const low = []; let st = null;
  bk.forEach((v, i) => { if (v < 8 && st === null) st = i; if (v >= 8 && st !== null) { if ((i-st)*4 >= 8) low.push([st*4, i*4]); st = null; } });
  return { low, bk };
}, pathToFileURL(resolve(src)).href);
console.log('低占比段(疑似列间隙 x0-x1):', res.low.map(([a,bb]) => `${a}-${bb}`).join('  '));
await b.close();
