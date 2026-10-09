import { Link } from 'react-router-dom';

import type { GalleryItem } from '../data/profile';
import { collectTabs, lifeTab, profile } from '../data/profile';
import { GalleryArtwork, ProjectArtwork } from './Artwork';

/** 「更多 →」：现在都指向对应的子页面（生活 / 项目 / 日志） */
function MoreLink({ to, text = '更多 →' }: { to: string; text?: string }) {
  return (
    <Link className="card-head__more" to={to}>
      {text}
    </Link>
  );
}

/** 一张展示卡的封面：有实拍图用图，没有就用 SVG 画一张 */
function Thumb({ item, uid }: { item: GalleryItem; uid: string }) {
  if (item.image) return <img src={item.image} alt="" loading="lazy" />;
  return <GalleryArtwork kind={item.art ?? 'scene'} seed={uid.length} uid={uid} />;
}

/** 我的收藏：四个入口 = 生活页里除「生活展示」外的四个标签页 */
export function CollectionGrid() {
  const { collectLabel, collectSubtitle } = profile.gallery;
  return (
    <section className="bento-card bento-card--collection bento-card--grow">
      <div className="card-head">
        <div>
          <h2 className="card-head__title">{collectLabel}</h2>
          <p className="card-head__sub">{collectSubtitle}</p>
        </div>
        <MoreLink to="/life" />
      </div>
      <ul className="collection">
        {collectTabs.map((tab) => (
          <li className="collection__item" key={tab.key}>
            <Link className="collection__link" to={`/life?tab=${tab.key}`}>
              <span className="collection__thumb">
                <img src={tab.cover} alt="" loading="lazy" />
              </span>
              <span className="collection__title">{tab.label}</span>
              <span className="collection__desc">{tab.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 我的项目：首页只放前三条，完整列表在 /projects */
export function ProjectGrid() {
  const { projects } = profile;
  return (
    <section className="bento-card bento-card--projects bento-card--grow">
      <div className="card-head">
        <h2 className="card-head__title">{projects.label}</h2>
        <MoreLink to="/projects" />
      </div>
      <ul className="projects">
        {projects.items.slice(0, 3).map((item) => (
          <li className="projects__item" key={item.title}>
            <span className="projects__thumb">
              <ProjectArtwork art={item.art} />
            </span>
            <span className="projects__body">
              <span className="projects__title">{item.title}</span>
              <span className="projects__desc">{item.desc}</span>
              <span className="projects__stack">
                {item.stack.map((tech) => (
                  <em key={tech}>{tech}</em>
                ))}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 生活展示：取生活页第一个标签页的前三条，整页在 /life */
export function LifeGallery() {
  const items = lifeTab.items.slice(0, 3);

  return (
    <section className="bento-card bento-card--life">
      <div className="card-head">
        <h2 className="card-head__title">{lifeTab.label}</h2>
        <MoreLink to="/life" />
      </div>
      <ul className="life">
        {items.map((item, i) => (
          <li className="life__item" key={item.title}>
            <span className="life__thumb">
              <Thumb item={item} uid={`home-life-${lifeTab.key}-${i}`} />
            </span>
            <span className="life__title">{item.title}</span>
            <span className="life__desc">{item.desc}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
