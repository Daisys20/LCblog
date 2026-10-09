/**
 * 量测新版四列布局：每列宽度、列高、列底，以及列内每张卡片的位置。
 * 用法：node scripts/dump-cols.mjs [视口宽] [高] [主题light|dark]
 */
import puppeteer from 'puppeteer-core';

const width = Number(process.argv[2] ?? 1536);
const height = Number(process.argv[3] ?? 2600);
const theme = process.argv[4] ?? 'light';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
if (theme === 'dark') {
  await page.evaluateOnNewDocument(() => localStorage.setItem('blog-theme', 'dark'));
}
await page.setViewport({ width, height });
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise((r) => setTimeout(r, 1600));

const res = await page.evaluate(() => {
  const label = (el) =>
    (el.querySelector('.card-head__title, .keep__title')?.textContent ?? el.className)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 18);

  const top = document.querySelector('.bento-top');
  const topCards = Array.from(top.querySelectorAll(':scope > .bento-card')).map((el) => {
    const r = el.getBoundingClientRect();
    return { t: label(el), x: +r.x.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
  });

  const cols = Array.from(document.querySelectorAll('.bento > .bento__col')).map((col, i) => {
    const cr = col.getBoundingClientRect();
    const cards = Array.from(col.children).map((el) => {
      const r = el.getBoundingClientRect();
      return { t: label(el), h: +r.height.toFixed(1), bottom: +(r.bottom + window.scrollY).toFixed(1) };
    });
    return {
      col: i + 1,
      w: +cr.width.toFixed(1),
      h: +cr.height.toFixed(1),
      bottom: +(cr.bottom + window.scrollY).toFixed(1),
      cards,
    };
  });

  const main = document.querySelector('.site-main');
  const foot = document.querySelector('.site-footer');
  return {
    docH: document.documentElement.scrollHeight,
    mainBottom: main ? +(main.getBoundingClientRect().bottom + window.scrollY).toFixed(1) : null,
    footTop: foot ? +(foot.getBoundingClientRect().top + window.scrollY).toFixed(1) : null,
    topCards,
    cols,
  };
});

console.log(`视口 ${width}  文档高 ${res.docH}  main底 ${res.mainBottom}  footer顶 ${res.footTop}`);
console.log('\n[顶行]');
for (const c of res.topCards) console.log(`   x=${String(c.x).padStart(7)} w=${String(c.w).padStart(6)} h=${String(c.h).padStart(7)}  ${c.t}`);
for (const c of res.cols) {
  console.log(`\n[列${c.col}] 宽 ${c.w}  高 ${c.h}  列底 ${c.bottom}`);
  for (const k of c.cards) console.log(`   h=${String(k.h).padStart(7)}  bottom=${String(k.bottom).padStart(7)}  ${k.t}`);
}
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
