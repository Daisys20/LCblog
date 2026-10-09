/**
 * 校验「整图卡片」的图片是否真的加载并按预期尺寸渲染：
 *   node scripts/probe-images.mjs [视口宽] [视口高]
 * 输出每个选择器下 <img> 的 src / 原始尺寸 / 渲染尺寸 / 平均色（非白=照片已铺满）
 */
import puppeteer from 'puppeteer-core';

const CHROME_PATH =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const width = Number(process.argv[2] ?? 1536);
const height = Number(process.argv[3] ?? 1700);

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: 'new',
  args: ['--no-proxy-server', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });

const problems = [];
page.on('pageerror', (e) => problems.push('PAGEERR ' + e.message));
page.on('requestfailed', (r) => {
  if (r.failure()?.errorText !== 'net::ERR_ABORTED') {
    problems.push('REQFAIL ' + r.url() + ' ' + (r.failure()?.errorText ?? ''));
  }
});

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30_000 });
await new Promise((r) => setTimeout(r, 1500));

const info = await page.evaluate(() => {
  const sels = ['.bento-card--banner img', '.bento-card--keep img', '.bento-card--quote img'];
  const out = {};
  for (const sel of sels) {
    const img = document.querySelector(sel);
    if (!(img instanceof HTMLImageElement)) {
      out[sel] = 'MISSING';
      continue;
    }
    let avg = '?';
    try {
      const c = document.createElement('canvas');
      c.width = 24;
      c.height = 24;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 24, 24);
      const d = ctx.getImageData(0, 0, 24, 24).data;
      let r = 0,
        g = 0,
        b = 0;
      for (let i = 0; i < d.length; i += 4) {
        r += d[i];
        g += d[i + 1];
        b += d[i + 2];
      }
      const n = d.length / 4;
      avg = `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`;
    } catch (e) {
      avg = 'CANVAS_ERR ' + e.message;
    }
    const rect = img.getBoundingClientRect();
    out[sel] = {
      src: img.getAttribute('src'),
      natural: `${img.naturalWidth}x${img.naturalHeight}`,
      complete: img.complete,
      rect: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
      avgColor: avg,
    };
  }
  return out;
});

console.log(JSON.stringify(info, null, 2));
console.log(problems.length ? `problems:\n${problems.join('\n')}` : 'problems: none');

/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
