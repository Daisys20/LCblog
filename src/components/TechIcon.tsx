import type { ReactNode } from 'react';

/**
 * 自绘的技术栈图标，全部为内联 SVG，不依赖任何外部图片或图标库。
 * 新增图标：在 ICONS 里加一条，并在 data/profile.ts 的 skills 中引用 key。
 */

const FONT = 'ui-sans-serif, system-ui, -apple-system, sans-serif';

const ICONS: Record<string, ReactNode> = {
  nextjs: (
    <>
      <circle cx="12" cy="12" r="10" fill="#0a0a0a" />
      <path d="M9 17V7l6.4 8.6" stroke="#fff" strokeWidth="1.5" fill="none" />
      <path d="M15.4 7v9.2" stroke="#fff" strokeWidth="1.5" />
    </>
  ),
  react: (
    <>
      <g stroke="#61dafb" strokeWidth="0.9" fill="none">
        <ellipse cx="12" cy="12" rx="9.6" ry="3.8" />
        <ellipse cx="12" cy="12" rx="9.6" ry="3.8" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9.6" ry="3.8" transform="rotate(120 12 12)" />
      </g>
      <circle cx="12" cy="12" r="1.9" fill="#61dafb" />
    </>
  ),
  vue: (
    <>
      <path d="M2 4h4.2L12 14.4 17.8 4H22L12 21.5z" fill="#41b883" />
      <path d="M6.2 4h2.6L12 8.9 15.2 4h2.6L12 14.4z" fill="#35495e" />
    </>
  ),
  typescript: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#3178c6" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="9"
        fontWeight="700"
        fill="#fff"
      >
        TS
      </text>
    </>
  ),
  nodejs: (
    <>
      <path d="M12 1.8l8.8 5.1v10.2L12 22.2 3.2 17.1V6.9z" fill="#539e43" />
      <text
        x="12"
        y="15"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="7.5"
        fontWeight="700"
        fill="#fff"
      >
        JS
      </text>
    </>
  ),
  spring: (
    <>
      <path
        d="M20.5 3.2C10.9 3.2 5.2 7.4 5.2 13.6c0 2.6 1 4.4 1.7 5.6.3-3.7 2.6-6.6 7.1-9.2-3.3 2.6-5.6 5.7-5.9 9.7 0 0 .9.6 3 .6 6.2 0 9.4-6 9.4-17.1z"
        fill="#6db33f"
      />
    </>
  ),
  java: (
    <>
      <path d="M4.5 10.5h12v4.2a5.2 5.2 0 0 1-5.2 5.2H9.7a5.2 5.2 0 0 1-5.2-5.2z" fill="#e76f00" />
      <path d="M16.5 11.6h1.6a2.4 2.4 0 0 1 0 4.8h-1.6" stroke="#e76f00" strokeWidth="1.5" fill="none" />
      <path
        d="M8.6 3c0 1.6 1.1 1.6 1.1 3.2M12.6 3c0 1.6 1.1 1.6 1.1 3.2"
        stroke="#5382a1"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  mysql: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#00758f" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="7"
        fontWeight="700"
        fill="#fff"
      >
        SQL
      </text>
    </>
  ),
  redis: (
    <>
      <path d="M12 2.6l9.2 4.1L12 10.8 2.8 6.7z" fill="#dc382d" />
      <path d="M12 11l9.2-4.1v3.9L12 15z" fill="#dc382d" opacity="0.78" />
      <path d="M12 15.3l9.2-4.1v3.8L12 19.4l-9.2-4.4v-3.8z" fill="#dc382d" opacity="0.55" />
      <path d="M4 20.6h16" stroke="#dc382d" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
    </>
  ),
  docker: (
    <>
      <g fill="#2496ed">
        <rect x="3.4" y="10.4" width="3" height="3" rx="0.5" />
        <rect x="7.2" y="10.4" width="3" height="3" rx="0.5" />
        <rect x="11" y="10.4" width="3" height="3" rx="0.5" />
        <rect x="7.2" y="6.9" width="3" height="3" rx="0.5" />
        <rect x="11" y="6.9" width="3" height="3" rx="0.5" />
        <rect x="11" y="3.4" width="3" height="3" rx="0.5" />
        <path d="M1.4 15.4c1.8 3.5 5.6 5.6 10 5.6 5.4 0 9.2-2.2 10.6-6.4-1.9.6-4 .1-5.1-.9-1.1 1.6-3.1 2.2-4.9 1.6-1.7-.6-3.9-.6-5.6-1.6-1 .6-3 1.2-5 1.7z" />
      </g>
    </>
  ),
  nginx: (
    <>
      <path
        d="M12 2.4l8.2 4.7v9.8L12 21.6 3.8 16.9V7.1z"
        fill="none"
        stroke="#009639"
        strokeWidth="1.6"
      />
      <text
        x="12"
        y="15.6"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="8.5"
        fontWeight="700"
        fill="#009639"
      >
        N
      </text>
    </>
  ),
  git: (
    <>
      <g fill="#f05032">
        <circle cx="7" cy="5" r="2.6" />
        <circle cx="7" cy="19" r="2.6" />
        <circle cx="17.5" cy="9" r="2.6" />
      </g>
      <path
        d="M7 7.6v8.8M7 13.6c0-3.1 3.2-4.6 7.6-4.6"
        stroke="#f05032"
        strokeWidth="1.7"
        fill="none"
      />
    </>
  ),
  python: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#3776ab" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="7.5"
        fontWeight="700"
        fill="#ffd43b"
      >
        PY
      </text>
    </>
  ),
  vite: (
    <>
      <path d="M12 2.4l9.4 16.2L12 21.8 2.6 18.6z" fill="#646cff" />
      <path d="M12 6.6l1.9 4.6h-2.3l1.7 3.3-4.6-3.8h2.5z" fill="#ffd028" />
    </>
  ),
  tailwind: (
    <>
      <path
        d="M2.4 8.2c.4-2.4 2.4-4 5-4 3.1 0 3.9 2.6 6.2 2.6 1.6 0 2.6-.8 3.2-1.8M2.4 15.4c.4-2.4 2.4-4 5-4 3.1 0 3.9 2.6 6.2 2.6 1.6 0 2.6-.8 3.2-1.8"
        stroke="#38bdf8"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  mongodb: (
    <>
      <path d="M12 2c3.1 4 5.2 7.3 5.2 11.1 0 3.2-2.1 6.2-5.2 9-3.1-2.8-5.2-5.8-5.2-9C6.8 9.3 8.9 6 12 2z" fill="#47a248" />
      <path d="M12 2v20" stroke="#fff" strokeWidth="0.9" opacity="0.65" />
    </>
  ),
  npm: (
    <>
      <rect x="1.5" y="7" width="21" height="10" rx="2.5" fill="#cb3837" />
      <text
        x="12"
        y="14.6"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="6.4"
        fontWeight="700"
        fill="#fff"
      >
        npm
      </text>
    </>
  ),
  kubernetes: (
    <>
      <path
        d="M12 2.2l8.4 4.1 2 9-5.8 7.1H7.4L1.6 15.3l2-9z"
        fill="#326ce5"
      />
      <circle cx="12" cy="12" r="3.1" fill="#fff" />
      <g stroke="#fff" strokeWidth="1.3" strokeLinecap="round">
        <path d="M12 4.6v3.4M12 16v3.4M6.2 7.9l2.6 1.9M15.2 14.2l2.6 1.9M6.2 16.1l2.6-1.9M15.2 9.8l2.6-1.9" />
      </g>
    </>
  ),
  threejs: (
    <>
      <path d="M12 2.6l8.6 17H3.4z" fill="#049ef4" opacity="0.16" />
      <path d="M12 2.6l8.6 17H3.4z" fill="none" stroke="#049ef4" strokeWidth="1.5" />
      <path d="M12 2.6v17M7.7 19.6L12 11l4.3 8.6" stroke="#049ef4" strokeWidth="0.9" opacity="0.45" fill="none" />
    </>
  ),
  javascript: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#f7df1e" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="10"
        fontWeight="700"
        fill="#16181d"
      >
        JS
      </text>
    </>
  ),
  /* 企鹅主体用 currentColor，跟随主题深浅 */
  linux: (
    <>
      <ellipse cx="12" cy="14.4" rx="7" ry="8.4" fill="currentColor" />
      <circle cx="12" cy="6.6" r="4.6" fill="currentColor" />
      <ellipse cx="12" cy="15.6" rx="4.2" ry="6" fill="#fff" />
      <circle cx="10.2" cy="5.9" r="1" fill="#fff" />
      <circle cx="13.8" cy="5.9" r="1" fill="#fff" />
      <circle cx="10.2" cy="5.9" r="0.42" fill="#16181d" />
      <circle cx="13.8" cy="5.9" r="0.42" fill="#16181d" />
      <path d="M12 7.4l1.7 1.7h-3.4z" fill="#f5a623" />
      <ellipse cx="12" cy="20.2" rx="3" ry="1.7" fill="#f5a623" />
    </>
  ),
  figma: (
    <g transform="translate(-1.5 0)">
      <path d="M12 3H9a3 3 0 0 0 0 6h3z" fill="#f24e1e" />
      <path d="M12 3h3a3 3 0 0 1 0 6h-3z" fill="#ff7262" />
      <path d="M12 9H9a3 3 0 0 0 0 6h3z" fill="#a259ff" />
      <circle cx="15" cy="12" r="3" fill="#1abcfe" />
      <path d="M12 15H9a3 3 0 1 0 3 3z" fill="#0acf83" />
    </g>
  ),
};

interface TechIconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function TechIcon({ name, size = 24, className }: TechIconProps) {
  const content = ICONS[name] ?? ICONS.java;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {content}
    </svg>
  );
}
