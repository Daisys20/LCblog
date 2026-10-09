import type { ReactNode } from 'react';

import { profile } from '../data/profile';

/** 每个节点的主题色，按 key 取，取不到就用兜底色 */
const NODE_COLORS: Record<string, string> = {
  ai: '#6366f1',
  tech: '#0ea5e9',
  relation: '#ec4899',
  life: '#22c55e',
  travel: '#f59e0b',
  money: '#14b8a6',
};

/** 节点里的白色小符号，24x24 坐标系内绘制 */
const NODE_GLYPHS: Record<string, ReactNode> = {
  ai: <path d="M12 5l1.9 5.1L19 12l-5.1 1.9L12 19l-1.9-5.1L5 12l5.1-1.9z" fill="#fff" />,
  tech: (
    <path
      d="M12 7.6a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8zm0 2.2a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4z"
      fill="#fff"
    />
  ),
  relation: <path d="M12 18.6l-4.3-4.2a3 3 0 0 1 4.3-4.2 3 3 0 0 1 4.3 4.2z" fill="#fff" />,
  life: <path d="M12 5.2c3.6 0 6.4 2.8 6.4 6.4-3.6 0-6.4-2.8-6.4-6.4zM5.6 11.6c0-3.6 2.8-6.4 6.4-6.4 0 3.6-2.8 6.4-6.4 6.4z" fill="#fff" opacity="0.9" />,
  travel: <path d="M5.4 12.6l13-4.6-2.6 10.2-3.3-3.5-3.6 1.9.6-3.3z" fill="#fff" />,
  money: <path d="M12 6.4a5.6 5.6 0 1 0 0 11.2 5.6 5.6 0 0 0 0-11.2zm0 2.4a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4z" fill="#fff" />,
};

const CX = 190;
const CY = 152;
/** 节点所在椭圆的水平 / 垂直半径 */
const RX = 128;
const RY = 106;

/** 我的世界观：中心 ME + 六个方向的关注点，纯 SVG 绘制 */
export default function WorldView() {
  const { worldview } = profile;

  const nodes = worldview.nodes.map((node, i) => {
    const angle = ((-90 + i * 60) * Math.PI) / 180;
    return {
      ...node,
      x: CX + RX * Math.cos(angle),
      y: CY + RY * Math.sin(angle),
      color: NODE_COLORS[node.key] ?? '#6366f1',
    };
  });

  return (
    <section className="bento-card">
      <div className="card-head">
        <h2 className="card-head__title">{worldview.label}</h2>
      </div>

      <svg className="worldview" viewBox="0 0 380 320" role="img" aria-label={worldview.label}>
        <defs>
          <radialGradient id="wv-core" cx="42%" cy="36%" r="72%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="55%" stopColor="#22a5c9" />
            <stop offset="100%" stopColor="#0e7490" />
          </radialGradient>
        </defs>

        {/* 先画连线，随后被圆心与节点圆盖住 */}
        {nodes.map((node) => (
          <line
            key={`line-${node.key}`}
            x1={CX}
            y1={CY}
            x2={node.x}
            y2={node.y}
            className="worldview__link"
          />
        ))}

        {/* 外层虚线轨道，让结构更清楚 */}
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} className="worldview__orbit" />

        {nodes.map((node) => (
          <g key={node.key} className="worldview__node">
            <circle cx={node.x} cy={node.y} r="13" fill={node.color} />
            <g transform={`translate(${node.x - 12} ${node.y - 12})`}>{NODE_GLYPHS[node.key]}</g>
            <text x={node.x} y={node.y + 27} className="worldview__title">
              {node.title}
            </text>
            <text x={node.x} y={node.y + 41} className="worldview__desc">
              {node.desc}
            </text>
          </g>
        ))}

        <circle cx={CX} cy={CY} r="32" fill="url(#wv-core)" />
        <text x={CX} y={CY + 6} className="worldview__center">
          {worldview.center}
        </text>
      </svg>
    </section>
  );
}
