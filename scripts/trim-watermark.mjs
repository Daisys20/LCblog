/**
 * 去掉文生图工具打在右下角的水印。
 *
 * 做法：裁掉底部一小条。水印紧贴右下角（约占高度 6%，离底边 2~4%），
 * 对风景/平铺静物这类构图来说，裁掉底边 10% 的视觉损失远小于残留水印。
 *
 * 用法：node scripts/trim-watermark.mjs [比例，默认 0.10]
 */
import { readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173';
const DIR = path.resolve('public/images');
const RATIO = Number(process.argv[2] ?? 0.1);

const files = (await readdir(DIR)).filter((f) => /\.jpe?g$/i.test(f));
if (!files.length) {
  console.log('没有 jpg 需要处理');
  process.exit(0);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-proxy-server', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30_000 });

console.log(`裁掉底部 ${(RATIO * 100).toFixed(0)}%，共 ${files.length} 张`);
let total = 0;
for (const file of files) {
  const before = (await stat(path.join(DIR, file))).size;
  const result = await page.evaluate(
    async (src, ratio) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const w = img.naturalWidth;
      const h = Math.round(img.naturalHeight * (1 - ratio));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, img.naturalHeight, 0, 0, w, h);
      return { data: canvas.toDataURL('image/jpeg', 0.85), dim: `${w}x${h}` };
    },
    `${BASE}/images/${file}`,
    RATIO,
  );
  const buffer = Buffer.from(result.data.split(',')[1], 'base64');
  await writeFile(path.join(DIR, file), buffer);
  total += buffer.length;
  console.log(
    `OK ${file.padEnd(20)} ${(before / 1024).toFixed(0)}KB -> ${(buffer.length / 1024).toFixed(0)}KB  ${result.dim}`,
  );
}

/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
console.log(`\nimages 目录总体积 ${(total / 1024 / 1024).toFixed(2)}MB`);
