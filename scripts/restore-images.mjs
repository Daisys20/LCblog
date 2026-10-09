/**
 * 修复 optimize-images.mjs 造成的问题：那次 drawImage 的源矩形写成了整图高度，
 * 结果图片被纵向压扁 10% 而不是裁切。
 *
 * 本脚本做两件事：
 *   1. 把内容按原始比例还原（拉伸回原高度空间，几何恢复正常）
 *   2. 只取顶部 keep 比例，把右下角的水印真正裁掉
 *
 * 用法：node scripts/restore-images.mjs [keep，默认 0.89]
 */
import { readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173';
const DIR = path.resolve('public/images');
/** 上一次处理把高度压到了原图的 90% */
const SQUASH = 0.9;
const KEEP = Number(process.argv[2] ?? 0.89);

const files = (await readdir(DIR)).filter((f) => /\.jpe?g$/i.test(f));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-proxy-server', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30_000 });

console.log(`还原比例并保留顶部 ${(KEEP * 100).toFixed(0)}%，共 ${files.length} 张`);
let total = 0;
for (const file of files) {
  const before = (await stat(path.join(DIR, file))).size;
  const result = await page.evaluate(
    async (src, squash, keep) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const w = img.naturalWidth;
      const squashedH = img.naturalHeight;
      // 还原到未压缩前的坐标空间，再只保留顶部 keep 比例
      const space = squashedH / squash;
      const outH = Math.round(space * keep);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      // 目标高度用 space（大于画布），底部自然被裁掉
      ctx.drawImage(img, 0, 0, w, squashedH, 0, 0, w, space);
      return { data: canvas.toDataURL('image/jpeg', 0.85), dim: `${w}x${outH}` };
    },
    `${BASE}/images/${file}`,
    SQUASH,
    KEEP,
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
