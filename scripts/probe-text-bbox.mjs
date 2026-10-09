/**
 * 扫描图片指定区域里的「深色文字」像素，输出文字块 bbox 与每一行的行带，
 * 用来把 HTML 浮层文字对齐到设计稿原来的位置/行距。
 * 用法：node scripts/probe-text-bbox.mjs <图片url> <x0> <y0> <x1> <y1> [阈值]
 * 例：node scripts/probe-text-bbox.mjs http://127.0.0.1:5173/images/keep-going-card.png 0 180 240 310 160
 */
import puppeteer from 'puppeteer-core';

const [src, x0, y0, x1, y1, thr = '150', minPixels = '3'] = process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu'],
});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });

const res = await page.evaluate(
  async ({ src, x0, y0, x1, y1, thr, minP }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const W = x1 - x0;
    const H = y1 - y0;
    const d = ctx.getImageData(x0, y0, W, H).data;
    const rows = [];
    let minX = 1e9;
    let maxX = -1;
    for (let y = 0; y < H; y += 1) {
      let n = 0;
      let rowMinX = 1e9;
      let rowMaxX = -1;
      for (let x = 0; x < W; x += 1) {
        const i = (y * W + x) * 4;
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        if (lum < thr) {
          n += 1;
          if (x < rowMinX) rowMinX = x;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (x > rowMaxX) rowMaxX = x;
        }
      }
      rows.push({ y: y0 + y, n: n >= minP ? n : 0, rowMinX: rowMinX === 1e9 ? null : rowMinX + x0, rowMaxX: rowMaxX < 0 ? null : rowMaxX + x0 });
    }
    // 把连续的非空行合成「行带」
    const bands = [];
    let cur = null;
    for (const r of rows) {
      if (r.n > 0) {
        if (!cur) cur = { y0: r.y, y1: r.y, minX: r.rowMinX ?? 1e9, maxX: 0 };
        cur.y1 = r.y;
        if (r.rowMaxX != null && r.rowMaxX > cur.maxX) cur.maxX = r.rowMaxX;
        if (r.rowMinX != null && r.rowMinX < cur.minX) cur.minX = r.rowMinX;
      } else if (cur) {
        bands.push(cur);
        cur = null;
      }
    }
    if (cur) bands.push(cur);
    return {
      size: [img.naturalWidth, img.naturalHeight],
      scan: { x0, y0, x1, y1, thr: +thr, minP: +minP },
      bbox: { minX, maxX },
      bands: bands.filter((b) => b.y1 - b.y0 >= 2),
    };
  },
  { src, x0: +x0, y0: +y0, x1: +x1, y1: +y1, thr: +thr, minP: +minPixels },
);

console.log(`图片 ${res.size[0]} x ${res.size[1]}   扫描区 ${JSON.stringify(res.scan)}`);
console.log(`文字左边界 x=${res.bbox.minX} (${((res.bbox.minX / res.size[0]) * 100).toFixed(2)}%)  右边界 x=${res.bbox.maxX} (${((res.bbox.maxX / res.size[0]) * 100).toFixed(2)}%)`);
console.log(`行带（共 ${res.bands.length}）:`);
res.bands.forEach((b, i) => {
  const prev = res.bands[i - 1];
  const gap = prev ? b.y0 - prev.y1 : null;
  console.log(
    `   #${i + 1} y=${b.y0}..${b.y1}  左 x=${b.minX} 右 x=${b.maxX} 宽=${(b.maxX - b.minX) / res.size[0] * 100 | 0}% 空隙=${gap ?? '-'}  行距=%${((b.y0 / res.size[1]) * 100).toFixed(1)}`,
  );
});
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
