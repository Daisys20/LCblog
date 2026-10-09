import { Link } from 'react-router-dom';

import { profile, sortJourneyGroups } from '../data/profile';

/** 人生日志：按年份分组的时间线
 *  （列4 的吸收卡：列里多出来的高度平摊到各年份分组之间）
 *  年份、月份统一倒序，排序逻辑在 data/profile.ts 里，首页与日志页共用。 */
export function JourneyTimeline() {
  const { journey } = profile;
  const groups = sortJourneyGroups(journey.groups);

  return (
    <section className="bento-card bento-card--journey bento-card--grow">
      <div className="card-head">
        <h2 className="card-head__title">{journey.label}</h2>
        <Link className="card-head__more" to="/journey">
          更多 →
        </Link>
      </div>
      <ul className="journey">
        {groups.map((group) => (
          <li className="journey__group" key={group.year}>
            <span className="journey__year">{group.year}</span>
            <ul className="journey__list">
              {group.items.map((item) => (
                <li className="journey__item" key={`${group.year}-${item.date}-${item.text}`}>
                  <span className="journey__date">{item.date}</span>
                  <span className="journey__text">{item.text}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 名言卡：整张底图 + 压在上面的文字（随列高伸缩） */
export function QuoteCard() {
  const { quote } = profile;
  return (
    <section className="bento-card bento-card--media bento-card--quote">
      <img className="media__img" src={quote.image} alt="" loading="lazy" />
      <span className="media__scrim" aria-hidden="true" />
      <div className="quote__body">
        <p className="quote__text">“{quote.text}”</p>
        <p className="quote__author">— {quote.author}</p>
      </div>
    </section>
  );
}

/** 保持前行：新底图（手写 "Keep going." 已烤在图上）+ 浮在图上的一段正文
 *  文字位置 / 字号都按卡片宽度的百分比走，所以卡片放大缩小时文字跟着缩放，
 *  在四列、两列、单列三种布局下都与底图对得上。 */
export function KeepGoingCard() {
  const { keepGoing } = profile;
  return (
    <section className="bento-card bento-card--media bento-card--keep">
      <img className="keep__img" src={keepGoing.image} alt="Keep going." loading="lazy" />

      <div className="keep__body">
        {keepGoing.paragraphs.map((lines, pi) => (
          <p className="keep__para" key={pi}>
            {lines.map((line) => (
              <span className="keep__line" key={line}>
                {line}
              </span>
            ))}
          </p>
        ))}
      </div>
    </section>
  );
}
