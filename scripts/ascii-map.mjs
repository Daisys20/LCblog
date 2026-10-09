/**
 * 把图片渲染成 ASCII 图，便于在纯文本环境里"看"版面结构。
 * 用法: node scripts/ascii-map.mjs <图片> [列数] [起始y%] [结束y%]
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [src, colsArg, y0pArg, y1pArg] = process.argv.slice(2);
const COLS = Number(colsArg ?? 108);
const Y0P = Number(y0pArg ?? 0);
const Y1P = Number(y1pArg ?? 100);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });
const res = await page.evaluate(
  async (url, cols, y0p, y1p) => {
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
    const y0 = Math.floor((y0p / 100) * H);
    const y1 = Math.floor((y1p / 100) * H);
    const rows = y1 - y0;
    const data = ctx.getImageData(0, y0, W, rows).data;

    const cell = W / cols;
    const outRows = Math.max(1, Math.round(rows / cell / 2.1));
    const outH = rows / outRows;

    const lines = [];
    for (let r = 0; r < outRows; r++) {
      let line = '';
      for (let cIdx = 0; cIdx < cols; cIdx++) {
        const x0 = Math.floor(cIdx * cell);
        const x1 = Math.max(x0 + 1, Math.floor((cIdx + 1) * cell));
        const yy0 = Math.floor(r * outH);
        const yy1 = Math.max(yy0 + 1, Math.floor((r + 1) * outH));
        let nWhite = 0,
          nBg = 0,
          nDark = 0,
          nCol = 0,
          nRed = 0,
          n = 0;
        for (let y = yy0; y < yy1; y++) {
          const base = y * W * 4;
          for (let x = x0; x < x1; x++) {
            const i = base + x * 4;
            const R = data[i],
              G = data[i + 1],
              B = data[i + 2];
            n++;
            const mx = Math.max(R, G, B),
              mn = Math.min(R, G, B);
            if (R > 140 && R - G > 55 && R - B > 55) nRed++;
            else if (R > 245 && G > 245 && B > 245) nWhite++;
            else if (R > 238 && G > 240 && B > 248 && mx - mn < 14) nBg++;
            else if (mx < 150) nDark++;
            else if (mx - mn > 26) nCol++;
          }
        }
        const p = (v) => v / n;
        if (p(nRed) > 0.25) line += 'r';
        else if (p(nDark) > 0.4) line += '#';
        else if (p(nCol) > 0.4) line += '+';
        else if (p(nWhite) > 0.55) line += ' ';
        else if (p(nBg) > 0.5) line += '.';
        else line += 'o';
      }
      lines.push(line);
    }
    return { W, H, y0, y1, cell, lines };
  },
  pathToFileURL(resolve(src)).href,
  COLS,
  Y0P,
  Y1P,
);

console.log(`图 ${res.W}x${res.H}  区域 y=${res.y0}..${res.y1}  单元格≈${res.cell.toFixed(1)}px`);
console.log('  空格=白卡片  .=页面底  #=深色照片  +=彩色照片  o=其他  r=红网格线');
res.lines.forEach((l, i) => console.log(String(i).padStart(3) + '|' + l));
const px = (i) => Math.round(i * res.cell);
console.log('x刻度: ' + [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * COLS) + '≈' + px(f * COLS)).join('  '));
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
