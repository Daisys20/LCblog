import type { ReactNode } from 'react';

import type { GalleryKind, ProjectArt } from '../data/profile';

/* ==================================================================
   项目缩略图：200 × 110 的深色科技感示意图，不依赖任何截图
   ================================================================== */
const PROJECT_ART: Record<ProjectArt, ReactNode> = {
  /* 工业物联网：设备列表 + 折线 + 实时柱状 */
  iot: (
    <>
      <rect width="200" height="110" fill="#0b1220" />
      <g stroke="#1e293b" strokeWidth="0.5">
        <path d="M0 27h200M0 55h200M0 83h200M40 0v110M80 0v110M120 0v110M160 0v110" />
      </g>
      <g fill="#1d4ed8" opacity="0.9">
        <rect x="10" y="12" width="26" height="6" rx="2" />
        <rect x="10" y="24" width="18" height="6" rx="2" opacity="0.7" />
        <rect x="10" y="36" width="30" height="6" rx="2" opacity="0.5" />
      </g>
      <polyline
        points="52,78 70,66 88,72 106,48 124,56 142,34 160,44 186,22"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polyline
        points="52,78 70,66 88,72 106,48 124,56 142,34 160,44 186,22"
        fill="url(#art-iot-fill)"
        stroke="none"
      />
      <defs>
        <linearGradient id="art-iot-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="142" cy="34" r="2.6" fill="#e2e8f0" />
      <g fill="#22c55e" opacity="0.85">
        <rect x="52" y="92" width="9" height="10" rx="1.5" />
        <rect x="66" y="86" width="9" height="16" rx="1.5" />
        <rect x="80" y="90" width="9" height="12" rx="1.5" />
        <rect x="94" y="82" width="9" height="20" rx="1.5" />
        <rect x="108" y="88" width="9" height="14" rx="1.5" />
      </g>
      <g fill="#1e293b">
        <rect x="150" y="66" width="40" height="36" rx="4" />
      </g>
      <g fill="#38bdf8" opacity="0.65">
        <rect x="156" y="72" width="28" height="3" rx="1.5" />
        <rect x="156" y="79" width="20" height="3" rx="1.5" />
        <rect x="156" y="86" width="24" height="3" rx="1.5" />
        <rect x="156" y="93" width="14" height="3" rx="1.5" />
      </g>
    </>
  ),

  /* AI 应用平台：对话气泡 + 模型节点连接 */
  ai: (
    <>
      <rect width="200" height="110" fill="#0d0b1f" />
      <g stroke="#2d2350" strokeWidth="0.5">
        <path d="M0 36h200M0 72h200M50 0v110M100 0v110M150 0v110" />
      </g>
      <g>
        <rect x="12" y="14" width="76" height="17" rx="8" fill="#312e81" />
        <rect x="20" y="20" width="52" height="4" rx="2" fill="#a5b4fc" opacity="0.85" />
        <rect x="30" y="39" width="86" height="17" rx="8" fill="#1e1b4b" />
        <rect x="38" y="45" width="62" height="4" rx="2" fill="#818cf8" opacity="0.7" />
        <rect x="20" y="64" width="64" height="17" rx="8" fill="#312e81" />
        <rect x="28" y="70" width="40" height="4" rx="2" fill="#a5b4fc" opacity="0.85" />
      </g>
      <g stroke="#6366f1" strokeWidth="1" opacity="0.75">
        <path d="M150 22l22 16M150 22l22 40M172 78l-22 16M150 94l-14-30M172 38l-22 16" />
      </g>
      <g fill="#818cf8">
        <circle cx="150" cy="22" r="4" />
        <circle cx="150" cy="94" r="4" />
      </g>
      <g fill="#c084fc">
        <circle cx="172" cy="38" r="5" />
        <circle cx="172" cy="62" r="5" />
      </g>
      <g fill="#38bdf8">
        <circle cx="150" cy="68" r="4" />
      </g>
    </>
  ),

  /* 数字孪生：等距三维方块 */
  twin: (
    <>
      <rect width="200" height="110" fill="#04141a" />
      <g stroke="#0e3441" strokeWidth="0.5">
        <path d="M0 22h200M0 44h200M0 66h200M0 88h200M30 0v110M60 0v110M90 0v110M120 0v110M150 0v110M180 0v110" />
      </g>
      <g>
        <path d="M62 26l24-12 24 12-24 12z" fill="#22d3ee" opacity="0.9" />
        <path d="M62 26v26l24 12V38z" fill="#0e7490" />
        <path d="M110 26v26l-24 12V38z" fill="#155e75" />
      </g>
      <g>
        <path d="M116 50l18-9 18 9-18 9z" fill="#5eead4" opacity="0.85" />
        <path d="M116 50v20l18 9V59z" fill="#0f766e" />
        <path d="M152 50v20l-18 9V59z" fill="#115e59" />
      </g>
      <g>
        <path d="M34 64l14-7 14 7-14 7z" fill="#67e8f9" opacity="0.7" />
        <path d="M34 64v16l14 7V71z" fill="#0e7490" />
        <path d="M62 64v16l-14 7V71z" fill="#155e75" />
      </g>
      <g stroke="#22d3ee" strokeWidth="1" opacity="0.5">
        <path d="M98 34l36 12M86 40l-38 22" />
      </g>
    </>
  ),

  /* 个人博客前台：浏览器窗口 + 卡片流 */
  web: (
    <>
      <rect width="200" height="110" fill="#0a1020" />
      <rect x="16" y="10" width="168" height="90" rx="6" fill="#111a2e" stroke="#233350" />
      <rect x="16" y="10" width="168" height="14" rx="6" fill="#1b2740" />
      <g fill="#f87171">
        <circle cx="26" cy="17" r="2.4" />
      </g>
      <g fill="#fbbf24">
        <circle cx="35" cy="17" r="2.4" />
      </g>
      <g fill="#34d399">
        <circle cx="44" cy="17" r="2.4" />
      </g>
      <rect x="56" y="13" width="96" height="8" rx="4" fill="#0d1526" />
      <rect x="24" y="31" width="152" height="30" rx="4" fill="#1d4ed8" opacity="0.55" />
      <rect x="32" y="39" width="58" height="5" rx="2.5" fill="#dbeafe" opacity="0.9" />
      <rect x="32" y="49" width="40" height="4" rx="2" fill="#bfdbfe" opacity="0.6" />
      <g fill="#1e293b">
        <rect x="24" y="66" width="46" height="26" rx="4" />
        <rect x="77" y="66" width="46" height="26" rx="4" />
        <rect x="130" y="66" width="46" height="26" rx="4" />
      </g>
      <g fill="#38bdf8" opacity="0.75">
        <rect x="30" y="72" width="30" height="3.5" rx="1.75" />
        <rect x="83" y="72" width="30" height="3.5" rx="1.75" />
        <rect x="136" y="72" width="30" height="3.5" rx="1.75" />
      </g>
      <g fill="#475569">
        <rect x="30" y="80" width="20" height="3" rx="1.5" />
        <rect x="83" y="80" width="20" height="3" rx="1.5" />
        <rect x="136" y="80" width="20" height="3" rx="1.5" />
      </g>
    </>
  ),

  /* 脚手架 CLI：终端窗口 */
  tool: (
    <>
      <rect width="200" height="110" fill="#04120c" />
      <rect x="10" y="10" width="180" height="90" rx="6" fill="#071a12" stroke="#123326" />
      <rect x="10" y="10" width="180" height="14" rx="6" fill="#0d2a1e" />
      <g fill="#22c55e">
        <circle cx="20" cy="17" r="2.4" opacity="0.9" />
      </g>
      <g fill="#334155">
        <circle cx="29" cy="17" r="2.4" />
        <circle cx="38" cy="17" r="2.4" />
      </g>
      <g fontFamily="monospace" fontSize="7" fill="#4ade80">
        <text x="20" y="40">$ npx create-alkaid-app</text>
      </g>
      <g fontFamily="monospace" fontSize="6" fill="#22c55e" opacity="0.75">
        <text x="20" y="53">✔ 模板已生成</text>
        <text x="20" y="64">✔ 依赖已安装</text>
        <text x="20" y="75">✔ eslint / prettier 就绪</text>
      </g>
      <rect x="20" y="84" width="34" height="7" rx="3.5" fill="#22c55e" opacity="0.9" />
      <rect x="58" y="84" width="10" height="7" rx="3.5" fill="#4ade80" opacity="0.5" />
      <g stroke="#0f766e" strokeWidth="0.6" opacity="0.5">
        <path d="M150 30v60M166 30v60" />
      </g>
      <g fill="#5eead4" opacity="0.55">
        <circle cx="150" cy="44" r="2" />
        <circle cx="166" cy="60" r="2" />
        <circle cx="150" cy="76" r="2" />
      </g>
    </>
  ),

  /* 运营数据大屏：指标块 + 柱状 + 折线 + 圆环 */
  data: (
    <>
      <rect width="200" height="110" fill="#080f1c" />
      <g stroke="#16233b" strokeWidth="0.5">
        <path d="M0 20h200M0 40h200M0 60h200M0 80h200M0 100h200M25 0v110M50 0v110M75 0v110M100 0v110M125 0v110M150 0v110M175 0v110" />
      </g>
      <g fill="#132038">
        <rect x="10" y="10" width="52" height="24" rx="4" />
        <rect x="68" y="10" width="52" height="24" rx="4" />
        <rect x="126" y="10" width="64" height="24" rx="4" />
      </g>
      <g fill="#38bdf8">
        <rect x="17" y="16" width="22" height="8" rx="2" />
      </g>
      <g fill="#a78bfa">
        <rect x="75" y="16" width="16" height="8" rx="2" />
      </g>
      <g fill="#34d399">
        <rect x="133" y="16" width="26" height="8" rx="2" />
      </g>
      <g fill="#1e3a5f" opacity="0.9">
        <rect x="17" y="28" width="30" height="3" rx="1.5" />
        <rect x="75" y="28" width="24" height="3" rx="1.5" />
        <rect x="133" y="28" width="36" height="3" rx="1.5" />
      </g>
      <g fill="#2563eb" opacity="0.85">
        <rect x="12" y="76" width="7" height="24" rx="2" />
        <rect x="23" y="66" width="7" height="34" rx="2" />
        <rect x="34" y="72" width="7" height="28" rx="2" />
        <rect x="45" y="56" width="7" height="44" rx="2" />
        <rect x="56" y="62" width="7" height="38" rx="2" />
      </g>
      <polyline
        points="74,84 88,72 102,78 116,58 130,66 144,42 158,50 172,30 188,36"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <g fill="none" stroke="#334155" strokeWidth="5">
        <circle cx="176" cy="86" r="14" />
      </g>
      <g fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round">
        <circle cx="176" cy="86" r="14" strokeDasharray="60 88" transform="rotate(-90 176 86)" />
      </g>
      <circle cx="176" cy="86" r="14" fill="none" stroke="#1e293b" strokeWidth="1" />
      <rect x="74" y="60" width="60" height="40" rx="4" fill="none" stroke="#1e293b" strokeWidth="0.8" />
    </>
  ),
};

