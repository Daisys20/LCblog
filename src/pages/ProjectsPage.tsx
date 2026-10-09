import { useMemo, useState } from 'react';

import { ProjectArtwork } from '../components/Artwork';
import PageHero from '../components/PageHero';
import { profile } from '../data/profile';

/**
 * 项目导航页（/projects）
 *
 * 首页那张「我的项目」卡只放前三个，这里放全部，并按 平台 / 应用 / 可视化 分类，
 * 上方一排筛选标签可以快速缩小范围。
 */
export default function ProjectsPage() {
  const { projects } = profile;
  const [kind, setKind] = useState('all');

  const list = useMemo(
    () => (kind === 'all' ? projects.items : projects.items.filter((item) => item.kind === kind)),
    [kind, projects.items],
  );

  return (
    <div className="page">
      <PageHero title={projects.title} en={projects.en} desc={projects.desc}>
        <p className="page-hero__note">
          {projects.items.length} 个项目 · {projects.filters.length - 1} 个分类
        </p>
      </PageHero>

      {/* 筛选标签：点了只留对应分类，再点一次「全部」还原 */}
      <div className="tabs" role="tablist" aria-label="项目分类">
        {projects.filters.map((filter) => {
          const active = filter.key === kind;
          const count =
            filter.key === 'all'
              ? projects.items.length
              : projects.items.filter((item) => item.kind === filter.key).length;
          return (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={active}
              className={active ? 'tabs__item tabs__item--active' : 'tabs__item'}
              onClick={() => setKind(filter.key)}
            >
              {filter.label}
              <span className="tabs__count">{count}</span>
            </button>
          );
        })}
      </div>

      <ul className="proj-grid">
        {list.map((item) => (
          <li className="proj-card" key={item.title}>
            <span className="proj-card__thumb">
              <ProjectArtwork art={item.art} />
            </span>
            <div className="proj-card__body">
              <div className="proj-card__head">
                <h2 className="proj-card__title">{item.title}</h2>
                <span className="proj-card__year">{item.year}</span>
              </div>
              <p className="proj-card__desc">{item.desc}</p>
              <p className="proj-card__detail">{item.detail}</p>
              <div className="proj-card__foot">
                <span className="proj-card__role">{item.role}</span>
                <span className="proj-card__stack">
                  {item.stack.map((tech) => (
                    <em key={tech}>{tech}</em>
                  ))}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {list.length === 0 ? <p className="empty-hint">这个分类下还没有项目。</p> : null}
    </div>
  );
}
