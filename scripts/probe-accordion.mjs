/**
 * 验证「2026 年计划」手风琴行为 + 四列配平：
 *   1) 默认展开第一个分类
 *   2) 点另一个分类 → 只留新点开的那个展开
 *   3) 重复点已展开的分类 → 不能关闭
 *   4) 每次点击后：计划卡高度恒定、四列列底仍然齐平
 * 用法：node scripts/probe-accordion.mjs [视口宽] [高]
 */
import puppeteer from 'puppeteer-core';

const width = Number(process.argv[2] ?? 1536);
const height = Number(process.argv[3] ?? 2600);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width, height });
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise((r) => setTimeout(r, 1600));

const snap = () =>
  page.evaluate(() => {
    const head = (el) =>
      (el.querySelector('.card-head__title')?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const cats = Array.from(document.querySelectorAll('.plan__cat')).map((el) => ({
      name: el.querySelector('.plan__name')?.textContent?.trim(),
      open: el.classList.contains('is-open'),
      expanded: el.querySelector('.plan__row')?.getAttribute('aria-expanded'),
      tasks: el.querySelectorAll('.plan__task').length,
    }));
    const plan = document.querySelector('.bento-card--plan');
    const cols = Array.from(document.querySelectorAll('.bento > .bento__col')).map((c) => ({
      h: +c.getBoundingClientRect().height.toFixed(1),
      bottom: +(c.getBoundingClientRect().bottom + window.scrollY).toFixed(1),
      last: head(c.lastElementChild),
    }));
    return {
      cats,
      planH: +plan.getBoundingClientRect().height.toFixed(1),
      cols,
    };
  });

const click = async (i) => {
  await page.evaluate((i) => {
    const rows = document.querySelectorAll('.plan__cat .plan__row');
    rows[i].click();
  }, i);
  await new Promise((r) => setTimeout(r, 400));
};

const show = (tag, s) => {
  const open = s.cats.filter((c) => c.open).map((c) => c.name);
  const bottoms = s.cols.map((c) => c.bottom);
  const spread = +(Math.max(...bottoms) - Math.min(...bottoms)).toFixed(1);
  console.log(
    `${tag.padEnd(22)} 展开=[${open.join(',')}]  任务数=[${s.cats.map((c) => c.tasks).join(',')}]` +
      `  计划卡 h=${s.planH}  列底=[${bottoms.join(' / ')}]  落差=${spread}`,
  );
  return spread;
};

console.log(`视口 ${width}`);
let s = await snap();
show('初始', s);

let worst = 0;
for (let i = 0; i < s.cats.length; i += 1) {
  await click(i);
  const after = await snap();
  const sp = show(`点第${i + 1}个(${after.cats[i].name})`, after);
  worst = Math.max(worst, sp);
}

// 重复点当前已展开的分类：应当保持展开
const cur = (await snap()).cats.findIndex((c) => c.open);
await click(cur);
s = await snap();
worst = Math.max(worst, show(`重复点第${cur + 1}个(不关)`, s));

console.log(`\n四列最大落差 = ${worst} px${worst <= 0.5 ? '  ✅ 齐平' : '  ⚠️ 未齐平'}`);
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
