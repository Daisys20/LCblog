import type { ReactNode } from 'react';

/**
 * 子页面的统一页头：英文小标 + 中文标题 + 一句话说明，
 * 右侧可以塞统计数字之类的内容（见 .page-hero__side）。
 */
export default function PageHero({
  title,
  en,
  desc,
  children,
}: {
  title: string;
  en?: string;
  desc?: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-hero">
      <div className="page-hero__main">
        {en ? <p className="page-hero__en">{en}</p> : null}
        <h1 className="page-hero__title">{title}</h1>
        {desc ? <p className="page-hero__desc">{desc}</p> : null}
      </div>
      {children ? <div className="page-hero__side">{children}</div> : null}
    </header>
  );
}
