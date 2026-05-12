import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, RotateCw } from "../icons";
import styles from "./StaleBanner.module.css";

interface StaleBannerProps {
  visible: boolean;
  ageMinutes: number;
  refreshing: boolean;
  onRefresh: () => void;
}

function formatAge(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function StaleBanner({ visible, ageMinutes, refreshing, onRefresh }: StaleBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.banner}
          initial={{ y: -20, opacity: 0, height: 0 }}
          animate={{ y: 0, opacity: 1, height: "auto" }}
          exit={{ y: -20, opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.inner}>
            <AlertTriangle size={16} strokeWidth={2.2} className={styles.icon} />
            <span className={styles.text}>
              Estas ofertas se cargaron hace <strong>{formatAge(ageMinutes)}</strong>. Algunas
              pueden ya no estar disponibles.
            </span>
            <button
              type="button"
              className={styles.button}
              onClick={onRefresh}
              disabled={refreshing}
            >
              <RotateCw
                size={14}
                strokeWidth={2.2}
                className={refreshing ? styles.spin : ""}
              />
              {refreshing ? "Refrescando…" : "Refrescar"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
