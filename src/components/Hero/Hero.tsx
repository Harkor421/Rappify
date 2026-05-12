import { motion } from "framer-motion";
import type { GeocodeResult } from "../../api/geocode";
import { AddressInput } from "../AddressInput/AddressInput";
import { Logo } from "../Logo/Logo";
import { MapPin, RotateCw } from "../icons";
import { HeroBackground } from "./HeroBackground";
import styles from "./Hero.module.css";

interface HeroProps {
  onSelect: (r: GeocodeResult) => void;
  busy?: boolean;
  compact?: boolean;
  selectedAddress?: string;
  onChangeAddress?: () => void;
  onGoHome?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function Hero({
  onSelect,
  busy,
  compact = false,
  selectedAddress,
  onChangeAddress,
  onGoHome,
  onRefresh,
  refreshing = false,
}: HeroProps) {
  if (compact) {
    return (
      <motion.header
        className={styles.compact}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.compactInner}>
          <button type="button" className={styles.compactBrand} onClick={onGoHome}>
            <Logo size={44} />
            <span className={styles.compactTitle}>Rappify</span>
          </button>
          <div className={styles.compactRight}>
            <button className={styles.compactAddress} onClick={onChangeAddress} type="button">
              <MapPin size={14} strokeWidth={2} className={styles.compactPin} />
              <span className={styles.compactAddrText}>{selectedAddress}</span>
              <span className={styles.compactChange}>cambiar</span>
            </button>
            <button
              type="button"
              className={styles.compactRefresh}
              onClick={onRefresh}
              disabled={refreshing}
              aria-label="Refrescar"
              title="Refrescar lista"
            >
              <RotateCw size={15} strokeWidth={2} className={refreshing ? styles.spin : ""} />
            </button>
          </div>
        </div>
      </motion.header>
    );
  }

  return (
    <section className={styles.hero}>
      <HeroBackground />
      <motion.div
        className={styles.inner}
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
          hidden: {},
        }}
      >
        <motion.div variants={fade}>
          <Logo size={144} />
        </motion.div>
        <motion.h1 className={styles.title} variants={fade}>
          Rapp<span className={styles.titleAccent}>ify</span>
        </motion.h1>
        <motion.p className={styles.subtitle} variants={fade}>
          Encuentra los mejores descuentos cerca de ti.
          <br />
          Restaurantes y productos en oferta, ordenados por % de descuento.
        </motion.p>
        <motion.div className={styles.searchBox} variants={fade}>
          <AddressInput onSelect={onSelect} busy={busy ?? false} />
        </motion.div>
        <motion.p className={styles.hint} variants={fade}>
          Funciona en todo Colombia · Sin backend · Tus datos no salen de tu navegador
        </motion.p>
      </motion.div>
    </section>
  );
}

const fade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
