export function Loading({ text = '加载中…' }: { text?: string }) {
  return (
    <div className="state-box">
      <div className="spinner" />
      {text}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-box state-box--error">
      <div>{message}</div>
      {onRetry ? (
        <button type="button" className="retry-btn" onClick={onRetry}>
          重试
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ text = '暂无内容' }: { text?: string }) {
  return <div className="state-box">{text}</div>;
}
