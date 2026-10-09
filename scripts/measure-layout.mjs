/**
 * 布局量测工具（开发自用）：
 *   node scripts/measure-layout.mjs [宽] [高]
 * 输出文档高度 + 所有 .bento-card 的位置尺寸，用于校对 Bento 排布。
 * 判定标准：各列 y+h 相等 = 底部对齐。
 */
import puppeteer from 'puppeteer-core';

const width = Number(process.argv[2] ?? 1440);
const height = Number(process.argv[3] ?? 1000);
const url = process.env.URL ?? 'http://127.0.0.1:5173/';
const chromePath =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width, height });
const problems = [];
page.on('console', (m) => m.type() === 'error' && problems.push(`CONSOLE ${m.text()}`));
page.on('pageerror', (e) => problems.push(`PAGEERROR ${e.message}`));
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 });
await new Promise((r) => setTimeout(r, 1800));

const info = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.bento-card')).map((el) => {
    const r = el.getBoundingClientRect();
    const t = el.querySelector('.card-head__title, .pill__label, .banner__name, .os-head__name');
    return {
      name: (t?.textContent || '').trim().slice(0, 16),
      x: Math.round(r.x),
      y: Math.round(r.y + window.scrollY),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  });
  return { docH: document.documentElement.scrollHeight, count: cards.length, cards };
});

console.log(JSON.stringify(info, null, 1));
console.log(problems.length ? `problems:\n${problems.join('\n')}` : 'problems: none');
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
