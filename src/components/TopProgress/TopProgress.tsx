import { AnimatePresence, motion } from "framer-motion";
import type { FetchProgress } from "../../types/rappi";
import styles from "./TopProgress.module.css";

interface TopProgressProps {
  visible: boolean;
  phase: "stores" | "products";
  progress: FetchProgress | null;
}

export function TopProgress({ visible, phase, progress }: TopProgressProps) {
  const pct =
    phase === "products" && progress && progress.total > 0
      ? Math.min(100, (progress.done / progress.total) * 100)
      : null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.wrap}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
        >
          <div className={styles.track}>
            {pct == null ? (
              <div className={styles.indeterminate} />
            ) : (
              <motion.div
                className={styles.bar}
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </div>
          <div className={styles.label}>
            {phase === "stores" && <span>Buscando tiendas con descuento…</span>}
            {phase === "products" && (
              <span>
                Cargando productos
                {progress && (
                  <>
                    <span className={styles.sep}>·</span>
                    <span className={styles.count}>
                      {progress.done} / {progress.total} restaurantes
                    </span>
                  </>
                )}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