/** 项目缩略图（200 × 110） */
export function ProjectArtwork({ art }: { art: ProjectArt }) {
  return (
    <svg viewBox="0 0 200 110" aria-hidden="true">
      {PROJECT_ART[art]}
    </svg>
  );
}

/* ==================================================================
   生活页缩略图：150 × 200 的竖构图，和卡片 3:4 的比例一致
   —— 没有实拍图的条目（游戏 / 音乐 / 电影 / 物件 / 部分风景）用它顶上
   ================================================================== */

interface Palette {
  sky: string;
  skyTo: string;
  ink: string;
  accent: string;
  glow: string;
}

const GALLERY_PALETTE: Record<GalleryKind, Palette> = {
  scene: { sky: '#08222c', skyTo: '#0d4550', ink: '#061a22', accent: '#5fd0c0', glow: '#c9f0e8' },
  game: { sky: '#1a1140', skyTo: '#3a1c6e', ink: '#100a20', accent: '#a78bfa', glow: '#ddd6fe' },
  music: { sky: '#3a0f2c', skyTo: '#7b2350', ink: '#22091c', accent: '#f472b6', glow: '#fbcfe8' },
  movie: { sky: '#2a1806', skyTo: '#6a3d0c', ink: '#1b1004', accent: '#fbbf24', glow: '#fde68a' },
  gadget: { sky: '#0d1723', skyTo: '#1e3245', ink: '#0a121b', accent: '#38bdf8', glow: '#bae6fd' },
};

