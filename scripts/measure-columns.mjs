/**
 * 量测渲染后的四列宽度，并与参考图的列宽逐列对比。
 *
 * 页面结构：
 *   .bento
 *     .bento__left   → .bento__split > .bento__col  (列1、列2)
 *     .bento__right  → .bento__col                  (列3、列4)
 *
 * 用法：node scripts/measure-columns.mjs [视口宽] [参考列宽,逗号分隔]
 *   例：node scripts/measure-columns.mjs 1536 253,413,429,354
 */
import puppeteer from 'puppeteer-core';

const width = Number(process.argv[2] ?? 1536);
const refCols = (process.argv[3] ?? '253,413,429,354').split(',').map(Number);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width, height: 1000 });
const problems = [];
page.on('console', (m) => m.type() === 'error' && problems.push(`CONSOLE ${m.text()}`));
page.on('pageerror', (e) => problems.push(`PAGEERROR ${e.message}`));
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30_000 });
await new Promise((r) => setTimeout(r, 1600));

const got = await page.evaluate(() => {
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return { x: +r.x.toFixed(1), w: +r.width.toFixed(1) };
  };
  const split = Array.from(document.querySelectorAll('.bento__split > .bento__col'));
  const right = Array.from(document.querySelectorAll('.bento__right > .bento__col'));
  const main = document.querySelector('.site-main');
  const bento = document.querySelector('.bento');
  const gaps = [];
  const gapOf = (sel) => {
    const s = getComputedStyle(document.querySelector(sel));
    return s.columnGap || s.gap;
  };
  gaps.push(['.bento', gapOf('.bento')]);
  gaps.push(['.bento__split', gapOf('.bento__split')]);
  gaps.push(['.bento__right', gapOf('.bento__right')]);
  return {
    contentLeft: main ? +main.getBoundingClientRect().x.toFixed(1) : null,
    contentWidth: bento ? +bento.getBoundingClientRect().width.toFixed(1) : null,
    contentRight: bento
      ? +(bento.getBoundingClientRect().x + bento.getBoundingClientRect().width).toFixed(1)
      : null,
    cols: [...split, ...right].map(rect),
    gaps,
  };
});

console.log(`视口宽 ${width}`);
console.log(
  `内容区: 左 ${got.contentLeft}  宽 ${got.contentWidth}  右 ${got.contentRight}`,
);
console.log(`列间距: ${got.gaps.map(([k, v]) => `${k}=${v}`).join('  ')}`);
console.log('');
console.log('列   x       宽      参考宽   偏差');
got.cols.forEach((c, i) => {
  const ref = refCols[i];
  const diff = ref ? c.w - ref : NaN;
  console.log(
    `${i + 1}    ${String(c.x).padStart(6)}  ${String(c.w).padStart(6)}  ${String(ref ?? '-').padStart(6)}   ${Number.isNaN(diff) ? '-' : (diff >= 0 ? '+' : '') + diff.toFixed(1)}`,
  );
});
console.log('');
console.log('相邻列宽比（实测）:');
for (let i = 1; i < got.cols.length; i++) {
  console.log(`  列${i} : 列${i + 1} = ${(got.cols[i - 1].w / got.cols[i].w).toFixed(3)}`);
}
console.log('相邻列宽比（参考）:');
for (let i = 1; i < refCols.length; i++) {
  console.log(`  列${i} : 列${i + 1} = ${(refCols[i - 1] / refCols[i]).toFixed(3)}`);
}
console.log('');
console.log('problems:', problems.length ? problems : 'none');
/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
