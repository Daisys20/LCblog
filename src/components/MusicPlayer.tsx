import { useCallback, useEffect, useRef, useState } from 'react';

import type { MusicTrack } from '../data/profile';

/**
 * 网易云外链直链。实测无需 Referer 校验，且最终跳转到的 CDN（m*.music.126.net）
 * 同样提供 https，因此 https 站点下也不会触发混合内容拦截。
 */
function neteaseUrl(id: number) {
  return `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
}

/** 优先用本地文件，其次按网易云歌曲 ID 拼外链 */
function resolveSrc(track: MusicTrack) {
  if (track.src) {
    return track.src;
  }
  return track.neteaseId ? neteaseUrl(track.neteaseId) : '';
}

/** 封面统一升级 https 并裁剪到 200px，避免 http 混合内容与大图浪费 */
function resolveCover(track: MusicTrack) {
  if (!track.cover) {
    return '';
  }
  const url = track.cover.replace(/^http:/, 'https:');
  return url.includes('?') ? url : `${url}?param=200y200`;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00';
  }
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/** 唱片缺省封面：没配封面时用的音符图案 */
function VinylArt() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M20 33.5a3 3 0 1 0 4 2.8V18l11-3v4.2l-9 2.4v14.9a6.5 6.5 0 1 0 3 5.5z"
        fill="var(--music-art)"
      />
    </svg>
  );
}

function StepBack() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 6v12H5V6h2zm12 0v12l-9-6z" fill="currentColor" />
    </svg>
  );
}

function StepForward() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 6v12h2V6h-2zM5 6v12l9-6z" fill="currentColor" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />
    </svg>
  );
}

interface Props {
  tracks: MusicTrack[];
  /** 卡片副标题，例如「边听边写 Bug」 */
  desc?: string;
}

export default function MusicPlayer({ tracks, desc }: Props) {
  // 过滤掉既没有 neteaseId 也没有 src 的占位数据
  const list = tracks.filter((item) => item.neteaseId || item.src);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const pendingPlay = useRef(false);
  const dragging = useRef(false);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [blocked, setBlocked] = useState<Record<number, boolean>>({});
  // 列表溢出且没滚到底时，底部加渐隐提示还有内容
  const [overflow, setOverflow] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  const track = list[index] as MusicTrack | undefined;

  // 切歌时同步 audio 的 src。因为 src 变化需要时间缓冲，真正的 play() 延后到 canplay。
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) {
      return;
    }
    const src = resolveSrc(track);
    if (audio.getAttribute('src') !== src) {
      audio.setAttribute('src', src);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [track]);

  // 曲目多到装不下时才需要渐隐提示
  useEffect(() => {
    const el = listRef.current;
    if (!el) {
      return;
    }
    const check = () => {
      setOverflow(el.scrollHeight > el.clientHeight + 2);
      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [list.length]);

  const playAt = useCallback(
    (target: number) => {
      if (!list.length) {
        return;
      }
      const next = ((target % list.length) + list.length) % list.length;
      pendingPlay.current = true;
      if (next === index) {
        const audio = audioRef.current;
        if (audio && blocked[next]) {
          // 之前播失败的歌再点一次：清掉标记并强制重新加载
          setBlocked((prev) => ({ ...prev, [next]: false }));
          const src = resolveSrc(list[next]);
          audio.setAttribute('src', src);
          audio.load();
          return;
        }
        audio?.play().catch(() => setPlaying(false));
      } else {
        setIndex(next);
      }
    },
    [blocked, index, list],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    pendingPlay.current = true;
    audio.play().catch(() => setPlaying(false));
  }, [playing]);

  function seekFromPointer(event: React.PointerEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration === 0) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setCurrentTime(audio.currentTime);
  }

  function handleBarDown(event: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    seekFromPointer(event);
  }

  function handleBarMove(event: React.PointerEvent<HTMLDivElement>) {
    if (dragging.current) {
      seekFromPointer(event);
    }
  }

  function handleBarUp(event: React.PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  /** 进度条聚焦后可用方向键微调（Shift 加速），空格播放/暂停 */
  function handleBarKey(event: React.KeyboardEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      toggle();
      return;
    }
    if (!Number.isFinite(audio.duration)) {
      return;
    }
    const step = event.shiftKey ? 30 : 5;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
      setCurrentTime(audio.currentTime);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      audio.currentTime = Math.max(0, audio.currentTime - step);
      setCurrentTime(audio.currentTime);
    }
  }

  if (!track) {
    return <p className="music__empty">还没有配置歌曲</p>;
  }

  const cover = resolveCover(track);
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="music">
      <div className="music__now">
        <div className={`music__vinyl${playing ? ' is-spinning' : ''}`}>
          {cover ? (
            <img src={cover} alt={`${track.title} 封面`} loading="lazy" />
          ) : (
            <VinylArt />
          )}
          <span className="music__vinyl-hole" />
        </div>
        <div className="music__meta">
          <p className="music__title" title={track.title}>
            {track.title}
          </p>
          <p className="music__artist">{track.artist}</p>
          {desc ? <p className="music__desc">{desc}</p> : null}
        </div>
      </div>

      <div
        className="music__bar-wrap"
        onPointerDown={handleBarDown}
        onPointerMove={handleBarMove}
        onPointerUp={handleBarUp}
        onPointerCancel={handleBarUp}
        onKeyDown={handleBarKey}
        role="slider"
        aria-label="播放进度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        tabIndex={0}
      >
        <div className="music__bar">
          <span className="music__bar-fill" style={{ width: `${progress}%` }} />
          <span className="music__bar-knob" style={{ left: `${progress}%` }} />
        </div>
      </div>

      <div className="music__time">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="music__controls">
        <button
          type="button"
          className="music__btn"
          onClick={() => playAt(index - 1)}
          aria-label="上一首"
        >
          <StepBack />
        </button>
        <button
          type="button"
          className="music__btn music__btn--main"
          onClick={toggle}
          aria-label={playing ? '暂停' : '播放'}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          className="music__btn"
          onClick={() => playAt(index + 1)}
          aria-label="下一首"
        >
          <StepForward />
        </button>
        {track.neteaseId ? (
          <a
            className="music__link"
            href={`https://music.163.com/#/song?id=${track.neteaseId}`}
            target="_blank"
            rel="noreferrer"
          >
            在网易云打开 ↗
          </a>
        ) : null}
      </div>

      {blocked[index] ? (
        <p className="music__warn">这首歌暂无外链播放权限，换一首试试</p>
      ) : null}

      <ul
        className={`music__list${overflow && !atBottom ? ' is-faded' : ''}`}
        ref={listRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
        }}
      >
        {list.map((item, i) => (
          <li key={`${item.neteaseId ?? item.src}-${item.title}`}>
            <button
              type="button"
              className={`music__item${i === index ? ' is-active' : ''}`}
              onClick={() => playAt(i)}
            >
              <span className="music__item-index">
                {playing && i === index ? '▶' : String(i + 1).padStart(2, '0')}
              </span>
              <span className="music__item-title">{item.title}</span>
              <span className="music__item-artist">{item.artist}</span>
            </button>
          </li>
        ))}
      </ul>

      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          if (!dragging.current) {
            setCurrentTime(e.currentTarget.currentTime);
          }
        }}
        onCanPlay={() => {
          if (pendingPlay.current) {
            pendingPlay.current = false;
            audioRef.current
              ?.play()
              .then(() => setPlaying(true))
              .catch(() => setPlaying(false));
          }
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => playAt(index + 1)}
        onError={() => {
          pendingPlay.current = false;
          setPlaying(false);
          setBlocked((prev) => ({ ...prev, [index]: true }));
        }}
      />
    </div>
  );
}
