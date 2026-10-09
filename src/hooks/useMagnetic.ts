import { useEffect, useRef } from 'react';

export type MagneticOptions = {
  /** 被吸附的子元素选择器 */
  selector?: string;
  /** 最大位移（px） */
  strength?: number;
  /** 最大倾斜角度（deg） */
  tilt?: number;
  /** 卡片外多远开始被吸引（px） */
  reach?: number;
  /** 每帧插值系数，越小越黏手 */
  ease?: number;
  /** 鼠标进入卡片内部时额外抬起的距离（px） */
  lift?: number;
};

type Item = {
  el: HTMLElement;
  tx: number;
  ty: number;
  rx: number;
  ry: number;
  ttx: number;
  tty: number;
  trx: number;
  try_: number;
  /** 0 = 指针不在附近，1 = 指针在卡片内部 */
  glow: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * 磁性容器：鼠标靠近时子卡片朝指针方向轻微偏移、3D 倾斜并亮起光标高光，
 * 离开后弹回原位。位移由 JS 逐帧插值，所以卡片本身不要再写 CSS transform 过渡。
 */
export function useMagnetic<T extends HTMLElement>(options: MagneticOptions = {}) {
  const {
    selector = '.bento-card',
    strength = 10,
    tilt = 3.2,
    reach = 110,
    ease = 0.14,
    lift = 2,
  } = options;

  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) {
      return;
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let items: Item[] = [];
    const collect = () => {
      // 容器自身命中选择器时也参与吸附（单卡片场景）
      const self = root.matches(selector) ? [root] : [];
      items = [...self, ...Array.from(root.querySelectorAll<HTMLElement>(selector))].map((el) => ({
        el,
        tx: 0,
        ty: 0,
        rx: 0,
        ry: 0,
        ttx: 0,
        tty: 0,
        trx: 0,
        try_: 0,
        glow: 0,
      }));
    };
    collect();
    // 列表异步渲染时重新收集
    const observer = new MutationObserver(collect);
    observer.observe(root, { childList: true, subtree: true });

    let mx = 0;
    let my = 0;
    let active = false;
    let raf = 0;
    let running = false;
    let last = 0;

    function measure() {
      for (const item of items) {
        const rect = item.el.getBoundingClientRect();
        let ttx = 0;
        let tty = 0;
        let trx = 0;
        let try_ = 0;
        let glow = 0;

        if (active) {
          const halfW = rect.width / 2;
          const halfH = rect.height / 2;
          const dx = mx - (rect.left + halfW);
          const dy = my - (rect.top + halfH);
          // 指针到卡片矩形的最短距离
          const ox = Math.max(0, Math.abs(dx) - halfW);
          const oy = Math.max(0, Math.abs(dy) - halfH);
          const out = Math.hypot(ox, oy);

          if (out < reach) {
            const raw = 1 - out / reach;
            const fall = raw * raw * (3 - 2 * raw); // smoothstep，靠近时更跟手
            const nx = clamp(dx / (halfW + reach), -1, 1);
            const ny = clamp(dy / (halfH + reach), -1, 1);
            ttx = nx * strength * fall;
            tty = ny * strength * 0.75 * fall;
            trx = -ny * tilt * fall;
            try_ = nx * tilt * fall;
            if (ox === 0 && oy === 0) {
              // 指针在卡片内部：轻微抬起
              tty -= lift * fall;
              glow = 1;
            } else {
              glow = fall;
            }
          }
        }

        item.ttx = ttx;
        item.tty = tty;
        item.trx = trx;
        item.try_ = try_;
        item.glow = glow;
        item.el.style.setProperty('--mx', `${(((mx - rect.left) / rect.width) * 100).toFixed(1)}%`);
        item.el.style.setProperty('--my', `${(((my - rect.top) / rect.height) * 100).toFixed(1)}%`);
        item.el.style.setProperty('--glow', glow.toFixed(3));
        item.el.classList.toggle('is-near', glow > 0.3);
      }
    }

    function tick(now: number) {
      const frames = Math.min(4, ((now - last) / 16.667) || 1);
      last = now;
      measure();

      const k = 1 - Math.pow(1 - ease, frames); // 帧率无关的插值
      let moving = false;
      for (const item of items) {
        item.tx += (item.ttx - item.tx) * k;
        item.ty += (item.tty - item.ty) * k;
        item.rx += (item.trx - item.rx) * k;
        item.ry += (item.try_ - item.ry) * k;

        if (
          Math.abs(item.ttx - item.tx) > 0.02 ||
          Math.abs(item.tty - item.ty) > 0.02 ||
          Math.abs(item.trx - item.rx) > 0.02 ||
          Math.abs(item.try_ - item.ry) > 0.02
        ) {
          moving = true;
        } else {
          item.tx = item.ttx;
          item.ty = item.tty;
          item.rx = item.trx;
          item.ry = item.try_;
        }

        const scale = item.glow > 0.99 ? 1.008 : 1;
        item.el.style.transform =
          `translate3d(${item.tx.toFixed(2)}px, ${item.ty.toFixed(2)}px, 0)` +
          ` rotateX(${item.rx.toFixed(2)}deg) rotateY(${item.ry.toFixed(2)}deg)` +
          ` scale(${scale.toFixed(4)})`;
      }

      if (moving) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    function ensure() {
      if (running) {
        return;
      }
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }

    const onMove = (event: MouseEvent) => {
      mx = event.clientX;
      my = event.clientY;
      active = true;
      ensure();
    };
    const onLeave = (event: MouseEvent) => {
      // relatedTarget 为空才说明指针真的离开了窗口，否则只是在元素之间移动
      if (event.relatedTarget) {
        return;
      }
      active = false;
      ensure();
    };
    const onScroll = () => ensure();

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseout', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (raf) {
        cancelAnimationFrame(raf);
      }
      observer.disconnect();
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseout', onLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      for (const item of items) {
        item.el.style.transform = '';
        item.el.style.removeProperty('--glow');
        item.el.style.removeProperty('--mx');
        item.el.style.removeProperty('--my');
        item.el.classList.remove('is-near');
      }
    };
  }, [selector, strength, tilt, reach, ease, lift]);

  return ref;
}
