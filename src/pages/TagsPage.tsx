import { Link } from 'react-router-dom';

import { getTagList } from '../api/blog';
import { EmptyState, ErrorState, Loading } from '../components/StateViews';
import { useAsync } from '../hooks/useAsync';

export default function TagsPage() {
  const state = useAsync((signal) => getTagList(signal), []);

  return (
    <div>
      <h1 className="page-title">标签云</h1>
      {state.loading ? <Loading /> : null}
      {!state.loading && state.error ? (
        <ErrorState message={state.error} onRetry={state.reload} />
      ) : null}
      {!state.loading && !state.error && state.data?.length === 0 ? <EmptyState text="暂无标签" /> : null}

      {state.data ? (
        <section className="card sidebar-card">
          <div className="chip-list">
            {state.data.map((tag) => (
              <Link
                key={tag.name}
                to={`/?tag=${encodeURIComponent(tag.name)}`}
                className="chip"
                style={{ fontSize: `${Math.min(20, 13 + tag.count * 2)}px` }}
              >
                #{tag.name}
                <span className="chip__count">{tag.count}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
