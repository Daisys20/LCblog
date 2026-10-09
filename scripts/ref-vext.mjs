/**
 * 在指定 x 位置纵向扫描，输出「卡片(近纯白)」的 y 连续段。
 * 用法: node scripts/ref-vext.mjs <图片> x1,x2,... [y0] [y1]
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [src, xsArg, y0Arg, y1Arg] = process.argv.slice(2);
const XS = xsArg.split(',').map(Number);
const Y0 = Number(y0Arg ?? 0);
const Y1 = Number(y1Arg ?? 400);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });
const res = await page.evaluate(
  async (url, xs, y0, y1) => {
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
    const out = {};
    for (const x of xs) {
      // 取 x-2..x+2 的多数类
      const runs = [];
      let cur = null,
        st = 0;
      for (let y = 0; y < rows; y++) {
        let white = 0,
          other = 0;
        for (let dx = -2; dx <= 2; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= W) continue;
          const i = (y * W + xx) * 4;
          const R = data[i],
            G = data[i + 1],
            B = data[i + 2];
          if (R > 250 && G > 250 && B > 250) white++;
          else other++;
        }
        const cls = white >= other ? 'W' : 'o';
        if (cls !== cur) {
          if (cur !== null) runs.push([cur, st + y0, y - 1 + y0]);
          cur = cls;
          st = y;
        }
      }
      if (cur !== null) runs.push([cur, st + y0, rows - 1 + y0]);
      out[x] = runs.filter(([k, a, b]) => b - a >= 3 && k === 'W');
    }
    return { W, H, out };
  },
  pathToFileURL(resolve(src)).href,
  XS,
  Y0,
  Y1,
);

console.log(`图 ${res.W}x${res.H}  y=${Y0}..${Y1}`);
for (const x of XS) {
  const runs = res.out[x] || [];
  console.log(`x=${x}: 白色(卡片)纵向段 → ` + runs.map(([, a, b]) => `${a}..${b}(${b - a + 1})`).join('  '));
}
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
