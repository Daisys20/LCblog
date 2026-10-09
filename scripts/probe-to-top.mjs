/**
 * 校验「回到顶部」悬浮按钮
 *  1) 全站只有一个入口：.to-top 恰好 1 个，.keep__btn / .site-footer__top 都为 0
 *  2) 位置：固定在窗口右下角（滚动后与视口四边的距离恒定）
 *  3) 时机：页面顶部隐藏，滚动后浮出
 *  4) 功能：点击后回到 scrollY = 0
 *  5) 顺带核对第一行横幅英文用的是 --font-en
 *
 * 用法：node scripts/probe-to-top.mjs [宽] [高]
 */
import puppeteer from 'puppeteer-core';

const W = Number(process.argv[2] ?? 1536);
const H = Number(process.argv[3] ?? 900);

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H });
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1200));

const probe = () =>
  page.evaluate(() => {
    const btn = document.querySelector('.to-top');
    if (!btn) return { missing: true };
    const r = btn.getBoundingClientRect();
    const s = getComputedStyle(btn);
    return {
      scrollY: Math.round(window.scrollY),
      count: document.querySelectorAll('.to-top').length,
      legacy: {
        keepBtn: document.querySelectorAll('.keep__btn').length,
        footerTop: document.querySelectorAll('.site-footer__top').length,
      },
      pos: s.position,
      z: s.zIndex,
      visibility: s.visibility,
      opacity: Number(s.opacity).toFixed(2),
      // 与视口右 / 下边的距离
      right: +(window.innerWidth - r.right).toFixed(1),
      bottom: +(window.innerHeight - r.bottom).toFixed(1),
      size: [+r.width.toFixed(1), +r.height.toFixed(1)],
      label: btn.getAttribute('aria-label'),
    };
  });

// —— 1. 顶部：应隐藏
const atTop = await probe();
console.log(`视口 ${W}×${H}`);
console.log(`  顶部     scrollY=${atTop.scrollY}  visibility=${atTop.visibility} opacity=${atTop.opacity}`);

// —— 2. 滚动后：应浮出，且贴住右下角
await page.evaluate(() => window.scrollTo({ top: 1400, behavior: 'instant' }));
await new Promise((r) => setTimeout(r, 500));
const scrolled = await probe();
console.log(
  `  滚动后   scrollY=${scrolled.scrollY}  visibility=${scrolled.visibility} opacity=${scrolled.opacity}` +
    `  position=${scrolled.pos} z=${scrolled.z}  距右=${scrolled.right}px 距下=${scrolled.bottom}px 尺寸=${scrolled.size.join('×')}`,
);

// —— 3. 再滚一段：位置必须不变（fixed 的特征）
await page.evaluate(() => window.scrollTo({ top: 2600, behavior: 'instant' }));
await new Promise((r) => setTimeout(r, 400));
const further = await probe();
console.log(`  再滚动   scrollY=${further.scrollY}  距右=${further.right}px 距下=${further.bottom}px`);

// —— 4. 点击回顶
await page.click('.to-top');
await new Promise((r) => setTimeout(r, 1800));
const afterClick = await probe();
console.log(
  `  点击后   scrollY=${afterClick.scrollY}  visibility=${afterClick.visibility}` +
    `  ${afterClick.scrollY === 0 ? '✓ 已回到顶部' : '✗ 未回到顶部'}`,
);

console.log(
  `  唯一性   .to-top=${scrolled.count}  .keep__btn=${scrolled.legacy.keepBtn}  .site-footer__top=${scrolled.legacy.footerTop}` +
    `  ${scrolled.count === 1 && !scrolled.legacy.keepBtn && !scrolled.legacy.footerTop ? '✓ 已合并为一个' : '✗ 仍有重复入口'}`,
);

// —— 5. 第一行横幅英文的字体
const fonts = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return `${sel} 不存在`;
    const s = getComputedStyle(el);
    return `${s.fontFamily.split(',')[0].replace(/"/g, '')} / ${s.fontStyle} / ${s.fontWeight}`;
  };
  return { name: pick('.banner__name'), role: pick('.banner__role'), desc: pick('.banner__desc') };
});
console.log(`  横幅英文 .banner__name = ${fonts.name}`);
console.log(`  横幅英文 .banner__role = ${fonts.role}`);
console.log(`  横幅中文 .banner__desc = ${fonts.desc}`);

// —— 6. 截一张滚动后的右下角
await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({
  path: '.preview/to-top-corner.png',
  clip: { x: W - 220, y: H - 190, width: 220, height: 190 },
});
console.log('  已存截图 .preview/to-top-corner.png');

const cp = browser.process();
if (cp && !cp.killed) cp.kill('SIGKILL');
process.exit(0);
