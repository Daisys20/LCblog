import { Link } from 'react-router-dom';

import { getPostPage } from '../api/blog';
import { profile } from '../data/profile';
import { useAsync } from '../hooks/useAsync';

function formatShortDate(timestamp?: number) {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.4l1.7 5.4 5.4 1.7-5.4 1.7L12 17.6l-1.7-5.4L4.9 10.5l5.4-1.7z" fill="currentColor" />
    </svg>
  );
}

/** 最近在想什么：内容直接取自后端已发布的文章 */
export default function ThoughtsCard() {
  const { thoughts } = profile;
  const state = useAsync((signal) => getPostPage({ pageNo: 1, pageSize: 5 }, signal), []);
  const posts = state.data?.list ?? [];

  return (
    <section className="bento-card bento-card--thoughts bento-card--grow">
      <div className="card-head">
        <div className="card-head__main">
          <h2 className="card-head__title">{thoughts.label}</h2>
          <span className="card-head__badge">{thoughts.badge}</span>
        </div>
        <Link to="/blog" className="card-head__more">
          {thoughts.moreText}
        </Link>
      </div>

      {state.loading ? <p className="thoughts__hint">加载中…</p> : null}
      {!state.loading && state.error ? (
        <p className="thoughts__hint thoughts__hint--error">{state.error}</p>
      ) : null}
      {!state.loading && !state.error && posts.length === 0 ? (
        <p className="thoughts__hint">还没有发布的文章</p>
      ) : null}

      <ul className="thoughts">
        {posts.map((post) => (
          <li className="thoughts__item" key={post.id}>
            <span className="thoughts__icon">
              <SparkIcon />
            </span>
            <Link to={`/post/${post.slug}`} className="thoughts__link">
              {post.title}
            </Link>
            <span className="thoughts__date">{formatShortDate(post.publishedAt)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
