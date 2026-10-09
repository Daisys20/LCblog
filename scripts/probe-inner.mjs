/**
 * 量测某张卡片内部各子块的高度，用于「哪块可以伸长/压缩」的判断。
 * 用法：node scripts/probe-inner.mjs [视口宽] [高] [选择器]
 * 例：node scripts/probe-inner.mjs 1536 2600 ".bento-card--music"
 *     node scripts/probe-inner.mjs 1536 2600 ".bento-card--plan"
 */
import puppeteer from 'puppeteer-core';

const width = Number(process.argv[2] ?? 1536);
const height = Number(process.argv[3] ?? 2600);
const sel = process.argv[4] ?? '.bento-card--music';

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
  const card = document.querySelector(sel);
  if (!card) return { err: 'not found: ' + sel };
  const cs = getComputedStyle(card);
  const r = card.getBoundingClientRect();
  const kids = Array.from(card.children).map((el) => {
    const k = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      cls: el.className,
      h: +k.height.toFixed(1),
      mt: +parseFloat(getComputedStyle(el).marginTop || 0).toFixed(1),
      mb: +parseFloat(getComputedStyle(el).marginBottom || 0).toFixed(1),
    };
  });
  return {
    card: { w: +r.width.toFixed(1), h: +r.height.toFixed(1), pad: cs.padding, display: cs.display },
    kids,
  };
}, sel);

console.log(`视口 ${width}  ${sel}`);
if (res.err) console.log(res.err);
else {
  console.log(`卡片 ${res.card.w} x ${res.card.h}  padding=${res.card.pad}  display=${res.card.display}`);
  for (const k of res.kids) {
    console.log(`   h=${String(k.h).padStart(7)}  mt=${String(k.mt).padStart(5)} mb=${String(k.mb).padStart(5)}  ${k.tag}.${k.cls}`);
  }
}
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
