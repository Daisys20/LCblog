import { Link } from 'react-router-dom';

import { getArchiveList } from '../api/blog';
import { formatDate } from '../components/PostCard';
import { EmptyState, ErrorState, Loading } from '../components/StateViews';
import { useAsync } from '../hooks/useAsync';

export default function ArchivePage() {
  const state = useAsync((signal) => getArchiveList(signal), []);

  return (
    <div>
      <h1 className="page-title">文章归档</h1>
      {state.loading ? <Loading /> : null}
      {!state.loading && state.error ? (
        <ErrorState message={state.error} onRetry={state.reload} />
      ) : null}
      {!state.loading && !state.error && state.data?.length === 0 ? (
        <EmptyState text="还没有已发布的文章" />
      ) : null}

      {state.data?.map((group) => (
        <section key={`${group.year}-${group.month}`} className="card archive-group">
          <h2 className="archive-group__title">
            {group.year} 年 {group.month} 月 · {group.count} 篇
          </h2>
          {group.posts.map((post) => (
            <div key={post.id} className="archive-group__item">
              <Link to={`/post/${post.slug}`}>{post.title}</Link>
              <span className="archive-group__date">{formatDate(post.publishedAt)}</span>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
