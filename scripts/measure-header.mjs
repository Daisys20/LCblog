/**
 * 顶部导航布局量测（开发自用）：
 *   node scripts/measure-header.mjs [宽]
 * 输出 header 内各元素的位置尺寸，用于和参考图逐项对齐。
 */
import puppeteer from 'puppeteer-core';

const width = Number(process.argv[2] ?? 1536);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width, height: 900 });
const problems = [];
page.on('console', (m) => m.type() === 'error' && problems.push(m.text()));
page.on('pageerror', (e) => problems.push(e.message));
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30_000 });
await new Promise((r) => setTimeout(r, 1500));

const info = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      right: Math.round(r.right),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  };
  return {
    headerH: Math.round(document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0),
    inner: pick('.site-header__inner'),
    logo: pick('.site-logo'),
    nav: pick('.site-nav'),
    active: pick('.site-nav__link--active'),
    tools: pick('.header-tools'),
    search: pick('.header-search'),
    main: pick('.site-main'),
  };
});

console.log(`视口宽 ${width}`);
for (const [k, v] of Object.entries(info)) {
  if (!v) continue;
  if (typeof v === 'number') console.log(`${k.padEnd(9)} = ${v}`);
  else console.log(`${k.padEnd(9)} x=${String(v.x).padStart(5)}  right=${String(v.right).padStart(5)}  w=${String(v.w).padStart(4)}  h=${v.h}`);
}
console.log('problems:', problems.length ? problems : 'none');

/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
