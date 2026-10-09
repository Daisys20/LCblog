/**
 * 音乐播放器功能自检：点击播放按钮后，确认音频真的在解码推进。
 *
 * 用法：node scripts/verify-music.mjs [页面地址]
 * 换歌后跑一次，就能知道配的 neteaseId 是否还有外链播放权限。
 */
import puppeteer from 'puppeteer-core';

const url = process.argv[2] ?? 'http://127.0.0.1:5173/';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: [
    '--no-proxy-server',
    '--hide-scrollbars',
    '--autoplay-policy=no-user-gesture-required',
    // headless 没有声卡，用空音频输出让解码照常推进
    '--use-fake-device-for-media-stream',
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 1 });

const audioRequests = [];
page.on('response', (res) => {
  const type = res.headers()['content-type'] ?? '';
  if (type.includes('audio') || /music\.126\.net|music\.163\.com/.test(res.url())) {
    audioRequests.push({ status: res.status(), type, url: res.url().slice(0, 90) });
  }
});

// 把 audio 的当前 src 暴露出来，方便核对走的是哪条链路
await page.evaluateOnNewDocument(() => {
  window.__audioProbe = [];
});

await page.goto(url, { waitUntil: 'networkidle2', timeout: 40_000 });
await new Promise((r) => setTimeout(r, 1500));

const before = await page.evaluate(() => {
  const a = document.querySelector('audio');
  return a
    ? { src: a.getAttribute('src'), paused: a.paused, duration: a.duration, readyState: a.readyState }
    : null;
});
console.log('初始状态:', JSON.stringify(before));

// 真实点击，带用户手势
await page.click('.music__btn--main');
console.log('已点击播放，等待 6 秒…');
await new Promise((r) => setTimeout(r, 6000));

const after = await page.evaluate(() => {
  const a = document.querySelector('audio');
  if (!a) return null;
  const err = a.error;
  return {
    paused: a.paused,
    currentTime: Number(a.currentTime.toFixed(2)),
    duration: Number.isFinite(a.duration) ? Number(a.duration.toFixed(2)) : null,
    readyState: a.readyState,
    networkState: a.networkState,
    error: err ? { code: err.code, message: err.message } : null,
    videoWidth: a.videoWidth,
    // 播放中 UI 上的时间文本，用来确认 React 状态也同步了
    uiTime: document.querySelector('.music__time span')?.textContent,
    vinylSpinning: document.querySelector('.music__vinyl')?.classList.contains('is-spinning'),
    warn: document.querySelector('.music__warn')?.textContent ?? null,
  };
});
console.log('播放后状态:', JSON.stringify(after, null, 1));
console.log('音频相关请求:', JSON.stringify(audioRequests, null, 1));

const ok = after && !after.paused && after.currentTime > 0.5 && !after.error;
console.log(ok ? '\nRESULT: 播放正常 ✅' : '\nRESULT: 播放失败 ❌');
if (after?.warn) console.log('页面提示:', after.warn);

/* Chrome 有时不响应 close()，SIGKILL 之后事件循环仍可能被挂住；
   先 flush stdout 再强制退出，否则脚本会被外层超时杀掉、输出全部丢失 */
const _cp = browser.process();
if (_cp && !_cp.killed) _cp.kill('SIGKILL');
process.exit(0);
process.exit(ok ? 0 : 1);
