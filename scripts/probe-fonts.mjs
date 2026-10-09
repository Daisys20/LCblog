/**
 * 验证字体是否真正加载 + 关键元素最终生效的字体
 * 用法: node scripts/probe-fonts.mjs [url]
 */
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.argv[2] || 'http://127.0.0.1:5173/';

const p = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--font-render-hinting=none'],
});
const pg = await p.newPage();
await pg.setViewport({ width: 1536, height: 1700, deviceScaleFactor: 1 });

const errors = [];
pg.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
pg.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
pg.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url() + ' ' + (r.failure()?.errorText || '')));

await pg.goto(URL, { waitUntil: 'networkidle0', timeout: 45000 });
await pg.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1200));

const result = await pg.evaluate(async () => {
  await document.fonts.ready;
  const specs = [
    ['Noto Sans SC', '16px "Noto Sans SC"', '正文标题测试ABC'],
    ['Cormorant Garamond italic', 'italic 16px "Cormorant Garamond"', 'Things I Love 123'],
    ['Caveat', '16px "Caveat"', 'ALKAID'],
    ['LXGW WenKai', '16px "LXGW WenKai"', '人生语录测试'],
  ];
  const checks = specs.map(([name, spec, text]) => ({
    name,
    checkLatin: document.fonts.check(spec),
    checkText: document.fonts.check(spec, text),
  }));

  const families = {};
  for (const f of document.fonts) {
    const k = f.family.replace(/"/g, '');
    if (/Noto Sans SC|Cormorant|Caveat|LXGW/i.test(k)) {
      families[k] = families[k] || { loaded: 0, total: 0, styles: new Set() };
      families[k].total++;
      if (f.status === 'loaded') families[k].loaded++;
      families[k].styles.add(`${f.style}/${f.weight}`);
    }
  }
  const fontSummary = Object.entries(families).map(([k, v]) => ({
    family: k,
    loaded: v.loaded,
    total: v.total,
    styles: [...v.styles].slice(0, 6).join(', '),
  }));

  const sels = [
    'body',
    '.card-head__title',
    '.card-head__sub',
    '.quote__text',
    '.quote__author',
    '.attrs__caption',
    '.os-head__name',
    '.facts__row dt',
    '.attrs__label',
    '.journey__year',
  ];
  const computed = sels.map((s) => {
    const el = document.querySelector(s);
    if (!el) return { sel: s, missing: true };
    const cs = getComputedStyle(el);
    return { sel: s, family: cs.fontFamily.split(',')[0].trim(), style: cs.fontStyle, weight: cs.fontWeight };
  });

  return { checks, fontSummary, computed };
});

console.log('=== font-face 加载状态 ===');
for (const f of result.fontSummary) console.log(`  ${f.family.padEnd(22)} loaded ${f.loaded}/${f.total}  [${f.styles}]`);
console.log('=== document.fonts.check ===');
for (const c of result.checks) console.log(`  ${c.name.padEnd(24)} latin=${c.checkLatin} text=${c.checkText}`);
console.log('=== 关键元素最终字体 ===');
for (const c of result.computed) {
  if (c.missing) { console.log(`  ${c.sel.padEnd(22)} <元素不存在>`); continue; }
  console.log(`  ${c.sel.padEnd(22)} ${c.family.padEnd(20)} style=${c.style} weight=${c.weight}`);
}
console.log('=== 控制台/请求错误 ===');
console.log(errors.length ? errors.slice(0, 10).join('\n') : '  (无)');

await p.close();
