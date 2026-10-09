/**
 * 检测参考图中「某一列内部各卡片的纵向边界」，用于还原卡片的垂直比例。
 *
 * 原理同 detect-columns：底色恒定、卡片底更白。在指定 x 区间内逐行统计
 * 「卡片底」像素占比：
 *   - 卡片实心行：占比高
 *   - 卡片间隙行：整行都是背景色 → 占比 ≈ 0
 *
 * 用法：node scripts/detect-rows.mjs <图片> <x0> <x1> [y0] [y1] [阈值R] [间隙占比上限%]
 *   例：node scripts/detect-rows.mjs ref.jpg 30 283 60 1015 249 25
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [src, x0Arg, x1Arg, y0Arg, y1Arg, thrArg, lowArg] = process.argv.slice(2);
const X0 = Number(x0Arg);
const X1 = Number(x1Arg);
const Y0 = Number(y0Arg ?? 60);
const Y1 = Number(y1Arg ?? 1020);
const THR = Number(thrArg ?? 249);
const LOW = Number(lowArg ?? 25);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });

const res = await page.evaluate(
  async (url, x0, x1, y0, y1, thr, low) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const w = x1 - x0;
    const rows = y1 - y0;
    const d = ctx.getImageData(x0, y0, w, rows).data;

    // 逐行统计该列内「卡片底」的横向上占比
    const ratio = new Array(rows).fill(0);
    for (let y = 0; y < rows; y++) {
      const base = y * w * 4;
      let n = 0;
      for (let x = 0; x < w; x++) if (d[base + x * 4] > thr) n++;
      ratio[y] = (n / w) * 100;
    }

    // 3 行滑窗平滑
    const smooth = ratio.map((_, y) => {
      let s = 0;
      let n = 0;
      for (let k = -1; k <= 1; k++) {
        const i = y + k;
        if (i >= 0 && i < rows) {
          s += ratio[i];
          n++;
        }
      }
      return s / n;
    });

    // 找「实心段」= 卡片
    const MIN_CARD = 24; // 低于此高度的段视为噪声
    const cards = [];
    let start = null;
    for (let y = 0; y < rows; y++) {
      const solid = smooth[y] > low;
      if (solid && start === null) start = y;
      if (!solid && start !== null) {
        if (y - start >= MIN_CARD) cards.push([start + y0, y + y0]);
        start = null;
      }
    }
    if (start !== null && rows - start >= MIN_CARD) cards.push([start + y0, rows + y0]);

    return { cards, width: c.width, height: c.height };
  },
  pathToFileURL(resolve(src)).href,
  X0,
  X1,
  Y0,
  Y1,
  THR,
  LOW,
);

console.log(`图片 ${res.width}x${res.height}   列 x=${X0}..${X1}（宽 ${X1 - X0}）`);
console.log(`该列内的卡片纵向区间:`);
res.cards.forEach(([a, b], i) => {
  console.log(`  #${i + 1}  y ${String(a).padStart(4)} - ${String(b).padStart(4)}   高 ${b - a}`);
});
if (res.cards.length > 1) {
  console.log(`\n相邻卡片间隙高度:`);
  for (let i = 1; i < res.cards.length; i++) {
    console.log(`  #${i}→#${i + 1}: ${res.cards[i][0] - res.cards[i - 1][1]}`);
  }
}

/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
