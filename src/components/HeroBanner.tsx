import { formatToday, profile } from '../data/profile';

/** 地点 / 日历 / 天气三个小图标（24 坐标系） */
const META_ICONS = {
  pin: (
    <path
      d="M12 21.2s6.4-5.6 6.4-10.4a6.4 6.4 0 1 0-12.8 0c0 4.8 6.4 10.4 6.4 10.4z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  calendar: (
    <>
      <rect x="4" y="5.6" width="16" height="14.4" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 9.8h16M8.4 3.6v3.6M15.6 3.6v3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  weather: (
    <>
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3.4v2.4M12 18.2v2.4M3.4 12h2.4M18.2 12h2.4M6 6l1.7 1.7M16.3 16.3L18 18M18 6l-1.7 1.7M7.7 16.3L6 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>
  ),
};

/**
 * 顶部横幅：山河照做底图，不再单独排一行标题
 *  - 左侧留白：图里自带的手写短句
 *  - 右侧中部：一块虚化蒙版，把「名字 + 身份 + 一句话介绍」和
 *    「城市 / 日期 / 天气 + 当前状态」收在一起
 *  蒙版里的字号、内边距全部用容器宽度百分比（cqw）表达，
 *  卡片变宽变窄时整块文字跟着等比缩放，与底图始终对得上。
 */
export default function HeroBanner() {
  const { hero, status } = profile;

  return (
    <section className="bento-card bento-card--banner">
      <img className="banner__img" src={hero.image} alt="" />

      <div className="banner__mask">
        <p className="banner__sign">
          <span className="banner__name">{hero.name}</span>
          <span className="banner__role">{hero.role}</span>
          <span className="banner__desc">{hero.desc}</span>
        </p>

        <span className="banner__rule" aria-hidden="true" />

        <p className="banner__meta">
          <span className="banner__meta-item">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {META_ICONS.pin}
            </svg>
            {hero.location}
          </span>
          <span className="banner__meta-item">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {META_ICONS.calendar}
            </svg>
            {formatToday()}
          </span>
          <span className="banner__meta-item">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {META_ICONS.weather}
            </svg>
            {hero.weather}
          </span>
        </p>

        <p className="banner__status-note">
          {status.todayNote}
          <span className="banner__status-dim">{status.note}</span>
        </p>
      </div>
    </section>
  );
}
