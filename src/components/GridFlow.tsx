import { useEffect, useRef } from 'react';

/** 光束轨道间距（像素）。网格线不再绘制，此值仅决定光带的分布密度 */
const GRID = 72;
/** 每 5.5 万像素一条光束，上下限防止过密或过疏 */
const DENSITY = 55_000;

type Spark = {
  /** true = 沿竖线运动，false = 沿横线运动 */
  vertical: boolean;
  /** 第几条网格线 */
  line: number;
  /** 光头在该线上的坐标 */
  pos: number;
  /** 拖尾长度 */
  len: number;
  /** 速度 px/s，正负决定方向 */
  speed: number;
  /** 峰值透明度 */
  alpha: number;
  /** 配色索引 */
  palette: number;
  /** 出生时间（秒） */
  born: number;
  /** 存活时长（秒） */
  life: number;
};

function readPalette(): string[] {
  const style = getComputedStyle(document.documentElement);
  const a = style.getPropertyValue('--flow-a').trim();
  const b = style.getPropertyValue('--flow-b').trim();
  return [a || '20,184,166', b || '96,165,250'];
}

/**
 * 重新投放一条光束。
 * @param now 当前时间（秒），同时作为出生时间
 * @param scatter true = 直接散布在视口内（首次填充），false = 从视口外进场
 */
function respawn(spark: Spark, width: number, height: number, now: number, scatter: boolean) {
  spark.vertical = Math.random() < 0.5;
  const lineCount = Math.floor((spark.vertical ? width : height) / GRID) + 1;
  spark.line = Math.floor(Math.random() * Math.max(1, lineCount));
  const span = spark.vertical ? height : width;
  spark.len = span * (0.2 + Math.random() * 0.34);
  spark.speed = (55 + Math.random() * 115) * (Math.random() < 0.5 ? -1 : 1);
  // 常态从视口外进场，首次填充时随机散布在视口内
  if (scatter) {
    spark.pos = Math.random() * span;
  } else {
    spark.pos = spark.speed > 0 ? -spark.len : span + spark.len;
  }
  spark.alpha = 0.55 + Math.random() * 0.4;
  spark.palette = Math.random() < 0.55 ? 0 : 1;
  spark.born = now;
  spark.life = 5 + Math.random() * 6;
}

/**
 * 背景流动光束。
 * 只画光、不画网格线：光束沿着虚拟网格的路径运动，视觉上是一条漂移的光带。
 * 画布 fixed 且对齐视口左上角，光带才能在纯粹的页面底色上保持稳定的方位感。
 */
export default function GridFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    let width = 0;
    let height = 0;
    let palette = readPalette();
    let sparks: Spark[] = [];
    let raf = 0;
    let last = 0;
    let paused = false;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(5, Math.min(22, Math.round((width * height) / DENSITY)));
      const create = (scatter: boolean): Spark => {
        const spark: Spark = {
          vertical: false,
          line: 0,
          pos: 0,
          len: 0,
          speed: 0,
          alpha: 0,
          palette: 0,
          born: 0,
          life: 0,
        };
        respawn(spark, width, height, performance.now() / 1000, scatter);
        return spark;
      };
      while (sparks.length < count) {
        sparks.push(create(sparks.length === 0));
      }
      if (sparks.length > count) {
        sparks.length = count;
      }
    }

    function drawSpark(spark: Spark, elapsed: number) {
      const color = palette[spark.palette] ?? palette[0];
      // 出生淡入、死亡淡出（尽量缩短淡态，让光束大部分时间保持明亮）
      let fade = Math.min(1, elapsed / 0.9);
      const remain = spark.life - elapsed;
      if (remain < 1.2) {
        fade *= Math.max(0, remain / 1.2);
      }
      const alpha = spark.alpha * fade;
      if (alpha <= 0.002) {
        return;
      }

      const dir = spark.speed > 0 ? 1 : -1;
      const tail = spark.pos - dir * spark.len;
      const coord = spark.line * GRID + 0.5;

      const gradient = spark.vertical
        ? ctx!.createLinearGradient(0, tail, 0, spark.pos)
        : ctx!.createLinearGradient(tail, 0, spark.pos, 0);
      gradient.addColorStop(0, `rgba(${color},0)`);
      gradient.addColorStop(0.55, `rgba(${color},${(alpha * 0.25).toFixed(3)})`);
      gradient.addColorStop(0.88, `rgba(${color},${(alpha * 0.65).toFixed(3)})`);
      gradient.addColorStop(1, `rgba(${color},${alpha.toFixed(3)})`);

      const path = () => {
        ctx!.beginPath();
        if (spark.vertical) {
          ctx!.moveTo(coord, tail);
          ctx!.lineTo(coord, spark.pos);
        } else {
          ctx!.moveTo(tail, coord);
          ctx!.lineTo(spark.pos, coord);
        }
      };

      // 外层辉光 + 内层实线，窄屏上更有存在感
      ctx!.strokeStyle = gradient;
      ctx!.lineCap = 'round';
      ctx!.lineWidth = 3.4;
      ctx!.globalAlpha = 0.22;
      path();
      ctx!.stroke();
      ctx!.globalAlpha = 1;
      ctx!.lineWidth = 1.5;
      path();
      ctx!.stroke();

      // 光头亮点
      ctx!.fillStyle = `rgba(${color},${Math.min(1, alpha * 1.2).toFixed(3)})`;
      ctx!.beginPath();
      if (spark.vertical) {
        ctx!.arc(coord, spark.pos, 2, 0, Math.PI * 2);
      } else {
        ctx!.arc(spark.pos, coord, 2, 0, Math.PI * 2);
      }
      ctx!.fill();
    }

    function render() {
      ctx!.clearRect(0, 0, width, height);
      const now = performance.now() / 1000;
      for (const spark of sparks) {
        const elapsed = now - spark.born;
        const span = spark.vertical ? height : width;
        // 走完视口或寿命耗尽就换个轨道重来
        const offscreen =
          spark.speed > 0 ? spark.pos - spark.len > span : spark.pos + spark.len < 0;
        if (elapsed > spark.life || offscreen) {
          respawn(spark, width, height, now, false);
          continue;
        }
        drawSpark(spark, elapsed);
      }
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      for (const spark of sparks) {
        spark.pos += spark.speed * dt;
      }
      render();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf || paused || reduced) {
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    resize();
    render();
    start();

    const onResize = () => {
      resize();
      render();
    };
    // 主题切换时重新取色（CSS 变量写在 html[data-theme] 上）
    const observer = new MutationObserver(() => {
      palette = readPalette();
      render();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    const onVisibility = () => {
      paused = document.hidden;
      if (paused) {
        stop();
      } else {
        start();
      }
    };

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="flow-canvas" aria-hidden="true" />;
}
