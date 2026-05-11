import { useEffect, useRef } from "react";
import styles from "./BackgroundDots.module.css";

const FOLLOW_SPEED = 0.08;

export function BackgroundDots() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: target.x, y: target.y };
    let raf: number | null = null;
    let everMoved = false;

    const tick = () => {
      current.x += (target.x - current.x) * FOLLOW_SPEED;
      current.y += (target.y - current.y) * FOLLOW_SPEED;
      const el = ref.current;
      if (el) {
        el.style.setProperty("--mx", `${current.x}px`);
        el.style.setProperty("--my", `${current.y}px`);
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!everMoved) {
        everMoved = true;
        current.x = target.x;
        current.y = target.y;
        ref.current?.style.setProperty("--cursor-active", "1");
      }
    };

    const onLeave = () => {
      ref.current?.style.setProperty("--cursor-active", "0");
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={styles.bg} ref={ref} aria-hidden>
      <div className={styles.dotsBase} />
      <div className={styles.dotsAccent} />
      <div className={styles.dotsHalo} />
    </div>
  );
}
