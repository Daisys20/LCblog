import { useEffect, useState } from 'react';

/** 超过这个滚动距离才把按钮浮出来，避免首屏就杵在右下角 */
const SHOW_AFTER = 320;

/**
 * 回到顶部：全站唯一的悬浮按钮，固定在窗口右下角。
 *
 * 合并了两处重复入口：
 *  - 页脚原来那颗圆形箭头（.site-footer__top）
 *  - Keep going 卡右下角那个装饰性箭头（.keep__btn）
 * 现在只有一个按钮，出现在所有页面上。
 */
export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={visible ? 'to-top to-top--on' : 'to-top'}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="回到顶部"
      aria-label="回到顶部"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 19V5.6M6.4 11.2L12 5.6l5.6 5.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
