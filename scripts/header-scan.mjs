/**
 * 参考图 header 区横向结构扫描（开发自用）：
 *   node scripts/header-scan.mjs <图片路径> [y0] [y1]
 * 对 header 区域逐行输出「非白像素段」（runs），用于定位 logo / 导航胶囊 / 搜索框 / 图标的位置与宽度。
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [src, y0Arg = '0', y1Arg = '72'] = process.argv.slice(2);
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
  async (url, ay0, ay1) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const W = c.width;
    const out = [];
    for (let y = ay0; y < ay1; y++) {
      const d = ctx.getImageData(0, y, W, 1).data;
      // 阈值 251：可捕捉浅灰胶囊底（约 #f6f6f7）
      const ink = (x) => {
        const i = x * 4;
        return Math.min(d[i], d[i + 1], d[i + 2]) < 251;
      };
      const runs = [];
      let s = null;
      for (let x = 0; x < W; x++) {
        if (ink(x) && s === null) s = x;
        if (!ink(x) && s !== null) {
          if (x - s >= 3) runs.push([s, x - 1]);
          s = null;
        }
      }
      if (s !== null) runs.push([s, W - 1]);
      out.push({ y, runs });
    }
    return { W, out };
  },
  pathToFileURL(resolve(src)).href,
  y0,
  y1,
);

console.log(`图片宽 ${res.W}，header 行 y ${y0}..${y1}`);
for (const r of res.out) {
  const seg = r.runs.map(([a, b]) => `${a}~${b}(w${b - a + 1})`).join('  ');
  console.log(`y=${String(r.y).padStart(3)} | ${seg}`);
}

/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
