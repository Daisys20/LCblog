/**
 * 页面截图工具（开发自用）：
 *   node scripts/screenshot.mjs [url] [输出路径] [宽] [高]
 * 依赖 puppeteer-core（不随项目安装）：npm i -D puppeteer-core
 * 使用本机已安装的 Chrome，无需下载 Chromium。
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';

import puppeteer from 'puppeteer-core';

const CHROME_PATH =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const url = process.argv[2] ?? 'http://127.0.0.1:5173/';
const out = resolve(process.argv[3] ?? '.preview/shot.png');
const width = Number(process.argv[4] ?? 1280);
const height = Number(process.argv[5] ?? 1400);

await mkdir(dirname(out), { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});

const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: Number(process.env.DSCALE ?? 1) });

const problems = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    problems.push(`CONSOLE ${msg.text()}`);
  }
});
page.on('pageerror', (err) => problems.push(`PAGEERROR ${err.message}`));
page.on('requestfailed', (req) => {
  // 开发态 StrictMode 会故意中断第一次请求，这类噪音忽略
  if (req.failure()?.errorText === 'net::ERR_ABORTED') {
    return;
  }
  problems.push(`REQFAIL ${req.url()} ${req.failure()?.errorText ?? ''}`);
});

// THEME=dark 时以暗色主题截图
if (process.env.THEME === 'dark') {
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('blog-theme', 'dark');
  });
}

await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 });
await new Promise((r) => setTimeout(r, 1500));

// HOVER="x,y" 可把指针移到指定位置，用来验证磁性吸附 / 指针高光
if (process.env.HOVER) {
  const [hx, hy] = process.env.HOVER.split(',').map(Number);
  // 先移到别处再移过去，模拟真实的移入过程
  await page.mouse.move(hx - 260, hy - 180);
  await new Promise((r) => setTimeout(r, 120));
  await page.mouse.move(hx, hy, { steps: 12 });
  await new Promise((r) => setTimeout(r, 700));
  const probe = await page.evaluate(
    ({ px, py }) => {
      const read = (el) => ({
        title:
          (el?.querySelector('.card-head__title, .banner__name')?.textContent ?? '').trim().slice(0, 14) ||
          el?.className.split(' ').filter((c) => c !== 'bento-card' && c !== 'is-near').join('.') ||
          '(无标题)',
        transform: el?.style.transform || '(none)',
        glow: el?.style.getPropertyValue('--glow') || '0',
        mx: el?.style.getPropertyValue('--mx') || '-',
        my: el?.style.getPropertyValue('--my') || '-',
        near: el?.classList.contains('is-near') ?? false,
      });
      const hit = document.elementFromPoint(px, py)?.closest('.bento-card');
      const others = Array.from(document.querySelectorAll('.bento-card')).filter((el) => el !== hit);
      const displaced = others.filter((el) => {
        const t = el.style.transform || '';
        return t && !/translate3d\(0px, 0px, 0px\) rotateX\(0deg\) rotateY\(0deg\) scale\(1\)/.test(t);
      });
      return {
        指针下的卡片: read(hit),
        其它卡片被位移的数量: displaced.length,
        卡片总数: others.length + (hit ? 1 : 0),
      };
    },
    { px: hx, py: hy },
  );
  console.log('magnetic:', JSON.stringify(probe, null, 1));
}

// CLIP="x,y,w,h" 只截取局部
const clip = process.env.CLIP
  ? (([x, y, w, h]) => ({ x, y, width: w, height: h }))(process.env.CLIP.split(',').map(Number))
  : undefined;

await page.screenshot({ path: out, clip });

// CANVAS=1 时额外导出背景画布本身（透明底），便于确认光束绘制是否正确
if (process.env.CANVAS) {
  const dataUrl = await page.evaluate(() => {
    const el = document.querySelector('.flow-canvas');
    return el instanceof HTMLCanvasElement ? el.toDataURL('image/png') : '';
  });
  if (dataUrl) {
    const canvasOut = out.replace(/\.png$/, '.canvas.png');
    const { writeFile } = await import('node:fs/promises');
    await writeFile(canvasOut, Buffer.from(dataUrl.split(',')[1], 'base64'));
    console.log(`canvas: ${canvasOut}`);
  }
}

console.log(`saved: ${out} (${width}x${height})`);
console.log(problems.length > 0 ? `problems:\n${problems.join('\n')}` : 'problems: none');

/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
