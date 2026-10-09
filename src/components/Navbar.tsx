import type { FormEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useTheme } from '../hooks/useTheme';

const SITE_TITLE = import.meta.env.VITE_SITE_TITLE ?? '我的个人博客';
const SITE_TAGLINE = import.meta.env.VITE_SITE_TAGLINE ?? '记录 · 观察 · 思考';

interface NavItem {
  to: string;
  label: string;
  end: boolean;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '首页', end: true, icon: 'home' },
  { to: '/blog', label: '博客', end: false, icon: 'doc' },
  { to: '/life', label: '生活', end: false, icon: 'life' },
  { to: '/projects', label: '项目', end: false, icon: 'layers' },
  { to: '/journey', label: '日志', end: false, icon: 'route' },
  { to: '/archive', label: '归档', end: false, icon: 'archive' },
  { to: '/tags', label: '标签', end: false, icon: 'tag' },
  { to: '/about', label: '关于', end: false, icon: 'user' },
];

/** 导航项的小图标，统一 15px 描边风格 */
const NAV_GLYPHS: Record<string, ReactNode> = {
  home: (
    <path d="M4.2 10.4 12 4.2l7.8 6.2v8.4a1.4 1.4 0 0 1-1.4 1.4h-3.3v-5.7H8.9v5.7H5.6a1.4 1.4 0 0 1-1.4-1.4z" />
  ),
  doc: (
    <>
      <path d="M6.4 3.8h6.8L17.6 8.2v12a1.4 1.4 0 0 1-1.4 1.4H6.4A1.4 1.4 0 0 1 5 20.2V5.2a1.4 1.4 0 0 1 1.4-1.4z" />
      <path d="M13 3.9v4.4h4.4M8.4 13h7M8.4 16.4h4.6" />
    </>
  ),
  archive: (
    <>
      <path d="M3.8 7.6h16.4v2.9a1.3 1.3 0 0 1-1.3 1.3H5.1a1.3 1.3 0 0 1-1.3-1.3z" />
      <path d="M5.4 11.8v7.4a1.4 1.4 0 0 0 1.4 1.4h6.3M18.6 11.8v3.1" />
      <path d="M17.4 17.6v3.6M15.6 19.4h3.6" />
    </>
  ),
  life: (
    <>
      <path d="M20 4.2c.3 8.2-4.6 12.6-12.3 12.6H5.1C4.9 8.6 10.5 4.2 20 4.2z" />
      <path d="M4.4 20.2c1.3-4.2 3.5-7.3 6.4-9.7" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3.6 3.6 8l8.4 4.4L20.4 8z" />
      <path d="M3.6 12.2 12 16.6l8.4-4.4M3.6 16.2 12 20.6l8.4-4.4" />
    </>
  ),
  route: (
    <>
      <circle cx="6.4" cy="6.4" r="2.5" />
      <circle cx="17.6" cy="17.6" r="2.5" />
      <path d="M6.4 8.9v4a3.4 3.4 0 0 0 3.4 3.4h4.9" />
    </>
  ),
  tag: (
    <>
      <path d="M11.9 3.8H18a1.4 1.4 0 0 1 1.4 1.4v6.1a1.4 1.4 0 0 1-.4 1l-7.4 7.4a1.4 1.4 0 0 1-2 0L3.9 14a1.4 1.4 0 0 1 0-2l7.4-7.8a1.4 1.4 0 0 1 .6-.4z" />
      <circle cx="15.6" cy="8.2" r="1.25" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.2" r="3.7" />
      <path d="M4.9 20.2c.5-3.7 3.5-5.8 7.1-5.8s6.6 2.1 7.1 5.8" />
    </>
  ),
};

function NavIcon({ name }: { name: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {NAV_GLYPHS[name]}
    </svg>
  );
}

/** 站点标识：蓝色星球 + 一圈轨道，呼应「观测站」的意象 */
function PlanetIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="site-logo-planet" x1="0.25" y1="0.12" x2="0.82" y2="0.92">
          <stop offset="0%" stopColor="#93ccf8" />
          <stop offset="52%" stopColor="#4f9df0" />
          <stop offset="100%" stopColor="#2c66d2" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="8.9" fill="url(#site-logo-planet)" />
      <circle cx="12.4" cy="12.6" r="2.5" fill="#ffffff" opacity="0.28" />
      <ellipse
        className="site-logo__ring"
        cx="16"
        cy="16"
        rx="13.6"
        ry="4.9"
        transform="rotate(-24 16 16)"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.6v2.5M12 18.9v2.5M2.6 12h2.5M18.9 12h2.5M5.4 5.4l1.8 1.8M16.8 16.8l1.8 1.8M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.5 8.5 0 1 0 10.4 10.4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [keyword, setKeyword] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd + K 聚焦搜索框
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function submitSearch() {
    const value = keyword.trim();
    navigate(value ? `/blog?keyword=${encodeURIComponent(value)}` : '/blog');
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    submitSearch();
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="site-logo" aria-label={`${SITE_TITLE} 首页`}>
          <span className="site-logo__mark">
            <PlanetIcon />
          </span>
          <span className="site-logo__text">
            <span className="site-logo__title">{SITE_TITLE}</span>
            <span className="site-logo__sub">{SITE_TAGLINE}</span>
          </span>
        </NavLink>

        <nav className="site-nav" aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                isActive ? 'site-nav__link site-nav__link--active' : 'site-nav__link'
              }
            >
              <NavIcon name={item.icon} />
              <span className="site-nav__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="header-tools">
          <form className="header-search" onSubmit={handleSearch} role="search">
            <span className="header-search__icon">
              <SearchIcon />
            </span>
            <input
              ref={searchRef}
              className="header-search__input"
              value={keyword}
              placeholder="搜索文章、标签、关键词…"
              aria-label="搜索文章"
              onChange={(event) => setKeyword(event.target.value)}
            />
          </form>

          <button type="button" className="icon-btn" onClick={submitSearch} title="搜索" aria-label="搜索">
            <SearchIcon />
          </button>
          <button
            type="button"
            className={theme === 'light' ? 'icon-btn icon-btn--on' : 'icon-btn'}
            onClick={() => setTheme('light')}
            title="切换到亮色主题"
            aria-label="切换到亮色主题"
            aria-pressed={theme === 'light'}
          >
            <SunIcon />
          </button>
          <button
            type="button"
            className={theme === 'dark' ? 'icon-btn icon-btn--on' : 'icon-btn'}
            onClick={() => setTheme('dark')}
            title="切换到暗色主题"
            aria-label="切换到暗色主题"
            aria-pressed={theme === 'dark'}
          >
            <MoonIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
