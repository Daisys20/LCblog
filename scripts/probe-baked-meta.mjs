/**
 * 扫描设计稿里「印在图上的那行地点/日期/天气」的像素范围，
 * 好让叠在上面的状态浮层能完整盖住它（避免两个日期同时出现）。
 * 用法：node scripts/probe-baked-meta.mjs
 */
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu'],
});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });

const res = await page.evaluate(async () => {
  const img = new Image();
  img.src = '/images/hero-banner.png';
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);

  // 只看右下角：那行地点/日期/天气是纯白字 + 深色描边，压在暗色山体上
  const x0 = Math.floor(c.width * 0.68);
  const y0 = Math.floor(c.height * 0.7);
  const colHits = new Array(c.width - x0).fill(0);
  const rowHits = new Array(c.height - y0).fill(0);
  let minX = 1e9;
  let maxX = -1;
  let minY = 1e9;
  let maxY = -1;
  for (let y = y0; y < c.height; y += 1) {
    for (let x = x0; x < c.width; x += 1) {
      const i = (y * c.width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      if (mn > 232 && mx - mn < 22) {
        colHits[x - x0] += 1;
        rowHits[y - y0] += 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return {
    size: [c.width, c.height],
    scan: { x0, y0 },
    bbox: { minX, maxX, minY, maxY },
    ratios: {
      left: minX / c.width,
      right: maxX / c.width,
      top: minY / c.height,
      bottom: maxY / c.height,
    },
    colHits,
    rowHits,
  };
});

console.log('图片尺寸', res.size, '扫描起点', res.scan);
console.log('纯白像素 bbox', res.bbox);
console.log('比例', JSON.stringify(res.ratios, null, 1));
const cols = res.colHits
  .map((n, i) => [i + res.scan.x0, n])
  .filter(([, n]) => n > 0)
  .map(([x]) => x);
console.log('命中列 x 范围', cols.length ? `${cols[0]} → ${cols[cols.length - 1]}` : '(无)');
const rows = res.rowHits
  .map((n, i) => [i + res.scan.y0, n])
  .filter(([, n]) => n > 1)
  .map(([y]) => y);
console.log('命中行 y 范围', rows.length ? `${rows[0]} → ${rows[rows.length - 1]}` : '(无)');
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
