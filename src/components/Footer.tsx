import { Link } from 'react-router-dom';

const SITE_TITLE = import.meta.env.VITE_SITE_TITLE ?? '我的个人博客';

const LINKS = [
  { to: '/', label: '首页' },
  { to: '/blog', label: '博客' },
  { to: '/archive', label: '归档' },
  { to: '/tags', label: '标签' },
  { to: '/about', label: '关于' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span className="site-footer__copy">
          © {new Date().getFullYear()} {SITE_TITLE} · Powered by ruoyi-vue-pro
        </span>

        <nav className="site-footer__links">
          {LINKS.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
