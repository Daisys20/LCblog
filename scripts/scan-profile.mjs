/**
 * 参考图非白像素纵向占比剖面（开发自用）：
 *   node scripts/scan-profile.mjs <图片路径> <x0> <x1> [y0] [y1]
 * 逐 x 统计该列在 [y0,y1) 区间内「非白像素」的比例（%）。
 * 卡片列因为含文字/图片占比高，列间隙只剩页面底纹，占比明显更低。
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [src, x0Arg, x1Arg, y0Arg = '225', y1Arg = '985'] = process.argv.slice(2);
const x0 = Number(x0Arg);
const x1 = Number(x1Arg);
const y0 = Number(y0Arg);
const y1 = Number(y1Arg);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });

const res = await page.evaluate(
  async (url, ax0, ax1, ay0, ay1) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const rows = ay1 - ay0;
    const w = ax1 - ax0;
    const d = ctx.getImageData(ax0, ay0, w, rows).data;
    const out = [];
    for (let x = 0; x < w; x += 1) {
      let n = 0;
      for (let y = 0; y < rows; y += 1) {
        const i = (y * w + x) * 4;
        if (Math.min(d[i], d[i + 1], d[i + 2]) < 246) n += 1;
      }
      out.push(Math.round((n / rows) * 100));
    }
    return out;
  },
  pathToFileURL(resolve(src)).href,
  x0,
  x1,
  y0,
  y1,
);

console.log(`x ${x0}..${x1}  y ${y0}..${y1}  (每像素非白占比%)`);
for (let i = 0; i < res.length; i += 40) {
  const label = String(x0 + i).padStart(5);
  const line = res
    .slice(i, i + 40)
    .map((v) => String(v).padStart(3))
    .join('');
  console.log(label + ' |' + line);
}

/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
