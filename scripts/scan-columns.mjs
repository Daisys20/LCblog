/**
 * 参考图列边界检测（开发自用）：
 *   node scripts/scan-columns.mjs <图片路径> [yFrom] [yTo]
 * 统计每一列在给定纵向区间内「接近纯白（卡片底）」的占比，
 * 卡片所在列占比高，列间隙（页面底色）占比低，据此定位列边界。
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [src, yFrom = '140', yTo = '1000'] = process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });

const prof = await page.evaluate(
  async (url, y0, y1) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const { width } = c;
    const data = ctx.getImageData(0, y0, width, y1 - y0).data;
    const rows = y1 - y0;
    const hits = new Array(width).fill(0);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4;
        // 卡片底为纯白 / 极浅；页面底色偏冷灰，亮度略低
        if (data[i] > 249 && data[i + 1] > 249 && data[i + 2] > 249) hits[x] += 1;
      }
    }
    // 按 3px 分桶降噪
    const bucket = [];
    for (let x = 0; x < width; x += 3) {
      let s = 0;
      for (let k = 0; k < 3 && x + k < width; k += 1) s += hits[x + k];
      bucket.push(Math.round((s / 3 / rows) * 100));
    }
    return { y0, y1, width, rows, bucket };
  },
  pathToFileURL(resolve(src)).href,
  Number(yFrom),
  Number(yTo),
);

// 把占比 > 55% 视为卡片列，输出连续区间
const spans = [];
let start = null;
prof.bucket.forEach((v, i) => {
  if (v > 55 && start === null) start = i * 3;
  if (v <= 55 && start !== null) {
    spans.push([start, i * 3]);
    start = null;
  }
});
if (start !== null) spans.push([start, prof.width]);
console.log(`y ${prof.y0}-${prof.y1}  (${prof.width}px wide)`);
console.log('card spans (x0-x1, width):');
for (const [a, b] of spans) {
  if (b - a >= 6) console.log(`  ${a} - ${b}   w=${b - a}`);
}
console.log('\nprofile(每3px一个数, 0-100):');
console.log(prof.bucket.join(' '));

/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
