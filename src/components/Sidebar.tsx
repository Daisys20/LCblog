import { Link } from 'react-router-dom';

import type { BlogCategory, BlogTag } from '../types/blog';

interface SidebarProps {
  categories: BlogCategory[];
  tags: BlogTag[];
}

export default function Sidebar({ categories, tags }: SidebarProps) {
  return (
    <aside>
      <section className="card sidebar-card">
        <h3 className="sidebar-card__title">文章分类</h3>
        <div className="chip-list">
          {categories.length === 0 ? (
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>暂无分类</span>
          ) : (
            categories.map((category) => (
              <Link
                key={category.id}
                to={`/blog?categoryId=${category.id}`}
                className="chip"
              >
                {category.name}
                <span className="chip__count">{category.postCount ?? 0}</span>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="card sidebar-card">
        <h3 className="sidebar-card__title">热门标签</h3>
        <div className="chip-list">
          {tags.length === 0 ? (
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>暂无标签</span>
          ) : (
            tags.map((tag) => (
              <Link key={tag.name} to={`/blog?tag=${encodeURIComponent(tag.name)}`} className="chip">
                #{tag.name}
                <span className="chip__count">{tag.count}</span>
              </Link>
            ))
          )}
        </div>
      </section>
    </aside>
  );
}
