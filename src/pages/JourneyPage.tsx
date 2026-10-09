import PageHero from '../components/PageHero';
import { dayOf, monthOf, profile, sortJourneyGroups } from '../data/profile';

/**
 * 人生日志页（/journey）
 *
 * 首页那张卡片是压缩版，这里是把日志铺开：
 * 年份、月份统一倒序（新的在上面），左边是大号月份，右边是当天记的事。
 */
export default function JourneyPage() {
  const { journey } = profile;
  const groups = sortJourneyGroups(journey.groups);

  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const firstYear = groups.length ? groups[groups.length - 1].year : null;
  const lastYear = groups.length ? groups[0].year : null;

  return (
    <div className="page">
      <PageHero title={journey.title} en={journey.en} desc={journey.desc}>
        <ul className="page-stats">
          <li>
            <strong>{total}</strong>
            <span>条记录</span>
          </li>
          <li>
            <strong>{groups.length}</strong>
            <span>个年份</span>
          </li>
          <li>
            <strong>{firstYear === lastYear ? lastYear : `${firstYear}—${lastYear}`}</strong>
            <span>时间跨度</span>
          </li>
        </ul>
      </PageHero>

      <div className="jlog">
        {groups.map((group) => (
          <section className="jlog__year" key={group.year}>
            <header className="jlog__year-head">
              <span className="jlog__year-num">{group.year}</span>
              <span className="jlog__year-line" aria-hidden="true" />
              <span className="jlog__year-count">{group.items.length} 条</span>
            </header>

            <ul className="jlog__list">
              {group.items.map((item) => (
                <li className="jlog__item" key={`${group.year}-${item.date}-${item.text}`}>
                  <span className="jlog__date">
                    <span className="jlog__month">{monthOf(item.date)}</span>
                    <span className="jlog__day">{dayOf(item.date)}</span>
                  </span>
                  <span className="jlog__text">{item.text}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
