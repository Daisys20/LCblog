/**
 * 导出首页每个 .bento-card 的几何（列、x/y/w/h），用于和参考图逐卡比对。
 * 用法：node scripts/dump-cards.mjs [视口宽] [高]
 */
import puppeteer from 'puppeteer-core';

const width = Number(process.argv[2] ?? 1536);
const height = Number(process.argv[3] ?? 1600);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width, height });
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise((r) => setTimeout(r, 1600));

const res = await page.evaluate(() => {
  const cols = [
    ['C1', document.querySelector('.bento__split')],
    ['C2', document.querySelector('.bento__split')],
  ];
  const colSel = [
    ['C1', '.bento__split > .bento__col:nth-child(1)'],
    ['C2', '.bento__split > .bento__col:nth-child(2)'],
    ['C3', '.bento__right > .bento__col:nth-child(1)'],
    ['C4', '.bento__right > .bento__col:nth-child(2)'],
  ];
  const out = [];
  for (const [name, sel] of colSel) {
    const col = document.querySelector(sel);
    const cr = col.getBoundingClientRect();
    const cards = Array.from(col.querySelectorAll(':scope > .bento-card, :scope > .bento-flex > .bento-card'));
    out.push({
      col: name,
      colW: +cr.width.toFixed(1),
      colH: +cr.height.toFixed(1),
      colBottom: +(cr.y + cr.height - window.scrollY).toFixed(1),
      cards: cards.map((el) => {
        const r = el.getBoundingClientRect();
        const t = (el.querySelector('.card-head__title, .banner__title, .keep__title, .music__title')?.textContent || el.className).trim().slice(0, 16);
        return { t, y: +r.y.toFixed(1), h: +r.height.toFixed(1), bottom: +(r.y + r.height).toFixed(1) };
      }),
    });
  }
  const main = document.querySelector('.site-main');
  const foot = document.querySelector('.site-footer');
  return {
    docH: document.documentElement.scrollHeight,
    mainBottom: main ? +main.getBoundingClientRect().bottom.toFixed(1) : null,
    footTop: foot ? +foot.getBoundingClientRect().top.toFixed(1) : null,
    cols: out,
  };
});

console.log(`视口 ${width}  文档高 ${res.docH}  main底 ${res.mainBottom}  footer顶 ${res.footTop}`);
for (const c of res.cols) {
  console.log(`\n[${c.col}] 列宽 ${c.colW}  列高 ${c.colH}  列底 ${c.colBottom}`);
  for (const k of c.cards) {
    console.log(`   y=${String(k.y).padStart(7)}  h=${String(k.h).padStart(7)}  bottom=${String(k.bottom).padStart(7)}  ${k.t}`);
  }
}
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
