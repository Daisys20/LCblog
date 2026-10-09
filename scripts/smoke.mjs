/**
 * 冒烟检查：确认 dev server 能被浏览器正常打开、8 条路由都能渲染出内容。
 * 用法：node scripts/smoke.mjs
 */
import puppeteer from 'puppeteer-core';

const BASE = 'http://127.0.0.1:5173';
const ROUTES = ['/', '/blog', '/life', '/projects', '/journey', '/archive', '/tags', '/about'];

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1536, height: 900, deviceScaleFactor: 1 });

for (const route of ROUTES) {
  const errors = [];
  const onError = (e) => errors.push(String(e));
  page.on('pageerror', onError);

  const resp = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 700));

  const info = await page.evaluate(() => {
    const root = document.querySelector('#root');
    const main = document.querySelector('.site-main') ?? root;
    const text = (main?.innerText ?? '').replace(/\s+/g, ' ').trim();
    return {
      rootChildren: root ? root.children.length : -1,
      textLen: text.length,
      preview: text.slice(0, 60),
      title: document.title,
    };
  });

  page.off('pageerror', onError);
  const ok = resp?.status() === 200 && info.rootChildren > 0 && info.textLen > 20;
  console.log(
    `${ok ? 'OK  ' : '!!  '} ${route.padEnd(10)} http=${resp?.status()} rootKids=${info.rootChildren} 文本=${info.textLen}  ${JSON.stringify(info.preview)}`,
  );
  if (errors.length) console.log(`     页面报错: ${errors.join(' | ')}`);
}

await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: '.preview/up-home-1536.png', fullPage: false });
console.log('截图: .preview/up-home-1536.png');

const cp = browser.process();
if (cp && !cp.killed) cp.kill('SIGKILL');
process.exit(0);
