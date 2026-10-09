import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { getCategoryList, getPostPage, getTagList } from '../api/blog';
import Pager from '../components/Pager';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import { EmptyState, ErrorState, Loading } from '../components/StateViews';
import { useAsync } from '../hooks/useAsync';
import { useMagnetic } from '../hooks/useMagnetic';

const PAGE_SIZE = 8;

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNo = Number(searchParams.get('page') ?? '1') || 1;
  const keywordParam = searchParams.get('keyword') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const tag = searchParams.get('tag') ?? '';

  const [keywordInput, setKeywordInput] = useState(keywordParam);

  const postsState = useAsync(
    (signal) =>
      getPostPage(
        {
          pageNo,
          pageSize: PAGE_SIZE,
          keyword: keywordParam || undefined,
          categoryId: categoryId ? Number(categoryId) : undefined,
          tag: tag || undefined,
        },
        signal,
      ),
    [pageNo, keywordParam, categoryId, tag],
  );

  const categoriesState = useAsync((signal) => getCategoryList(signal), []);
  const tagsState = useAsync((signal) => getTagList(signal), []);
  const listRef = useMagnetic<HTMLDivElement>({
    selector: '.post-card',
    strength: 7,
    tilt: 2,
    reach: 90,
  });

  const activeCategory = useMemo(
    () => categoriesState.data?.find((item) => String(item.id) === categoryId),
    [categoriesState.data, categoryId],
  );

  function updateParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    // 任何筛选变化都回到第一页
    if (!('page' in patch)) {
      next.delete('page');
    }
    setSearchParams(next);
  }

  return (
    <div className="layout-two-col">
      <div>
        <form
          className="search-bar"
          onSubmit={(event) => {
            event.preventDefault();
            updateParams({ keyword: keywordInput || undefined });
          }}
        >
          <input
            className="search-bar__input"
            value={keywordInput}
            placeholder="搜索文章标题…"
            onChange={(event) => setKeywordInput(event.target.value)}
          />
          <button type="submit" className="search-bar__btn">
            搜索
          </button>
        </form>

        {keywordParam || activeCategory || tag ? (
          <div className="filter-bar">
            <span>当前筛选：</span>
            {keywordParam ? <span className="chip chip--active">关键字「{keywordParam}」</span> : null}
            {activeCategory ? (
              <span className="chip chip--active">分类「{activeCategory.name}」</span>
            ) : null}
            {tag ? <span className="chip chip--active">标签「{tag}」</span> : null}
            <Link to="/blog" className="chip">
              清除
            </Link>
          </div>
        ) : null}

        {postsState.loading ? <Loading /> : null}
        {!postsState.loading && postsState.error ? (
          <ErrorState message={postsState.error} onRetry={postsState.reload} />
        ) : null}
        {!postsState.loading && !postsState.error && postsState.data?.list.length === 0 ? (
          <EmptyState text="还没有符合条件的文章" />
        ) : null}

        {!postsState.loading && !postsState.error && postsState.data ? (
          <>
            <div className="post-list" ref={listRef}>
              {postsState.data.list.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Pager
              pageNo={pageNo}
              pageSize={PAGE_SIZE}
              total={postsState.data.total}
              onChange={(nextPage) => updateParams({ page: String(nextPage) })}
            />
          </>
        ) : null}
      </div>

      <Sidebar categories={categoriesState.data ?? []} tags={tagsState.data ?? []} />
    </div>
  );
}
