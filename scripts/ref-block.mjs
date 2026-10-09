/**
 * 找出图片里"大块照片"（非白、非页面底、非红网格线）的边界框。
 * 用法: node scripts/ref-block.mjs <图片> [y0] [y1] [最短run]
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [src, y0Arg, y1Arg, minRunArg] = process.argv.slice(2);
const Y0 = Number(y0Arg ?? 0);
const Y1 = Number(y1Arg ?? 300);
const MINRUN = Number(minRunArg ?? 180);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });
const res = await page.evaluate(
  async (url, y0, y1, minRun) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const rows = Math.min(y1, H) - y0;
    const data = ctx.getImageData(0, y0, W, rows).data;
    const isContent = (i) => {
      const R = data[i],
        G = data[i + 1],
        B = data[i + 2];
      // 红网格线也算内容，否则每 72px 会打断长 run
      if (R > 250 && G > 250 && B > 250) return false; // 白卡片
      const mx = Math.max(R, G, B),
        mn = Math.min(R, G, B);
      if (R > 238 && G > 240 && B > 248 && mx - mn < 14) return false; // 页面底 #f6f9fe
      return true;
    };
    const lines = [];
    let bx0 = 1e9,
      bx1 = -1,
      by0 = 1e9,
      by1 = -1;
    for (let y = 0; y < rows; y++) {
      const base = y * W * 4;
      let best = 0,
        bst = 0,
        cur = 0,
        cst = 0;
      for (let x = 0; x < W; x++) {
        if (isContent(base + x * 4)) {
          if (cur === 0) cst = x;
          cur++;
          if (cur > best) {
            best = cur;
            bst = cst;
          }
        } else cur = 0;
      }
      if (best >= minRun) {
        lines.push([y + y0, bst, bst + best, best]);
        const len = best;
        if (len > W * 0.3) {
          if (bst < bx0) bx0 = bst;
          if (bst + best > bx1) bx1 = bst + best;
          if (y + y0 < by0) by0 = y + y0;
          if (y + y0 > by1) by1 = y + y0;
        }
      }
    }
    return { W, H, lines, bbox: bx1 >= 0 ? [bx0, by0, bx1, by1] : null };
  },
  pathToFileURL(resolve(src)).href,
  Y0,
  Y1,
  MINRUN,
);

console.log(`图 ${res.W}x${res.H}  y=${Y0}..${Y1}  最短run=${MINRUN}`);
if (res.bbox) {
  const [a, b, cc, d] = res.bbox;
  console.log(`大块照片 bbox: x ${a}..${cc} (宽 ${cc - a}), y ${b}..${d} (高 ${d - b})  宽高比 ${((cc - a) / (d - b)).toFixed(3)}`);
}
console.log('逐行长 run（y: x起-x止 长度）:');
res.lines.forEach(([y, a, b, l]) => console.log(`  y=${String(y).padStart(4)}  ${a}..${b}  ${l}`));
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
