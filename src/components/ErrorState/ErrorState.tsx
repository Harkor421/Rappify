import { motion } from "framer-motion";
import { AlertTriangle, Lock } from "../icons";
import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  message: string;
  isAuthError?: boolean;
  onRetry?: () => void;
  onOpenSettings?: () => void;
}

export function ErrorState({ message, isAuthError, onRetry, onOpenSettings }: ErrorStateProps) {
  return (
    <motion.div
      className={styles.wrapper}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={styles.iconWrap}>
        {isAuthError ? (
          <Lock size={28} strokeWidth={1.6} />
        ) : (
          <AlertTriangle size={28} strokeWidth={1.6} />
        )}
      </div>
      <h2>{isAuthError ? "Token expirado o inválido" : "Algo salió mal"}</h2>
      <p>{message}</p>
      <div className={styles.actions}>
        {isAuthError ? (
          <button className={styles.primary} onClick={onOpenSettings}>
            Configurar credenciales
          </button>
        ) : (
          <button className={styles.primary} onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    </motion.div>
  );
}
