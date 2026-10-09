/**
 * 多断点「是否溢出」自检。
 *
 *   node scripts/probe-fit.mjs
 *
 * 做的事：
 *  1) 逐断点加载首页，比较 documentElement.scrollWidth 与 clientWidth → 抓到横向溢出；
 *  2) 顺带把卡片几何打出来，方便看某个卡片是否被内容撑破；
 *  3) 专项检查：横幅浮层（.banner__mask）是否越出横幅卡片
 *     —— aspect-ratio + min-height 曾经把它顶到 800px 宽、撑出所属网格列。
 *
 * 注意：脚本末尾用 SIGKILL + process.exit(0) 收尾，
 * 因为 Windows 上 browser.close() 会挂死（见 skill vite-windows-dev-pitfalls）。
 * 运行时不要接 `| tail`，管道要等 EOF 才吐内容，进程一挂输出就全丢。
 */
import puppeteer from 'puppeteer-core';

const WIDTHS = [1536, 1400, 1240, 1100, 950, 901, 900, 760, 390];

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();

for (const w of WIDTHS) {
  await page.setViewport({ width: w, height: 1400 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));

  const r = await page.evaluate(() => {
    const prev = document.documentElement.style.overflowX;
    document.documentElement.style.overflowX = 'visible';
    const docW = document.documentElement.scrollWidth;
    document.documentElement.style.overflowX = prev;

    const card = document.querySelector('.bento-card--banner');
    const mask = document.querySelector('.banner__mask');
    const cr = card?.getBoundingClientRect();
    const mr = mask?.getBoundingClientRect();
    const inside =
      !!cr && !!mr && mr.top >= cr.top - 0.6 && mr.bottom <= cr.bottom + 0.6 && mr.right <= cr.right + 0.6 && mr.left >= cr.left - 0.6;

    return {
      docW,
      cliW: document.documentElement.clientWidth,
      card: cr ? [+cr.width.toFixed(1), +cr.height.toFixed(1)] : null,
      mask: mr ? [+mr.width.toFixed(1), +mr.height.toFixed(1)] : null,
      inside,
    };
  });

  console.log(
    String(w).padStart(5),
    'doc/client', `${r.docW}/${r.cliW}`,
    r.docW > r.cliW ? '!! 横向溢出' : 'OK',
    r.card ? `横幅 ${r.card.join('x')}` : '',
    r.mask ? `蒙版 ${r.mask.join('x')} ${r.inside ? '在卡内' : '!! 越出卡片'}` : '',
  );
}

/* Chrome 有时不响应 close()，直接 SIGKILL，避免脚本被外层超时杀掉导致输出丢失 */
const cp = browser.process();
if (cp && !cp.killed) cp.kill('SIGKILL');
process.exit(0);