/* 同一个标签页里有 6 张同种类的图，靠「换一个邻近色 + 换一套构图」拉开区别，
   不至于看上去是同一张图复制了 6 份。 */
const GALLERY_ACCENTS: Record<GalleryKind, string[]> = {
  scene: ['#5fd0c0', '#7cc6f0', '#e0b477'],
  game: ['#a78bfa', '#7c9cf5', '#ef9ecb'],
  music: ['#f472b6', '#c084fc', '#fb8f6b'],
  movie: ['#fbbf24', '#f2946b', '#e8cf8a'],
  gadget: ['#38bdf8', '#7dd3fc', '#8fb8ff'],
};

/** 稳定的小伪随机：同一个 seed 每次都画得一样，不会闪 */
function noise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** 天空 + 光晕 + 细颗粒，五个种类共用这一层底 */
function Backdrop({ p, uid }: { p: Palette; uid: string }) {
  const dots = Array.from({ length: 26 }, (_, i) => {
    const r1 = noise(i * 3.1 + 1);
    const r2 = noise(i * 7.7 + 2);
    const r3 = noise(i * 5.3 + 3);
    return (
      <circle
        key={i}
        cx={r1 * 150}
        cy={r2 * 200}
        r={0.5 + r3 * 1.1}
        fill={p.glow}
        opacity={0.1 + r3 * 0.3}
      />
    );
  });

  return (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={p.sky} />
          <stop offset="100%" stopColor={p.skyTo} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={p.glow} stopOpacity="0.55" />
          <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="150" height="200" fill={`url(#${uid}-sky)`} />
      <g>{dots}</g>
    </>
  );
}

