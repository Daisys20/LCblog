/**
 * 渲染校验：检查页面关键文本的实际内容、尺寸与溢出情况。
 *   node scripts/check-text.mjs
 * 这里的 selector 列表针对首页 Bento 文案节点，按需增删。
 */
import puppeteer from 'puppeteer-core';

const TARGETS = [
  ['.banner__name', 'heroName'],
  ['.os-head__name', 'osName'],
  ['.quote__author', 'quoteAuthor'],
  ['.site-logo__title', 'siteTitle'],
  ['.banner__role', 'heroRole'],
];

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1536, height: 900 });
const problems = [];
page.on('console', (m) => m.type() === 'error' && problems.push(`CONSOLE ${m.text()}`));
page.on('pageerror', (e) => problems.push(`PAGEERROR ${e.message}`));
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30_000 });
await new Promise((r) => setTimeout(r, 1500));

const info = await page.evaluate((targets) => {
  const out = {};
  for (const [sel, key] of targets) {
    const el = document.querySelector(sel);
    if (!el) {
      out[key] = null;
      continue;
    }
    const r = el.getBoundingClientRect();
    out[key] = {
      text: el.textContent.trim(),
      w: Math.round(r.width),
      h: Math.round(r.height),
      clipped: el.scrollWidth > Math.ceil(r.width) + 1,
    };
  }
  return out;
}, TARGETS);

console.log(JSON.stringify(info, null, 1));
console.log('problems:', problems.length ? problems : 'none');
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
