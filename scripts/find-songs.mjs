// 用网易云搜索接口查歌曲候选，输出 id / 歌名 / 歌手 / 封面
const KEYWORDS = [
  '罗生门',
  '一点 muyoi',
  '童话 刘大拿',
  '爱一个人',
  '冬眠',
  '入秋',
];

async function search(kw) {
  const url = `https://music.163.com/api/search/get?type=1&s=${encodeURIComponent(kw)}&limit=6&offset=0`;
  const r = await fetch(url, {
    headers: {
      'Referer': 'https://music.163.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });
  const j = await r.json();
  const songs = (j?.result?.songs) || [];
  return songs.map((s) => ({
    id: s.id,
    name: s.name,
    artists: (s.artists || []).map((a) => a.name).join('/'),
    album: s.album?.name || '',
    pic: s.album?.picUrl || '',
  }));
}

for (const kw of KEYWORDS) {
  console.log('\n===== 关键词:', kw, '=====');
  try {
    const list = await search(kw);
    if (!list.length) { console.log('  (无结果)'); continue; }
    for (const s of list) {
      console.log(`  id=${s.id} | ${s.name} | ${s.artists} | 专辑:${s.album}`);
      console.log(`     cover: ${s.pic}`);
    }
  } catch (e) {
    console.log('  ERR', e.message);
  }
}