/** 生活展示：三种构图轮着来 —— 月下远山 / 丘陵落日 / 海上归帆 */
function SceneArt({ p, seed, uid }: { p: Palette; seed: number; uid: string }) {
  const variant = Math.abs(seed) % 3;
  const flip = seed % 2 === 1;
  const r1 = noise(seed + 0.4);
  const r2 = noise(seed + 1.7);

  const inner =
    variant === 0 ? (
      /* 月下远山：山脊两层 + 水面倒影 */
      <>
        <circle cx={96 + r1 * 26} cy={42 + r2 * 14} r="42" fill={`url(#${uid}-glow)`} />
        <circle cx={96 + r1 * 26} cy={42 + r2 * 14} r="13" fill={p.glow} opacity="0.9" />
        <path
          d={`M-6 ${118 - r2 * 12} L26 ${86 - r2 * 12} L50 ${106 - r2 * 12} L78 ${70 - r2 * 12} L108 ${102 - r2 * 12} L134 ${82 - r2 * 12} L156 ${110 - r2 * 12} L156 200 L-6 200 Z`}
          fill={p.accent}
          opacity="0.34"
        />
        <path
          d={`M-6 146 L30 114 L58 138 L92 106 L124 140 L156 120 L156 200 L-6 200 Z`}
          fill={p.ink}
          opacity="0.96"
        />
        <rect y="156" width="150" height="44" fill={p.ink} />
        <g stroke={p.glow} strokeWidth="1.1" strokeLinecap="round" opacity="0.35">
          <path
            d={`M${96 + r1 * 26 - 22} 166 h15M${96 + r1 * 26 - 10} 174 h21M${96 + r1 * 26 - 26} 182 h13M${96 + r1 * 26 - 4} 190 h19`}
          />
        </g>
        <g stroke={p.glow} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" fill="none">
          <path d="M28 46q4-4 8 0M38 42q4-4 8 0M22 56q3-3 6 0" />
        </g>
      </>
    ) : variant === 1 ? (
      /* 丘陵落日：低垂的大太阳 + 三层丘 + 树影 */
      <>
        <circle cx={78 + r1 * 24} cy={126} r="58" fill={`url(#${uid}-glow)`} />
        <circle cx={78 + r1 * 24} cy={126} r="20" fill={p.glow} opacity="0.92" />
        <path d="M-6 148 L34 118 L74 146 L114 112 L156 142 L156 200 L-6 200 Z" fill={p.accent} opacity="0.28" />
        <path d="M-6 162 L44 134 L92 164 L136 130 L156 146 L156 200 L-6 200 Z" fill={p.accent} opacity="0.5" />
        <path d="M-6 176 L40 156 L88 180 L130 154 L156 168 L156 200 L-6 200 Z" fill={p.ink} />
        <g fill={p.ink}>
          <path d="M44 158 l7-18 7 18 z" />
          <rect x="50" y="156" width="2.4" height="10" />
          <path d="M104 152 l6-15 6 15 z" />
          <rect x="109" y="150" width="2.2" height="9" />
          <path d="M118 156 l5-12 5 12 z" />
          <rect x="122" y="154" width="2" height="8" />
        </g>
        <g stroke={p.glow} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none">
          <path d="M34 60q4-4 8 0M46 54q3-3 6 0" />
        </g>
      </>
    ) : (
      /* 海上归帆：地平线 + 反光带 + 小帆船 */
      <>
        <circle cx={92 + r1 * 20} cy={104} r="46" fill={`url(#${uid}-glow)`} />
        <circle cx={92 + r1 * 20} cy={104} r="15" fill={p.glow} opacity="0.9" />
        <rect y="122" width="150" height="78" fill={p.accent} opacity="0.22" />
        <rect y="122" width="150" height="78" fill={p.ink} opacity="0.45" />
        <path d="M-6 122 h162" stroke={p.glow} strokeWidth="1.2" opacity="0.5" />
        <g stroke={p.glow} strokeWidth="1.4" strokeLinecap="round" opacity="0.4">
          <path
            d={`M${92 + r1 * 20 - 14} 134 h16M${92 + r1 * 20 - 9} 148 h14M${92 + r1 * 20 - 17} 162 h13M${92 + r1 * 20 - 7} 176 h16`}
          />
        </g>
        <g>
          <path d={`M${46 + r2 * 20} 118 l0 22 l14 0 z`} fill={p.glow} opacity="0.92" />
          <path d={`M${46 + r2 * 20} 118 l-9 22 l9 0 z`} fill={p.accent} opacity="0.75" />
          <path d={`M${46 + r2 * 20 - 13} 142 h26 l-4 6 h-18 z`} fill={p.ink} />
        </g>
        <g stroke={p.glow} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" fill="none">
          <path d="M26 44q4-4 8 0M36 40q4-4 8 0" />
        </g>
      </>
    );

  return (
    <>
      <Backdrop p={p} uid={uid} />
      <g transform={flip ? 'scale(-1 1) translate(-150 0)' : undefined}>{inner}</g>
    </>
  );
}

