/**
 * 把霞鹜文楷(LXGW WenKai regular)自托管到 public/fonts/lxgw-wenkai/
 * —— 因为 jsDelivr 在本机不可达，避免线上掉字体
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve('public/fonts/lxgw-wenkai');
const FILES = path.join(OUT, 'files');

const CDNS = [
  'https://unpkg.com/lxgw-wenkai-webfont@1.7.0/',
  'https://registry.npmmirror.com/lxgw-wenkai-webfont/1.7.0/files/',
];

async function get(url) {
  const r = await fetch(url, { redirect: 'follow' });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

async function tryCdns(rel) {
  let last;
  for (const base of CDNS) {
    try {
      return await get(base + rel);
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

await fs.mkdir(FILES, { recursive: true });

let css = (await tryCdns('lxgwwenkai-regular.css')).toString('utf8');
const names = [...css.matchAll(/url\('\.\/files\/([^']+)'\)/g)].map((m) => m[1]);
console.log(`css bytes: ${css.length}, subsets: ${names.length}`);

let total = 0;
let i = 0;
const CONC = 8;
async function worker() {
  while (i < names.length) {
    const n = names[i++];
    const buf = await tryCdns('files/' + n);
    await fs.writeFile(path.join(FILES, n), buf);
    total += buf.length;
    if (i % 20 === 0) console.log(`  ...${i}/${names.length} (${(total / 1048576).toFixed(2)} MB)`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));

// 改写 url 指向本地（public/ 挂载在站点根）
css = css.replace(/url\('\.\/files\//g, "url('/fonts/lxgw-wenkai/files/");
await fs.writeFile(path.join(OUT, 'lxgwwenkai-regular.css'), css);

console.log(`完成: ${names.length} 个 woff2, 合计 ${(total / 1048576).toFixed(2)} MB`);
