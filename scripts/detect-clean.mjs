/**
 * 在带网格叠加的参考图上稳健地检测「列」。
 *
 * 与 detect-columns.mjs 的区别：
 *   - 卡片底判定用「近纯白」(R>250 && G>250 && B>250)，因此红色网格线(R高但G/B低)
 *     不会被误判成卡片；页面底 #f6f9fe (R=246) 也不算卡片。
 *   - 输出每列宽 + 相邻列宽比。
 *
 * 用法：node scripts/detect-clean.mjs <图片> [y0] [y1] [gapMinPct]
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [src, y0Arg, y1Arg, gapArg] = process.argv.slice(2);
const Y0 = Number(y0Arg ?? 230);
const Y1 = Number(y1Arg ?? 980);
const GAP = Number(gapArg ?? 6); // 低于此百分比认为是列间隙
const MIN_GAP_PX = 4;

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });

const res = await page.evaluate(
  async (url, y0, y1, gapPct, minGapPx) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const { width } = c;
    const rows = Math.max(1, y1 - y0);
    const data = ctx.getImageData(0, y0, width, rows).data;

    // 每列：近纯白像素占比 + 红色网格线像素占比
    const ratio = new Array(width).fill(0);
    const reds = new Array(width).fill(0);
    for (let y = 0; y < rows; y++) {
      const base = y * width * 4;
      for (let x = 0; x < width; x++) {
        const i = base + x * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 250 && g > 250 && b > 250) ratio[x]++;
        // 叠加的网格线是偏红：R 高、G/B 明显低
        if (r > 140 && r - g > 55 && r - b > 55) reds[x]++;
      }
    }
    for (let x = 0; x < width; x++) {
      ratio[x] = (ratio[x] / rows) * 100;
      reds[x] = (reds[x] / rows) * 100;
    }

    // 3px 平滑
    const sm = ratio.map((_, x) => {
      let s = 0,
        n = 0;
      for (let k = -1; k <= 1; k++) {
        const i = x + k;
        if (i >= 0 && i < width) {
          s += ratio[i];
          n++;
        }
      }
      return s / n;
    });

    // 低占比连续段 = 间隙（含左右页边距）；网格红线所在列不算间隙
    const gaps = [];
    let st = null;
    for (let x = 0; x < width; x++) {
      const low = sm[x] < gapPct && reds[x] < 12;
      if (low && st === null) st = x;
      if (!low && st !== null) {
        if (x - st >= minGapPx) gaps.push([st, x]);
        st = null;
      }
    }
    if (st !== null && width - st >= minGapPx) gaps.push([st, width]);

    const edges = [0, ...gaps.flat(), width];
    const cols = [];
    for (let i = 0; i < edges.length; i += 2) {
      const a = edges[i];
      const b = edges[i + 1] ?? width;
      if (b - a > 40) cols.push([a, b, b - a]);
    }
    return { width, height: c.height, gaps, cols };
  },
  pathToFileURL(resolve(src)).href,
  Y0,
  Y1,
  GAP,
  MIN_GAP_PX,
);

console.log(`图片 ${res.width}x${res.height}  采样 y=${Y0}..${Y1}  gap<${GAP}%`);
console.log('间隙:', res.gaps.map(([a, b]) => `${a}-${b}(${b - a})`).join('  '));
console.log('列:');
res.cols.forEach(([a, b, w], i) => console.log(`  列${i}: ${a}-${b}  宽 ${w}`));
for (let i = 1; i < res.cols.length; i++) {
  console.log(`  比 ${res.cols[i - 1][2]} : ${res.cols[i][2]} = ${(res.cols[i - 1][2] / res.cols[i][2]).toFixed(3)}`);
}
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