/** 游戏：像素天幕 + 手柄 */
function GameArt({ p, seed, uid }: { p: Palette; seed: number; uid: string }) {
  const t = Math.round(noise(seed + 0.6) * 12);
  const blocks = Array.from({ length: 9 }, (_, i) => {
    const h = 6 + Math.round(noise(seed + i * 2.3) * 26);
    return <rect key={i} x={8 + i * 15} y={128 - h} width="13" height={h} fill={p.ink} opacity="0.85" />;
  });

  return (
    <>
      <Backdrop p={p} uid={uid} />
      {/* 像素云 */}
      <g fill={p.glow} opacity="0.22">
        <rect x="18" y="34" width="34" height="7" />
        <rect x="26" y="27" width="18" height="7" />
        <rect x="92" y="52" width="28" height="7" />
        <rect x="100" y="45" width="14" height="7" />
      </g>
      <g>{blocks}</g>
      <rect y="128" width="150" height="72" fill={p.ink} opacity="0.55" />
      {/* 手柄 */}
      <path
        d={`M42 ${162 + t * 0.2} q-13 6 -13 18 t13 12 h10 q8 0 12-7 l8-13 h16 l8 13 q4 7 12 7 h10 q13 0 13-12 t-13-18 z`}
        fill={p.ink}
        stroke={p.accent}
        strokeWidth="2"
        strokeLinejoin="round"
        transform="translate(-7 4)"
      />
      <g stroke={p.accent} strokeWidth="2.2" strokeLinecap="round">
        <path d="M52 186h12M58 180v12" />
      </g>
      <g fill={p.accent}>
        <circle cx="98" cy="183" r="3.1" />
        <circle cx="108" cy="189" r="3.1" opacity="0.8" />
      </g>
      <rect x="70" y="191" width="12" height="3" rx="1.5" fill={p.accent} opacity="0.65" />
    </>
  );
}

