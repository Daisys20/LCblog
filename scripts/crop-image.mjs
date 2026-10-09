/**
 * 参考图局部放大工具（开发自用）：
 *   node scripts/crop-image.mjs <图片路径> <输出路径> <x> <y> <w> <h> [缩放]
 * 用浏览器 canvas 裁切并放大，便于核对参考图细节。
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [src, out, x, y, w, h, scaleArg = '2'] = process.argv.slice(2);
const scale = Number(scaleArg);
const outPath = resolve(out);
await mkdir(dirname(outPath), { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.setViewport({
  width: Math.round(Number(w) * scale),
  height: Math.round(Number(h) * scale),
});
// 先导航到 file:// 源，否则 canvas 无法读取本地图片（跨源 taint）
await page.goto(pathToFileURL(resolve(src)).href, { waitUntil: 'load' });

const dataUrl = await page.evaluate(
  async (url, sx, sy, sw, sh, k) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = Math.round(sw * k);
    c.height = Math.round(sh * k);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  },
  pathToFileURL(resolve(src)).href,
  Number(x),
  Number(y),
  Number(w),
  Number(h),
  Number(scale),
);

const { writeFile } = await import('node:fs/promises');
await writeFile(outPath, Buffer.from(dataUrl.split(',')[1], 'base64'));
console.log(`saved: ${outPath}`);
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
