// 取歌曲详情：id / 名 / 歌手 / 专辑 / 封面 / 热度(pop)
async function detail(ids) {
  const url = `https://music.163.com/api/song/detail?ids=${JSON.stringify(ids)}`;
  const r = await fetch(url, {
    headers: { 'Referer': 'https://music.163.com/', 'User-Agent': 'Mozilla/5.0' },
  });
  const j = await r.json();
  return (j?.songs || []).map((s) => ({
    id: s.id,
    name: s.name,
    artists: (s.artists || []).map((a) => a.name).join('/'),
    album: s.album?.name || '',
    pic: s.album?.picUrl || '',
    pop: s.pop ?? '',
  }));
}

const CHOSEN = [
  1456890009, // 罗生门 梨冻紧/Wiz_H
  2641867659, // 一点 Muyoi/Pezzi
  2051580537, // 童话 刘大拿
  214025,     // 爱一个人 陈慧琳/李克勤
  1398663411, // 冬眠 司南
  1477144603, // 入秋 RAMBO GANG...
];

const list = await detail(CHOSEN);
for (const s of list) {
  console.log(`id=${s.id} | pop=${s.pop} | ${s.name} | ${s.artists} | 专辑:${s.album}`);
  console.log(`   cover: ${s.pic}`);
}

// 歧义歌再按热度核对候选
const DISAM = ['爱一个人', '冬眠', '入秋'];
async function search(kw) {
  const url = `https://music.163.com/api/search/get?type=1&s=${encodeURIComponent(kw)}&limit=5&offset=0`;
  const r = await fetch(url, { headers: { 'Referer': 'https://music.163.com/', 'User-Agent': 'Mozilla/5.0' } });
  const j = await r.json();
  return (j?.result?.songs || []).map((s) => ({ id: s.id, name: s.name, artists: (s.artists||[]).map(a=>a.name).join('/'), pop: s.pop ?? '' }));
}
for (const kw of DISAM) {
  console.log('\n--- 候选:', kw, '---');
  const c = await search(kw);
  for (const s of c) console.log(`  id=${s.id} pop=${s.pop} | ${s.name} | ${s.artists}`);
}