/** 音乐：唱片 + 音轨 + 音符 */
function MusicArt({ p, seed, uid }: { p: Palette; seed: number; uid: string }) {
  const cx = 75;
  const cy = 104 + noise(seed + 3.3) * 8;

  return (
    <>
      <Backdrop p={p} uid={uid} />
      <circle cx={cx} cy={cy} r="62" fill={`url(#${uid}-glow)`} opacity="0.5" />
      <circle cx={cx} cy={cy} r="54" fill={p.ink} stroke={p.accent} strokeWidth="1.2" opacity="0.95" />
      <g fill="none" stroke={p.accent} strokeWidth="0.9" opacity="0.4">
        <circle cx={cx} cy={cy} r="44" />
        <circle cx={cx} cy={cy} r="35" />
        <circle cx={cx} cy={cy} r="26" />
      </g>
      <circle cx={cx} cy={cy} r="16" fill={p.accent} opacity="0.9" />
      <circle cx={cx} cy={cy} r="4" fill={p.ink} />
      {/* 唱臂 */}
      <g stroke={p.glow} strokeWidth="3" strokeLinecap="round" opacity="0.8">
        <path d={`M132 26 L${cx + 26} ${cy - 22}`} />
      </g>
      <circle cx="132" cy="26" r="4.5" fill={p.glow} />
      {/* 音符 */}
      <g fill={p.glow} opacity="0.85">
        <circle cx="26" cy="176" r="5" />
        <rect x="30" y="152" width="2.6" height="25" />
        <circle cx="46" cy="168" r="5" />
        <rect x="50" y="144" width="2.6" height="25" />
        <rect x="30" y="150" width="22.6" height="3" />
      </g>
    </>
  );
}

/** 电影：胶片齿孔 + 播放三角 */
function MovieArt({ p, seed, uid }: { p: Palette; seed: number; uid: string }) {
  const holes = Array.from({ length: 7 }, (_, i) => (
    <g key={i}>
      <rect x={10 + i * 19.4} y="18" width="10" height="8" rx="2" fill={p.glow} opacity="0.35" />
      <rect x={10 + i * 19.4} y="174" width="10" height="8" rx="2" fill={p.glow} opacity="0.35" />
    </g>
  ));
  const bars = Array.from({ length: 3 }, (_, i) => (
    <rect key={i} x={16 + i * 20} y="172" width="12" height="10" fill={p.ink} opacity="0.6" />
  ));

  return (
    <>
      <Backdrop p={p} uid={uid} />
      <rect y="14" width="150" height="172" fill={p.ink} opacity="0.7" />
      {holes}
      {bars}
      {/* 画面 */}
      <rect x="16" y="38" width="118" height="124" rx="7" fill={p.skyTo} opacity="0.9" />
      <rect
        x="16"
        y="38"
        width="118"
        height="124"
        rx="7"
        fill="none"
        stroke={p.accent}
        strokeWidth="1.4"
        opacity="0.7"
      />
      <circle cx="75" cy="100" r="26" fill={p.accent} opacity="0.16" />
      <path d={`M${64 + noise(seed) * 4} 84 l34 16 l-34 16 z`} fill={p.glow} opacity="0.92" />
      <g fill={p.glow} opacity="0.18">
        <rect x="26" y="46" width="30" height="4" rx="2" />
        <rect x="26" y="148" width="46" height="4" rx="2" />
      </g>
    </>
  );
}

