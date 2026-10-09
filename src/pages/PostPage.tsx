import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getPostBySlug } from '../api/blog';
import { formatDate } from '../components/PostCard';
import { ErrorState, Loading } from '../components/StateViews';
import { useAsync } from '../hooks/useAsync';

export default function PostPage() {
  const { slug = '' } = useParams();
  const state = useAsync((signal) => getPostBySlug(slug, signal), [slug]);

  // Markdown 渲染后再做一次 HTML 消毒，避免文章内容里夹带脚本
  const html = useMemo(() => {
    if (!state.data?.contentMd) {
      return '';
    }
    const raw = marked.parse(state.data.contentMd, { async: false }) as string;
    return DOMPurify.sanitize(raw);
  }, [state.data?.contentMd]);

  if (state.loading) {
    return <Loading text="正在加载文章…" />;
  }

  if (state.error) {
    return <ErrorState message={state.error} onRetry={state.reload} />;
  }

  const post = state.data;
  if (!post) {
    return <ErrorState message="文章不存在" />;
  }

  return (
    <article className="card article">
      <Link to="/" className="back-link">
        ← 返回文章列表
      </Link>
      <h1 className="article__title">{post.title}</h1>
      <div className="article__meta">
        <span>发布于 {formatDate(post.publishedAt)}</span>
        {post.categoryName ? <span>分类：{post.categoryName}</span> : null}
        <span>约 {post.readingTime} 分钟</span>
        <span>{post.viewCount} 次阅读</span>
      </div>
      {post.tags.length > 0 ? (
        <div className="chip-list" style={{ marginBottom: 18 }}>
          {post.tags.map((tag) => (
            <Link key={tag} to={`/?tag=${encodeURIComponent(tag)}`} className="chip">
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
