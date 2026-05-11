import { motion } from "framer-motion";
import type { FetchProgress, Product } from "../../types/rappi";
import { ProductCard } from "../ProductCard/ProductCard";
import styles from "./LoadingState.module.css";

interface LoadingStateProps {
  phase: "stores" | "products";
  progress: FetchProgress | null;
  preview?: Product[];
}

export function LoadingState({ phase, progress, preview = [] }: LoadingStateProps) {
  const pct = progress && progress.total > 0 ? (progress.done / progress.total) * 100 : 0;
  const message =
    phase === "stores"
      ? "Buscando restaurantes con descuento cerca de ti…"
      : "Cargando productos en oferta…";

  return (
    <div className={styles.wrapper}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.banner}
      >
        <div className={styles.headline}>
          <div className={styles.dots}>
            <span />
            <span />
            <span />
          </div>
          <span>{message}</span>
        </div>
        {phase === "products" && (
          <>
            <div className={styles.progressTrack}>
              <motion.div
                className={styles.progressBar}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            {progress && (
              <p className={styles.progressLabel}>
                {progress.done} / {progress.total} restaurantes
                {progress.errors > 0 && ` · ${progress.errors} con error`}
              </p>
            )}
          </>
        )}
      </motion.div>

      {preview.length > 0 ? (
        <div className={styles.preview}>
          {preview.slice(0, 24).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      ) : (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} delay={i * 0.04} />
          ))}
        </div>
      )}
    </div>
  );
}

function Skeleton({ delay }: { delay: number }) {
  return (
    <motion.div
      className={styles.skeleton}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className={styles.skelImg} />
      <div className={styles.skelLine} style={{ width: "82%" }} />
      <div className={styles.skelLine} style={{ width: "55%" }} />
      <div className={styles.skelStore} />
    </motion.div>
  );
}