/** 物件：桌面上的设备 + 走线 */
function GadgetArt({ p, seed, uid }: { p: Palette; seed: number; uid: string }) {
  const w = 84 + Math.round(noise(seed + 1.1) * 8);
  const x = (150 - w) / 2;
  const rows = Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 8 }, (_, c) => (
      <rect
        key={`${r}-${c}`}
        x={x + 10 + c * 8.6}
        y={128 + r * 8.6}
        width="6"
        height="6"
        rx="1.4"
        fill={p.accent}
        opacity={0.25 + noise(seed + r * 8 + c) * 0.5}
      />
    )),
  );

  return (
    <>
      <Backdrop p={p} uid={uid} />
      <g stroke={p.accent} strokeWidth="0.8" opacity="0.35" fill="none">
        <path d="M6 26h26v22h18M144 44h-22v26M10 176h30v-18M140 168h-24v-16" />
      </g>
      <g fill={p.accent} opacity="0.5">
        <circle cx="6" cy="26" r="2.2" />
        <circle cx="144" cy="44" r="2.2" />
        <circle cx="10" cy="176" r="2.2" />
        <circle cx="140" cy="168" r="2.2" />
      </g>
      {/* 键盘 */}
      <rect x={x} y="118" width={w} height="42" rx="7" fill={p.ink} stroke={p.accent} strokeWidth="1.2" opacity="0.95" />
      <g>{rows}</g>
      <rect x={x + 26} y="151" width="30" height="5" rx="2.5" fill={p.accent} opacity="0.4" />
      {/* 耳机 */}
      <g fill="none" stroke={p.glow} strokeWidth="3" opacity="0.85" strokeLinecap="round">
        <path d="M45 96a32 32 0 0 1 60 0" />
      </g>
      <g fill={p.glow} opacity="0.85">
        <rect x="41" y="92" width="10" height="20" rx="5" />
        <rect x="99" y="92" width="10" height="20" rx="5" />
      </g>
    </>
  );
}

/** 生活页缩略图（150 × 200） */
export function GalleryArtwork({
  kind,
  seed = 0,
  uid,
}: {
  kind: GalleryKind;
  seed?: number;
  uid: string;
}) {
  const accents = GALLERY_ACCENTS[kind];
  // 同种类的 6 张图换着用邻近色，避免看上去是同一张图复制 6 份
  const p: Palette = { ...GALLERY_PALETTE[kind], accent: accents[Math.abs(seed) % accents.length] };
  const props = { p, seed, uid };
  // 奇数张左右镜像一次（生活展示自己已经镜像过了，不重复处理）
  const flip = kind !== 'scene' && seed % 2 === 1;

  return (
    <svg viewBox="0 0 150 200" className="art-svg" aria-hidden="true">
      <g transform={flip ? 'scale(-1 1) translate(-150 0)' : undefined}>
        {kind === 'scene' ? <SceneArt {...props} /> : null}
        {kind === 'game' ? <GameArt {...props} /> : null}
        {kind === 'music' ? <MusicArt {...props} /> : null}
        {kind === 'movie' ? <MovieArt {...props} /> : null}
        {kind === 'gadget' ? <GadgetArt {...props} /> : null}
      </g>
    </svg>
  );
}
