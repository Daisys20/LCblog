/**
 * 取图片某几行/列的平均颜色，用来给「按比例居中留边」的图卡配一块同色底，
 * 让留边和图片边缘无缝衔接。
 * 用法：node scripts/probe-edge-color.mjs <图片URL> <行位置列表(0-1,逗号分隔)>
 */
import puppeteer from 'puppeteer-core';

const src = process.argv[2] ?? 'http://127.0.0.1:5173/images/keep-going-card.png';
const rows = (process.argv[3] ?? '0,0.05,0.95,0.99').split(',').map(Number);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu'],
});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });

const out = await page.evaluate(
  async ({ src, rows }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const hex = (r, g, b) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
    return rows.map((ratio) => {
      const y = Math.min(c.height - 1, Math.round(ratio * (c.height - 1)));
      const d = ctx.getImageData(0, y, c.width, 1).data;
      let r = 0;
      let g = 0;
      let b = 0;
      for (let i = 0; i < d.length; i += 4) {
        r += d[i];
        g += d[i + 1];
        b += d[i + 2];
      }
      const n = d.length / 4;
      return { ratio, y, color: hex(r / n, g / n, b / n) };
    });
  },
  { src, rows },
);

console.log(src, `(${rows.join(', ')})`);
for (const r of out) console.log(`  y=${String(r.y).padStart(4)}  ratio=${r.ratio}  ${r.color}`);
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
