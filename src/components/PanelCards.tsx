import { useState, type ReactNode } from 'react';

import { profile } from '../data/profile';

/* ------------------------------------------------------------------
   2026 年计划里每个大类的小图标
   ------------------------------------------------------------------ */
const PLAN_ICONS: Record<string, ReactNode> = {
  code: (
    <path
      d="M9 8.4L5.4 12 9 15.6M15 8.4L18.6 12 15 15.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  health: (
    <path
      d="M6.4 9v6M4 10.6v2.8M17.6 9v6M20 10.6v2.8M6.4 12h11.2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  ),
  invest: (
    <>
      <path
        d="M4 16.4l4.6-4.8 3.2 2.6L20 6.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.4 6.6H20v4.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  travel: (
    <path
      d="M3.6 12.4l16.8-6-3.4 13.2-4.3-4.5-4.6 2.4.7-4.2z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  ),
  sleep: (
    <path
      d="M20.4 14.4A8.4 8.4 0 0 1 9.6 3.6a7 7 0 1 0 10.8 10.8z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  ),
};

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9.5 5.5L16 12l-6.5 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 勾选框：方角框 + 对勾 */
function BoxCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 12.3l2.7 2.7L16.2 9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 个人属性：像 RPG 角色面板那样的数值条
 *  （列1 的吸收卡：列里多出来的高度由数值条的行距吃掉） */
export function AttributeCard() {
  const { attributes } = profile;
  return (
    <section className="bento-card bento-card--attrs bento-card--grow">
      <div className="card-head">
        <h2 className="card-head__title">{attributes.label}</h2>
      </div>

      <div className="os-head">
        <span className="os-head__name">{attributes.os}</span>
        {attributes.online ? (
          <span className="pill pill--online">
            <i className="pill__dot" />
            在线
          </span>
        ) : null}
      </div>

      <dl className="facts">
        {attributes.facts.map((fact) => (
          <div className="facts__row" key={fact.key}>
            <dt>{fact.key}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <p className="attrs__caption">Attributes</p>
      <ul className="attrs">
        {attributes.bars.map((bar) => (
          <li className="attrs__row" key={bar.label}>
            <span className="attrs__label">{bar.label}</span>
            <span className="attrs__track">
              <span className="attrs__fill" style={{ width: `${bar.value}%` }} />
            </span>
            <span className="attrs__value">{bar.value}</span>
          </li>
        ))}
      </ul>
      <p className="attrs__footnote">{attributes.footnote}</p>
    </section>
  );
}

/** 2026 年计划：大类（学习 / 健身 / …）+ 可展开的具体计划
 *  - 手风琴：任何时刻只展开一个大类，默认展开第一个
 *  - 点另一个分类 → 收起当前、展开新的；重复点已展开的分类不会关闭
 *    （五个分类的任务条数一致，所以卡片高度恒定，不会把盒子撑高）
 *  - 点具体计划：勾选完成，该大类的进度条按这条计划的 weight 前进 */
export function PlanCard() {
  const { plan } = profile;
  const [openKey, setOpenKey] = useState<string>(plan.categories[0].key);
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const cat of plan.categories) {
      cat.tasks.forEach((task, i) => {
        if (task.done) {
          init[`${cat.key}-${i}`] = true;
        }
      });
    }
    return init;
  });

  const isOpen = (key: string) => key === openKey;
  const isDone = (key: string, i: number) => Boolean(doneMap[`${key}-${i}`]);
  const catProgress = (key: string, tasks: { weight: number }[]) =>
    tasks.reduce((sum, task, i) => sum + (isDone(key, i) ? task.weight : 0), 0);

  const totalWeight = plan.categories.reduce(
    (sum, cat) => sum + cat.tasks.reduce((a, task) => a + task.weight, 0),
    0,
  );
  const doneWeight = plan.categories.reduce((sum, cat) => sum + catProgress(cat.key, cat.tasks), 0);
  const overall = Math.round((doneWeight / totalWeight) * 100);

  /* 点已展开的分类 → 保持展开（不允许全部收起）；点别的 → 只留下这一个 */
  const toggleCat = (key: string) => setOpenKey((prev) => (prev === key ? prev : key));
  const toggleTask = (key: string, i: number) =>
    setDoneMap((prev) => ({ ...prev, [`${key}-${i}`]: !prev[`${key}-${i}`] }));

  return (
    <section className="bento-card bento-card--plan">
      <div className="card-head">
        <h2 className="card-head__title">{plan.label}</h2>
        <span className="plan__overall">总进度 {overall}%</span>
      </div>

      <ul className="plan">
        {plan.categories.map((cat, ci) => {
          const pct = catProgress(cat.key, cat.tasks);
          const open = isOpen(cat.key);
          return (
            <li className={`plan__cat${open ? ' is-open' : ''}`} key={cat.key}>
              <button
                type="button"
                className="plan__row"
                aria-expanded={open}
                onClick={() => toggleCat(cat.key)}
              >
                <span className="plan__icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    {PLAN_ICONS[cat.icon]}
                  </svg>
                </span>
                <span className="plan__text">
                  <span className="plan__name">{cat.label}</span>
                  <span className="plan__desc">{cat.desc}</span>
                </span>
                <span className="plan__track">
                  <span
                    className={`plan__fill plan__fill--${ci % 5}`}
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="plan__pct">{pct}%</span>
                <span className="plan__chev">
                  <ChevronIcon />
                </span>
              </button>

              {open ? (
                <ul className="plan__tasks">
                  {cat.tasks.map((task, i) => {
                    const done = isDone(cat.key, i);
                    return (
                      <li key={task.title}>
                        <button
                          type="button"
                          className={`plan__task${done ? ' is-done' : ''}`}
                          aria-pressed={done}
                          onClick={() => toggleTask(cat.key, i)}
                        >
                          <span className="plan__check">
                            <BoxCheckIcon />
                          </span>
                          <span className="plan__task-title">{task.title}</span>
                          <span className="plan__weight">+{task.weight}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
