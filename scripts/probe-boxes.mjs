/**
 * 量测一组元素的几何（宽高、top/bottom），用来核对缩略图是否等高对齐。
 * 用法：node scripts/probe-boxes.mjs [视口宽] [高] [选择器]
 * 例：node scripts/probe-boxes.mjs 1536 2600 ".life__thumb"
 */
import puppeteer from 'puppeteer-core';

const width = Number(process.argv[2] ?? 1536);
const height = Number(process.argv[3] ?? 2600);
const sel = process.argv[4] ?? '.life__thumb';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width, height });
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise((r) => setTimeout(r, 1600));

const res = await page.evaluate((sel) => {
  const els = Array.from(document.querySelectorAll(sel));
  return els.map((el, i) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      i: i + 1,
      x: +r.x.toFixed(1),
      y: +(r.y + window.scrollY).toFixed(1),
      w: +r.width.toFixed(1),
      h: +r.height.toFixed(1),
      ratio: +(r.width / r.height).toFixed(3),
      ar: cs.aspectRatio,
      mt: cs.marginTop,
      cls: el.className,
    };
  });
}, sel);

console.log(`视口 ${width}  ${sel}  共 ${res.length} 个`);
for (const r of res) {
  console.log(
    `   #${r.i} x=${String(r.x).padStart(7)} y=${String(r.y).padStart(7)}  ${String(r.w).padStart(7)} x ${String(r.h).padStart(7)}  ratio=${r.ratio}  aspect=${r.ar}  mt=${r.mt}  ${r.cls}`,
  );
}
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
