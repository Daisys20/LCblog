/**
 * 校验悬浮「回到顶部」按钮：
 *  - 各断点下是否都贴在右下角
 *  - 展开后会不会盖住页脚链接
 *  - 有没有横向溢出
 * 截图 clip 用的是「文档坐标」，所以 y 要加上 scrollY。
 *
 * 用法：node scripts/probe-to-top-views.mjs
 */
import puppeteer from 'puppeteer-core';

const VIEWS = [
  [1536, 900],
  [1100, 800],
  [760, 900],
  [390, 780],
];

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();

for (const [w, h] of VIEWS) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1100));
  // 滚到底，按钮一定处于显示态，同时能看出与页脚的关系
  await page.evaluate(() => window.scrollTo({ top: 999999, behavior: 'instant' }));
  await new Promise((r) => setTimeout(r, 600));

  const r = await page.evaluate(() => {
    const btn = document.querySelector('.to-top');
    const b = btn.getBoundingClientRect();
    const links = [...document.querySelectorAll('.site-footer__links a')].map((a) =>
      a.getBoundingClientRect(),
    );
    const hit = links.filter(
      (l) =>
        !(l.right < b.left - 2 || l.left > b.right + 2 || l.bottom < b.top - 2 || l.top > b.bottom + 2),
    ).length;
    return {
      docW: document.documentElement.scrollWidth,
      cliW: document.documentElement.clientWidth,
      scrollY: Math.round(window.scrollY),
      size: [Math.round(b.width), Math.round(b.height)],
      right: Math.round(window.innerWidth - b.right),
      bottom: Math.round(window.innerHeight - b.bottom),
      visibility: getComputedStyle(btn).visibility,
      hit,
      footerRight: Math.round(
        window.innerWidth - document.querySelector('.site-footer__inner').getBoundingClientRect().right,
      ),
    };
  });

  const overflow = r.docW > r.cliW ? '!! 横向溢出' : 'OK';
  console.log(
    `${String(w).padStart(5)}×${h}  doc/client=${r.docW}/${r.cliW} ${overflow}  ` +
      `scrollY=${r.scrollY}  按钮=${r.size.join('×')} 距右${r.right}/距下${r.bottom} ${r.visibility}  ` +
      `与页脚链接重叠=${r.hit}  页脚右内边距=${r.footerRight}`,
  );

  const cw = Math.min(360, w - 4);
  const ch = Math.min(260, h - 4);
  await page.screenshot({
    path: `.preview/v25-corner-${w}.png`,
    clip: { x: w - cw, y: r.scrollY + h - ch, width: cw, height: ch },
  });
}

const cp = browser.process();
if (cp && !cp.killed) cp.kill('SIGKILL');
process.exit(0);
