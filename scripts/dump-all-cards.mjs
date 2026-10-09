/**
 * 列出首页所有 .bento-card 的标题与高度（不依赖列结构），用于预估新排版下各列总高。
 * 用法：node scripts/dump-all-cards.mjs [视口宽] [高] [路径]
 */
import puppeteer from 'puppeteer-core';

const width = Number(process.argv[2] ?? 1536);
const height = Number(process.argv[3] ?? 2000);
const path = process.argv[4] ?? '/';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width, height });
await page.goto(`http://127.0.0.1:5173${path}`, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise((r) => setTimeout(r, 1600));

const res = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('.bento-card').forEach((el) => {
    const r = el.getBoundingClientRect();
    const t = (
      el.querySelector('.card-head__title, .banner__title, .keep__title, .music__title')?.textContent || el.className
    )
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 20);
    out.push({ t, w: +r.width.toFixed(1), h: +r.height.toFixed(1) });
  });
  return { docH: document.documentElement.scrollHeight, cards: out };
});

console.log(`视口 ${width}  文档高 ${res.docH}`);
let sum = 0;
for (const c of res.cards) {
  sum += c.h;
  console.log(`  w=${String(c.w).padStart(6)}  h=${String(c.h).padStart(7)}   ${c.t}`);
}
console.log(`卡片总高 ${sum.toFixed(1)}，张数 ${res.cards.length}`);
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
