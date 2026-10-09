/**
 * 把设计稿某个区域放大导出成 PNG，方便肉眼看清楚图上烤死的文字位置。
 * 用法：node scripts/crop-image.mjs <图片路径> <x> <y> <w> <h> <放大倍数> <输出路径>
 * 例：node scripts/crop-image.mjs /images/hero-banner.png 600 110 268 52 4 .preview/hero-corner.png
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import puppeteer from 'puppeteer-core';

const [src, x, y, w, h, scale, outPath] = process.argv.slice(2);
const out = resolve(outPath ?? '.preview/crop.png');
await mkdir(dirname(out), { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu'],
});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });

const dataUrl = await page.evaluate(
  async ({ src, x, y, w, h, scale }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = Math.round(w * scale);
    c.height = Math.round(h * scale);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, x, y, w, h, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  },
  { src, x: +x, y: +y, w: +w, h: +h, scale: +scale },
);

const { writeFile } = await import('node:fs/promises');
await writeFile(out, Buffer.from(dataUrl.split(',')[1], 'base64'));
console.log(`saved: ${out}`);
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
