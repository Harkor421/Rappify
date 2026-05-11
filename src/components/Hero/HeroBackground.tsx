import styles from "./HeroBackground.module.css";

export function HeroBackground() {
  return (
    <div className={styles.bg} aria-hidden>
      <div className={styles.dots} />
      <div className={styles.dotsSecondary} />
      <div className={styles.glowMain} />
      <div className={styles.glowSecondary} />
      <div className={styles.glowTertiary} />
      <div className={styles.fade} />
    </div>
  );
}
