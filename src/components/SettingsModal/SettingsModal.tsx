import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { clearCredentials, getCredentials, saveCredentials } from "../../api/credentials";
import { cacheClear } from "../../api/cache";
import styles from "./SettingsModal.module.css";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function SettingsModal({ open, onClose, onSaved }: SettingsModalProps) {
  const [auth, setAuth] = useState("");
  const [device, setDevice] = useState("");
  const [version, setVersion] = useState("1.161.2");

  useEffect(() => {
    if (open) {
      const c = getCredentials();
      setAuth(c?.authorization ?? "");
      setDevice(c?.deviceid ?? "");
      setVersion(c?.app_version ?? "1.161.2");
    }
  }, [open]);

  const handleSave = () => {
    if (!auth.trim() || !device.trim()) return;
    saveCredentials({
      authorization: auth.trim().startsWith("Bearer ") ? auth.trim() : `Bearer ${auth.trim()}`,
      deviceid: device.trim(),
      app_version: version.trim() || "1.161.2",
    });
    onSaved?.();
    onClose();
  };

  const handleClear = () => {
    clearCredentials();
    cacheClear();
    setAuth("");
    setDevice("");
    onSaved?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.close} onClick={onClose} aria-label="Cerrar">
              ×
            </button>
            <h2 className={styles.title}>Credenciales de Rappi</h2>
            <p className={styles.intro}>
              Esta app llama a Rappi directamente desde tu navegador y necesita tu propio token de
              sesión. Se guarda solo en este dispositivo (localStorage).
            </p>

            <details className={styles.help}>
              <summary>¿Cómo obtenerlo?</summary>
              <ol>
                <li>
                  Abre <a href="https://www.rappi.com.co" target="_blank" rel="noopener">rappi.com.co</a> e inicia sesión.
                </li>
                <li>Abre DevTools (F12) → pestaña Network.</li>
                <li>Refresca la página y filtra por <code>filters/</code>.</li>
                <li>
                  Click en cualquier request → en Headers copia los valores de
                  <code> authorization</code> y <code>deviceid</code>.
                </li>
              </ol>
            </details>

            <label className={styles.field}>
              <span>Authorization</span>
              <textarea
                rows={3}
                placeholder="Bearer ft.gAAA…"
                value={auth}
                onChange={(e) => setAuth(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>deviceid</span>
              <input
                type="text"
                placeholder="uuid-…"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>app-version (opcional)</span>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </label>

            <div className={styles.actions}>
              <button className={styles.btnGhost} onClick={handleClear}>
                Borrar y limpiar caché
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleSave}
                disabled={!auth.trim() || !device.trim()}
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
