/**
 * 参考图 / 成品并排对照图（开发自用）：
 *   node scripts/compare.mjs <参考图> <成品图> <输出图>
 * 顶部按原比例把两张图缩到同宽并排，附标题。
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const [refSrc, gotSrc, outSrc] = process.argv.slice(2);
const outPath = resolve(outSrc);
await mkdir(dirname(outPath), { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.setViewport({ width: 2200, height: 800 });
// 先导航到 file:// 源，否则 canvas 读本地图会被判跨源污染，toDataURL 直接抛错
await page.goto(pathToFileURL(resolve(refSrc)).href, { waitUntil: 'load' });

const dataUrl = await page.evaluate(
  async (a, b) => {
    const load = async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      return img;
    };
    const [ref, got] = await Promise.all([load(a), load(b)]);

    const PANEL = 980; // 每侧图片显示宽度
    const GAP = 40;
    const PAD = 40;
    const HEAD = 56;
    const scaleRef = PANEL / ref.naturalWidth;
    const scaleGot = PANEL / got.naturalWidth;
    const panelH = Math.max(ref.naturalHeight * scaleRef, got.naturalHeight * scaleGot);
    const W = PAD * 2 + PANEL * 2 + GAP;
    const H = PAD * 2 + HEAD + panelH;

    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#f5f6fa';
    ctx.fillRect(0, 0, W, H);

    const draw = (img, scale, x, label) => {
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const y = PAD + HEAD;
      ctx.save();
      ctx.shadowColor = 'rgba(20,30,60,0.16)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
      ctx.restore();
      ctx.drawImage(img, x, y, w, h);
      ctx.fillStyle = '#111827';
      ctx.font = '700 30px "Microsoft YaHei", sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(label, x, PAD + 34);
    };

    draw(ref, scaleRef, PAD, '参考图');
    draw(got, scaleGot, PAD + PANEL + GAP, '成品（blog-web 首页）');
    return c.toDataURL('image/png');
  },
  pathToFileURL(resolve(refSrc)).href,
  pathToFileURL(resolve(gotSrc)).href,
);

await writeFile(outPath, Buffer.from(dataUrl.split(',')[1], 'base64'));
console.log(`saved: ${outPath}`);
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
