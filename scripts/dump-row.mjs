import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
const [src, y, ...xs] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-proxy-server','--disable-gpu','--allow-file-access-from-files'] });
const p = await b.newPage();
await p.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });
const out = await p.evaluate(async (url, yy, list) => {
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, yy, c.width, 1).data;
  return list.map((x) => { const i = x*4; return `${x}:${d[i]},${d[i+1]},${d[i+2]}`; });
}, pathToFileURL(resolve(src)).href, Number(y), xs.map(Number));
console.log(`y=${y}`, out.join('  '));
await b.close();
