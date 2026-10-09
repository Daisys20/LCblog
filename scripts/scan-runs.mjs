/**
 * 参考图行内「卡片白底」区间检测（开发自用）：
 *   node scripts/scan-runs.mjs <图片路径> <y1> [y2] ...
 * 沿指定 y 行扫描，输出连续为「纯白且中性」的 x 区间，即卡片底（列间隙为带色页面底）。
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [src, ...ys] = process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });

const rows = await page.evaluate(
  async (url, list) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const { width } = c;

    const out = [];
    for (const y of list) {
      const d = ctx.getImageData(0, y, width, 1).data;
      const isCard = (x) => {
        const i = x * 4;
        const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
        const mx = Math.max(r, g, b);
        const mn = Math.min(r, g, b);
        return mn >= 251 && mx - mn <= 3;
      };
      const runs = [];
      let s = null;
      for (let x = 0; x < width; x += 1) {
        if (isCard(x) && s === null) s = x;
        if (!isCard(x) && s !== null) {
          if (x - s >= 20) runs.push([s, x]);
          s = null;
        }
      }
      if (s !== null && width - s >= 20) runs.push([s, width]);
      out.push({ y, runs });
    }
    return out;
  },
  pathToFileURL(resolve(src)).href,
  ys.map(Number),
);

for (const r of rows) {
  console.log(
    `y=${r.y}: ` + r.runs.map(([a, b]) => `${a}-${b}(w${b - a})`).join('  '),
  );
}

/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
