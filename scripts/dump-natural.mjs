/**
 * 量测首页每张卡片的「自然高度」——注入一段 CSS 把所有用于底部对齐的
 * flex 吸收层关掉，这样得到的是内容本身的真实高度，便于预估新排版的列高。
 * 用法：node scripts/dump-natural.mjs [视口宽] [高]
 */
import puppeteer from 'puppeteer-core';

const width = Number(process.argv[2] ?? 1536);
const height = Number(process.argv[3] ?? 2400);

const KILL = `
  /* 只让「吸收层」停止长高，卡片本身仍然撑满列宽 */
  .bento-flex { flex: 0 1 auto !important; }
  .bento-flex > .bento-card > .skill-grid { flex: 0 0 auto !important; align-content: start !important; }
`;

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width, height });
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
await page.addStyleTag({ content: KILL });
await new Promise((r) => setTimeout(r, 900));

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
  return { cards: out };
});

console.log(`视口 ${width}  自然高度`);
for (const c of res.cards) {
  console.log(`  w=${String(c.w).padStart(6)}  h=${String(c.h).padStart(7)}   ${c.t}`);
}
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
