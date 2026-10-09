/**
 * 验收新增的三个页面（生活 / 项目 / 日志）与改造后的顶部导航：
 *  - 各断点有没有横向溢出
 *  - 导航容器是否真的没底色、选中项是否有底色
 *  - 生活页标签能不能切换（URL 上的 ?tab= 也要跟着变）
 *
 * 用法：node scripts/probe-pages.mjs
 */
import puppeteer from 'puppeteer-core';

const BASE = 'http://127.0.0.1:5173';
const PAGES = ['/life', '/projects', '/journey'];
const VIEWS = [
  [1536, 900],
  [1240, 860],
  [900, 800],
  [390, 780],
];

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();

/* ---------- 1. 导航样式 + 横向溢出 ---------- */
console.log('— 导航 / 溢出 —');
for (const [w, h] of VIEWS) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 500));
    const r = await page.evaluate(() => {
      const nav = document.querySelector('.site-nav');
      const active = document.querySelector('.site-nav__link--active');
      const label = document.querySelector('.site-nav__label');
      const navBox = nav.getBoundingClientRect();
      const toolsBox = document.querySelector('.header-tools').getBoundingClientRect();
      // 导航和右侧工具区都挤在页头里，只有两块矩形真的相交才算压到一起
      // （≤860 时导航换到第二行，横向自然会有交叠，那是正常的）
      const clash =
        navBox.right > toolsBox.left + 1 &&
        navBox.left < toolsBox.right - 1 &&
        navBox.bottom > toolsBox.top + 1 &&
        navBox.top < toolsBox.bottom - 1;
      return {
        doc: document.documentElement.scrollWidth,
        cli: document.documentElement.clientWidth,
        navBg: getComputedStyle(nav).backgroundColor,
        activeBg: active ? getComputedStyle(active).backgroundColor : 'none',
        activeColor: active ? getComputedStyle(active).color : 'none',
        labels: label ? getComputedStyle(label).display : 'none',
        navWidth: Math.round(navBox.width),
        wrapped: Math.round(navBox.top) > Math.round(toolsBox.top),
        clash,
        items: document.querySelectorAll('.site-nav__link').length,
      };
    });
    const over = r.doc > r.cli ? `!! 溢出 ${r.doc - r.cli}px` : 'OK';
    console.log(
      `${path.padEnd(10)} ${String(w).padStart(5)}  doc/client=${r.doc}/${r.cli} ${over}  ` +
        `导航${r.items}项/${r.navWidth}px${r.wrapped ? '(换行)' : ''} 标签=${r.labels}  ` +
        `${r.clash ? '!! 压到工具区' : 'OK'}  容器底色=${r.navBg}  选中底色=${r.activeBg}`,
    );
  }
}

/* ---------- 2. 生活页标签切换 ---------- */
console.log('\n— 生活页标签切换 —');
await page.setViewport({ width: 1536, height: 900, deviceScaleFactor: 2 });
await page.goto(`${BASE}/life`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 900));

const tabs = await page.$$eval('.tabs__item', (els) => els.map((e) => e.textContent.trim()));
console.log('标签栏：', tabs.join(' | '));

for (const label of ['游戏', '物件', '生活展示']) {
  await page.evaluate((text) => {
    const btn = [...document.querySelectorAll('.tabs__item')].find((b) =>
      b.textContent.trim().startsWith(text),
    );
    btn.click();
  }, label);
  await new Promise((r) => setTimeout(r, 700));
  const info = await page.evaluate(() => ({
    url: location.search,
    cover: document.querySelector('.gallery-cover__title').textContent,
    en: document.querySelector('.gallery-cover__en').textContent,
    cards: document.querySelectorAll('.gallery-card').length,
    first: document.querySelector('.gallery-card__title').textContent,
    arts: document.querySelectorAll('.gallery-card__thumb .art-svg').length,
    imgs: document.querySelectorAll('.gallery-card__thumb img').length,
  }));
  console.log(
    `${label.padEnd(6)} url=${info.url.padEnd(12)} 封面=${info.cover}(${info.en})  ` +
      `卡片=${info.cards} 图=${info.imgs} 矢量图=${info.arts}  第一张=${info.first}`,
  );
}

/* ---------- 3. 截图 ---------- */
await page.goto(`${BASE}/life`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: '.preview/n-life-1536.png', fullPage: true });

for (const [label, name] of [
  ['游戏', 'game'],
  ['音乐', 'music'],
  ['电影', 'movie'],
  ['物件', 'gadget'],
]) {
  await page.evaluate((text) => {
    const btn = [...document.querySelectorAll('.tabs__item')].find((b) =>
      b.textContent.trim().startsWith(text),
    );
    btn.click();
  }, label);
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: `.preview/n-life-${name}-1536.png`, fullPage: true });
}

await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: '.preview/n-projects-1536.png', fullPage: true });

await page.goto(`${BASE}/journey`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: '.preview/n-journey-1536.png', fullPage: true });

await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: '.preview/n-home-1536.png', fullPage: true });

await page.setViewport({ width: 390, height: 780, deviceScaleFactor: 2 });
for (const [path, name] of [
  ['/life', 'life'],
  ['/projects', 'projects'],
  ['/journey', 'journey'],
]) {
  await page.goto(BASE + path, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: `.preview/n-${name}-390.png`, fullPage: true });
}

/* ---------- 4. 暗色主题：三个新页面各来一张 ---------- */
await page.setViewport({ width: 1536, height: 900, deviceScaleFactor: 2 });
for (const [path, name] of [
  ['/life', 'life'],
  ['/projects', 'projects'],
  ['/journey', 'journey'],
]) {
  await page.goto(BASE + path, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.setItem('blog-theme', 'dark'));
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: `.preview/n-dark-${name}-1536.png`, fullPage: true });
  const bg = await page.evaluate(() => ({
    active: getComputedStyle(document.querySelector('.site-nav__link--active')).backgroundColor,
    card: getComputedStyle(document.querySelector('.page-stats li') ?? document.body).backgroundColor,
  }));
  console.log(`暗色 ${path.padEnd(10)} 选中底色=${bg.active} 卡片底色=${bg.card}`);
}
await page.evaluate(() => localStorage.setItem('blog-theme', 'light'));

const cp = browser.process();
if (cp && !cp.killed) cp.kill('SIGKILL');
process.exit(0);
