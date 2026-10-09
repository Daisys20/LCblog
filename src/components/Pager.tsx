interface PagerProps {
  pageNo: number;
  pageSize: number;
  total: number;
  onChange: (pageNo: number) => void;
}

export default function Pager({ pageNo, pageSize, total, onChange }: PagerProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) {
    return null;
  }
  return (
    <div className="pager">
      <button
        type="button"
        className="pager__btn"
        disabled={pageNo <= 1}
        onClick={() => onChange(pageNo - 1)}
      >
        上一页
      </button>
      <span className="pager__info">
        第 {pageNo} / {totalPages} 页 · 共 {total} 篇
      </span>
      <button
        type="button"
        className="pager__btn"
        disabled={pageNo >= totalPages}
        onClick={() => onChange(pageNo + 1)}
      >
        下一页
      </button>
    </div>
  );
}
