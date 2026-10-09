/**
 * 把任意图片（png / jpg / jfif）缩放并转成压缩后的 JPEG，放到 public/images 下。
 * 为什么用 headless Chrome：本机没有 Pillow / sharp，浏览器自带 JPEG 编码器且同源不污染 canvas。
 *
 * 用法：node scripts/resize-image.mjs <源文件路径> <输出文件名> [最大宽度] [质量]
 * 例：node scripts/resize-image.mjs "C:/Users/PC/Downloads/a.jfif" keep-going-photo.jpg 900 0.82
 */
import { copyFile, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import puppeteer from 'puppeteer-core';

const [src, outName, maxWidth = '900', quality = '0.82'] = process.argv.slice(2);
if (!src || !outName) {
  console.error('用法：node scripts/resize-image.mjs <源文件路径> <输出文件名> [最大宽度] [质量]');
  process.exit(1);
}

const BASE = 'http://127.0.0.1:5173';
const DIR = path.resolve('public/images');
const STAGE = path.join(DIR, '__stage-' + path.basename(src).replace(/[^\w.-]/g, '_'));
await mkdir(DIR, { recursive: true });
await copyFile(src, STAGE);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30_000 });

const res = await page.evaluate(
  async (url, maxW, q) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const ratio = Math.min(1, maxW / img.naturalWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * ratio);
    c.height = Math.round(img.naturalHeight * ratio);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return {
      data: c.toDataURL('image/jpeg', q),
      from: `${img.naturalWidth}x${img.naturalHeight}`,
      to: `${c.width}x${c.height}`,
    };
  },
  `${BASE}/images/${path.basename(STAGE)}`,
  +maxWidth,
  +quality,
);

const buf = Buffer.from(res.data.split(',')[1], 'base64');
const outPath = path.join(DIR, outName);
await writeFile(outPath, buf);
const before = (await stat(src)).size;
console.log(
  `OK ${outName}  ${(before / 1024).toFixed(0)}KB -> ${(buf.length / 1024).toFixed(0)}KB  (${res.from} -> ${res.to})  q=${quality}`,
);

const { unlink } = await import('node:fs/promises');
await unlink(STAGE);

const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
