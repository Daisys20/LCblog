import { Link } from 'react-router-dom';
import type { BlogPostSummary } from '../types/blog';

export function formatDate(timestamp?: number): string {
  if (!timestamp) {
    return '未发布';
  }
  const date = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function PostCard({ post }: { post: BlogPostSummary }) {
  return (
    <article className="card post-card">
      <h2 className="post-card__title">
        <Link to={`/post/${post.slug}`}>{post.title}</Link>
      </h2>
      <div className="post-card__meta">
        <span>{formatDate(post.publishedAt)}</span>
        {post.categoryName ? <span>· {post.categoryName}</span> : null}
        <span>· 约 {post.readingTime} 分钟</span>
        <span>· {post.viewCount} 次阅读</span>
      </div>
      {post.summary ? <p className="post-card__summary">{post.summary}</p> : null}
      {post.tags.length > 0 ? (
        <div className="chip-list" style={{ marginTop: 12 }}>
          {post.tags.map((tag) => (
            <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`} className="chip">
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
