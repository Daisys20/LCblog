/**
 * 参考图网格叠加（开发自用）：
 *   node scripts/grid-overlay.mjs <图片路径> <输出路径> [x起始] [y起始] [x宽] [y高] [缩放]
 * 在图上叠加每 50px 一条的坐标网格（每 100px 加粗标注），便于直接读出元素位置。
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [src, out, x0 = '0', y0 = '0', w, h, scaleArg = '1'] = process.argv.slice(2);
const scale = Number(scaleArg);
const S = { x: Number(x0), y: Number(y0), w: Number(w), h: Number(h) };
const outPath = resolve(out);
await mkdir(dirname(outPath), { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.setViewport({
  width: Math.round(S.w * scale),
  height: Math.round(S.h * scale),
});
await page.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });

const dataUrl = await page.evaluate(
  async (url, s, k) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = Math.round(s.w * k);
    c.height = Math.round(s.h * k);
    const ctx = c.getContext('2d');
    ctx.drawImage(img, s.x, s.y, s.w, s.h, 0, 0, c.width, c.height);

    const gx0 = Math.ceil(s.x / 50) * 50;
    const gy0 = Math.ceil(s.y / 50) * 50;
    ctx.font = `700 ${Math.round(11 * k)}px monospace`;
    ctx.textBaseline = 'top';
    for (let gx = gx0; gx <= s.x + s.w; gx += 50) {
      const px = (gx - s.x) * k;
      const major = gx % 100 === 0;
      ctx.fillStyle = major ? 'rgba(220,20,60,0.9)' : 'rgba(220,20,60,0.35)';
      ctx.fillRect(px, 0, major ? 1.5 : 1, c.height);
      if (major) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(px + 1, 0, 30 * k, 13 * k);
        ctx.fillStyle = 'rgba(190,10,40,0.95)';
        ctx.fillText(String(gx), px + 2 * k, 1 * k);
      }
    }
    for (let gy = gy0; gy <= s.y + s.h; gy += 50) {
      const py = (gy - s.y) * k;
      const major = gy % 100 === 0;
      ctx.fillStyle = major ? 'rgba(220,20,60,0.9)' : 'rgba(220,20,60,0.35)';
      ctx.fillRect(0, py, c.width, major ? 1.5 : 1);
      if (major) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(0, py + 1, 42 * k, 13 * k);
        ctx.fillStyle = 'rgba(190,10,40,0.95)';
        ctx.fillText(String(gy), 2 * k, py + 1.5 * k);
      }
    }
    return c.toDataURL('image/png');
  },
  pathToFileURL(resolve(src)).href,
  S,
  scale,
);

await writeFile(outPath, Buffer.from(dataUrl.split(',')[1], 'base64'));
console.log(`saved: ${outPath}`);
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
