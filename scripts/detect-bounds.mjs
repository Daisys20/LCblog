/**
 * 参考图内容边界检测（开发自用）：
 *   node scripts/detect-bounds.mjs <图片路径>
 * 输出：
 *   - 每条采样行的最左/最右非白 x（推断内容区左右边界与页面留白）
 *   - banner 顶边 y（推断 header 高度）
 *   - 关键行上"白色间隙"的位置（列间隙）
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [src] = process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
const fileUrl = pathToFileURL(resolve(src)).href;
await page.goto(fileUrl, { waitUntil: 'load' });

const res = await page.evaluate(async (url) => {
  const img = new Image();
  img.src = url;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const W = c.width;
  const H = c.height;
  const all = ctx.getImageData(0, 0, W, H).data;
  const ink = (x, y) => {
    const i = (y * W + x) * 4;
    return Math.min(all[i], all[i + 1], all[i + 2]) < 244;
  };

  // 1) 每条采样行的最左/最右非白像素
  const rows = [];
  for (const y of [40, 100, 140, 200, 300, 500, 700, 900, 990]) {
    let left = -1;
    let right = -1;
    for (let x = 0; x < W; x++) if (ink(x, y)) { left = x; break; }
    for (let x = W - 1; x >= 0; x--) if (ink(x, y)) { right = x; break; }
    rows.push({ y, left, right });
  }

  // 2) 竖直扫 x=W/2 找 banner 顶边（第一段连续非白）
  let bannerTop = -1;
  for (let y = 0; y < H; y++) {
    if (ink(Math.round(W / 2), y)) { bannerTop = y; break; }
  }

  // 3) 顶部区域（header 内）非白内容范围，用于看导航条位置
  const headRows = [];
  for (const y of [10, 20, 30, 40, 50]) {
    let left = -1;
    let right = -1;
    for (let x = 0; x < W; x++) if (ink(x, y)) { left = x; break; }
    for (let x = W - 1; x >= 0; x--) if (ink(x, y)) { right = x; break; }
    headRows.push({ y, left, right });
  }

  return { W, H, rows, headRows, bannerTop };
}, fileUrl);

console.log(`图片尺寸: ${res.W} x ${res.H}`);
console.log('\n--- 每条采样行的内容左右边界 ---');
for (const r of res.rows) {
  console.log(`y=${String(r.y).padStart(4)}  left=${String(r.left).padStart(5)}  right=${String(r.right).padStart(5)}  (右边距 ${res.W - 1 - r.right})`);
}
console.log('\n--- header 区各行内容左右边界 ---');
for (const r of res.headRows) {
  console.log(`y=${String(r.y).padStart(4)}  left=${String(r.left).padStart(5)}  right=${String(r.right).padStart(5)}`);
}
console.log(`\nbanner 顶边 y = ${res.bannerTop}`);

/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
