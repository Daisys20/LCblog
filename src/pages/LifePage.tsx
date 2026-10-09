import { useSearchParams } from 'react-router-dom';

import { GalleryArtwork } from '../components/Artwork';
import PageHero from '../components/PageHero';
import { profile } from '../data/profile';

/**
 * 生活页（/life）
 *
 * 「生活展示」和「我的收藏」里的游戏 / 音乐 / 电影 / 物件在这里合成一个页面：
 * 五个标签页共用同一套模板——封面 + 一段引子 + 卡片网格，
 * 只是标签、封面、条目不一样。数据全部来自 profile.gallery.tabs，
 * 加一个标签页只要往那个数组里加一项。
 */
export default function LifePage() {
  const { gallery } = profile;
  const [params, setParams] = useSearchParams();

  const tabKey = params.get('tab') ?? gallery.tabs[0].key;
  const tab = gallery.tabs.find((item) => item.key === tabKey) ?? gallery.tabs[0];
  const total = gallery.tabs.reduce((sum, item) => sum + item.items.length, 0);

  return (
    <div className="page">
      <PageHero title={gallery.title} en={gallery.en} desc={gallery.desc}>
        <p className="page-hero__note">
          {gallery.tabs.length} 个标签 · {total} 条记录
        </p>
      </PageHero>

      {/* 标签栏：点哪个切换哪一组内容，URL 上带 ?tab= 方便直接分享 */}
      <div className="tabs" role="tablist" aria-label="生活页标签">
        {gallery.tabs.map((item) => {
          const active = item.key === tab.key;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              className={active ? 'tabs__item tabs__item--active' : 'tabs__item'}
              onClick={() => setParams({ tab: item.key }, { replace: true })}
            >
              {item.label}
              <span className="tabs__count">{item.items.length}</span>
            </button>
          );
        })}
      </div>

      {/* 具体内容：换标签等于换数据，模板不动（key 让切换时动画重放一次） */}
      <section className="gallery-panel" key={tab.key}>
        <div className="gallery-cover">
          <img className="gallery-cover__img" src={tab.cover} alt="" />
          <span className="gallery-cover__scrim" aria-hidden="true" />
          <div className="gallery-cover__body">
            <p className="gallery-cover__en">{tab.en}</p>
            <h2 className="gallery-cover__title">{tab.label}</h2>
            {tab.intro ? <p className="gallery-cover__intro">{tab.intro}</p> : null}
            <p className="gallery-cover__meta">
              {tab.items.length} 条记录 · {tab.desc}
            </p>
          </div>
        </div>

        <ul className="gallery-grid">
          {tab.items.map((item, index) => (
            <li className="gallery-card" key={item.title}>
              <span className="gallery-card__thumb">
                {item.image ? (
                  <img src={item.image} alt="" loading="lazy" />
                ) : (
                  <GalleryArtwork
                    kind={item.art ?? tab.key}
                    seed={index + 1}
                    uid={`life-${tab.key}-${index}`}
                  />
                )}
              </span>
              <span className="gallery-card__title">{item.title}</span>
              <span className="gallery-card__desc">{item.desc}</span>
              {item.meta ? <span className="gallery-card__meta">{item.meta}</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
