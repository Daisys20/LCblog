/**
 * 检测参考图中「列间隙」的位置，用于反推各列宽度比例。
 *
 * 原理：原图底色恒定（如 rgb(246,249,254)），卡片底色更白（约 rgb(252,253,255)）。
 * 在 R 通道上按阈值区分二者，逐列统计「卡片底」像素占比：
 *   - 间隙列：整列都是背景色 → 占比 ≈ 0
 *   - 卡片列：还有卡片白底区域   → 占比明显更高
 * 找出占比极低且足够宽的连续区间，即为列间隙。
 *
 * 用法：node scripts/detect-columns.mjs <图片> [y0] [y1] [卡片R阈值]
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [src, y0Arg, y1Arg, thrArg] = process.argv.slice(2);
const Y0 = Number(y0Arg ?? 230);
const Y1 = Number(y1Arg ?? 980);
const THR = Number(thrArg ?? 249);
const MIN_GAP = 5;

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });

const res = await page.evaluate(
  async (url, y0, y1, thr, minGap) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const { width } = c;
    const rows = y1 - y0;
    const data = ctx.getImageData(0, y0, width, rows).data;

    // 逐列统计 R 通道 > thr 的比例（即「卡片底」占比）
    const ratio = new Array(width).fill(0);
    for (let y = 0; y < rows; y++) {
      const base = y * width * 4;
      for (let x = 0; x < width; x++) {
        if (data[base + x * 4] > thr) ratio[x]++;
      }
    }
    for (let x = 0; x < width; x++) ratio[x] = (ratio[x] / rows) * 100;

    // 平滑（3px 滑窗），压制 JPEG 噪声
    const smooth = ratio.map((_, x) => {
      let s = 0;
      let n = 0;
      for (let k = -1; k <= 1; k++) {
        const i = x + k;
        if (i >= 0 && i < width) {
          s += ratio[i];
          n++;
        }
      }
      return s / n;
    });

    // 找低谷段（占比 < 6%）
    const LOW = 6;
    const gaps = [];
    let start = null;
    for (let x = 0; x < width; x++) {
      const low = smooth[x] < LOW;
      if (low && start === null) start = x;
      if (!low && start !== null) {
        if (x - start >= minGap) gaps.push([start, x]);
        start = null;
      }
    }
    if (start !== null && width - start >= minGap) gaps.push([start, width]);

    return { width, height: c.height, gaps };
  },
  pathToFileURL(resolve(src)).href,
  Y0,
  Y1,
  THR,
  MIN_GAP,
);

console.log(`图片尺寸: ${res.width} x ${res.height}   采样行: y=${Y0}..${Y1}   阈值 R>${THR}`);
console.log(`列间隙（x0-x1，宽）:`);
res.gaps.forEach(([a, b]) => console.log(`  ${a} - ${b}  (宽 ${b - a})`));

// 由间隙反推列区间
const edges = [0, ...res.gaps.flat(), res.width];
const cols = [];
for (let i = 0; i < edges.length; i += 2) {
  const [a, b] = [edges[i], edges[i + 1] ?? res.width];
  if (b - a > 40) cols.push([a, b, b - a]);
}
console.log(`\n推断出的列（含最左最右页边距）:`);
cols.forEach(([a, b, w], i) => console.log(`  列${i}: ${a} - ${b}   宽 ${w}`));
if (cols.length >= 2) {
  console.log(`\n相邻列宽比:`);
  for (let i = 1; i < cols.length; i++) {
    console.log(
      `  ${cols[i - 1][2]} : ${cols[i][2]} = ${(cols[i - 1][2] / cols[i][2]).toFixed(3)}`,
    );
  }
}

/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
