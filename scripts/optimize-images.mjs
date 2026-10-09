/**
 * 用 headless Chrome 的 canvas 把 public/images 下的 PNG 批处理成压缩后的 JPEG。
 *
 * 为什么不用 sharp/Pillow：本机 pip 源不可用，sharp 也要下载二进制。
 * 浏览器自带 JPEG 编码器，走 dev server 加载图片还是同源的，canvas 不会被污染。
 *
 * 用法：node scripts/optimize-images.mjs [--dry]
 */
import { readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173';
const DIR = path.resolve('public/images');

/** 每张图的目标文件名 / 宽度 / JPEG 质量 */
const PLAN = [
  { match: 'Cinematic_wide_landscape_photo_', to: 'hero.jpg', width: 1600, quality: 0.82 },
  { match: 'Serene_snow_capped_mountain_pe_', to: 'quote-mountain.jpg', width: 900, quality: 0.8 },
  { match: 'Clear_blue_mountain_valley_wit_', to: 'keep-going.jpg', width: 900, quality: 0.8 },
  { match: 'Cozy_flat_lay_photograph_of_a__', to: 'thing-game.jpg', width: 700, quality: 0.78 },
  { match: 'Warm_flat_lay_photograph_of_a__', to: 'thing-music.jpg', width: 700, quality: 0.78 },
  { match: 'Cinematic_flat_lay_photograph__', to: 'thing-movie.jpg', width: 700, quality: 0.78 },
  { match: 'Sunrise_over_misty_layered_mou_', to: 'scene-1.jpg', width: 700, quality: 0.78 },
  { match: 'Autumn_forest_path_covered_wit_', to: 'scene-2.jpg', width: 700, quality: 0.78 },
  { match: 'Winding_mountain_road_at_golde_', to: 'scene-3.jpg', width: 700, quality: 0.78 },
  { match: 'Minimal_product_photograph_of__2026-10-08T02-25-14', to: 'thing-camera.jpg', width: 700, quality: 0.78 },
  { match: 'Minimal_product_photograph_of__2026-10-08T02-25-13', to: 'thing-gadget.jpg', width: 700, quality: 0.78 },
];

const dry = process.argv.includes('--dry');

const files = await readdir(DIR);
const pngs = files.filter((f) => f.toLowerCase().endsWith('.png'));

const jobs = [];
for (const item of PLAN) {
  const source = pngs.find((f) => f.startsWith(item.match));
  if (!source) {
    console.log(`!! 没找到匹配 ${item.match} 的源文件`);
    continue;
  }
  jobs.push({ ...item, source });
}

if (!jobs.length) {
  console.log('没有待处理的图片');
  process.exit(0);
}

console.log(`待处理 ${jobs.length} 张，已发现的 PNG 共 ${pngs.length} 个`);
if (dry) {
  for (const job of jobs) console.log(`  ${job.source} -> ${job.to}`);
  process.exit(0);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-proxy-server', '--hide-scrollbars'],
});
const page = await browser.newPage();
// 先访问一次，让 canvas 处于同源上下文（图片走 dev server 也是同源）
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30_000 });

const report = [];
for (const job of jobs) {
  const url = `${BASE}/images/${job.source}`;
  const result = await page.evaluate(
    async (src, maxWidth, quality) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const ratio = Math.min(1, maxWidth / img.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * ratio);
      canvas.height = Math.round(img.naturalHeight * ratio);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return {
        data: canvas.toDataURL('image/jpeg', quality),
        from: `${img.naturalWidth}x${img.naturalHeight}`,
        to: `${canvas.width}x${canvas.height}`,
      };
    },
    url,
    job.width,
    job.quality,
  );

  const base64 = result.data.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');
  const outPath = path.join(DIR, job.to);
  await writeFile(outPath, buffer);
  const before = (await stat(path.join(DIR, job.source))).size;
  report.push({
    file: job.to,
    size: `${(before / 1024 / 1024).toFixed(2)}MB -> ${(buffer.length / 1024).toFixed(0)}KB`,
    dim: `${result.from} -> ${result.to}`,
  });
  console.log(`OK ${job.to.padEnd(20)} ${(before / 1024 / 1024).toFixed(2)}MB -> ${(buffer.length / 1024).toFixed(0)}KB  (${result.to})`);
}

// 全部转换成功后再清理原始 PNG
for (const job of jobs) {
  await unlink(path.join(DIR, job.source));
}
const left = (await readdir(DIR)).filter((f) => f.toLowerCase().endsWith('.png'));
console.log(`\n已清理源 PNG，目录剩余 PNG ${left.length} 个`);
const total = (await Promise.all((await readdir(DIR)).map(async (f) => (await stat(path.join(DIR, f))).size))).reduce((a, b) => a + b, 0);
console.log(`images 目录总体积 ${(total / 1024 / 1024).toFixed(2)}MB`);
void report;

/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住，
   直接退出，避免脚本被外层超时杀掉导致输出丢失（注意要放在文件最末尾） */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
