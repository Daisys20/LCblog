import HeroBanner from '../components/HeroBanner';
import { JourneyTimeline, KeepGoingCard, QuoteCard } from '../components/ExtraCards';
import MusicPlayer from '../components/MusicPlayer';
import { AttributeCard, PlanCard } from '../components/PanelCards';
import { CollectionGrid, LifeGallery, ProjectGrid } from '../components/ShowcaseCards';
import TechIcon from '../components/TechIcon';
import ThoughtsCard from '../components/ThoughtsCard';
import WorldView from '../components/WorldView';
import { profile } from '../data/profile';
import { useMagnetic } from '../hooks/useMagnetic';

/** 我的能力 */
function SkillsCard() {
  const { skills } = profile;
  return (
    <section className="bento-card">
      <div className="card-head">
        <h2 className="card-head__title">{skills.label}</h2>
      </div>
      <ul className="skill-grid">
        {skills.items.map((item) => (
          <li className="skill-tile" key={item.key} title={item.name}>
            <TechIcon name={item.key} size={26} />
            <span className="skill-tile__name">{item.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 我的歌单 */
function MusicCard() {
  const { music } = profile;
  return (
    <section className="bento-card bento-card--music">
      <div className="card-head">
        <h2 className="card-head__title">
          {music.title}
          <span className="music__source">网易云音乐</span>
        </h2>
      </div>
      <MusicPlayer tracks={music.tracks} desc={music.desc} />
    </section>
  );
}

export default function ProfilePage() {
  const bentoRef = useMagnetic<HTMLDivElement>({ selector: '.bento-card', strength: 12, tilt: 3.2 });

  return (
    <div className="profile" ref={bentoRef}>
      {/* 第一行：横幅（当前状态叠在图上）+ 人生语录（含签名） */}
      <div className="bento-top">
        <HeroBanner />
        <QuoteCard />
      </div>

      {/* 下面：四列 Bento 网格
          列1 个人属性 / 世界观 / 生活展示   列2 能力 / 项目 / 歌单
          列3 2026 计划 / 收藏              列4 想法 / 日志 / Keep going
          每列各指定一张「吸收卡」（带 .bento-card--grow）吃掉该列剩余高度，
          四列底部对齐；详见 styles.css 的「四列高度配平」一节。 */}
      <div className="bento">
        <div className="bento__col">
          <AttributeCard />
          <WorldView />
          <LifeGallery />
        </div>

        <div className="bento__col">
          <SkillsCard />
          <ProjectGrid />
          <MusicCard />
        </div>

        <div className="bento__col">
          <PlanCard />
          <CollectionGrid />
        </div>

        <div className="bento__col">
          <ThoughtsCard />
          <JourneyTimeline />
          <KeepGoingCard />
        </div>
      </div>
    </div>
  );
}
