import { motion } from "framer-motion";
import styles from "./Logo.module.css";

interface LogoProps {
  size?: number | string;
}

export function Logo({ size = 80 }: LogoProps) {
  return (
    <motion.div
      className={styles.logo}
      style={{ width: size, height: size }}
      initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.05, rotate: 2 }}
    >
      <img src="/logo.png" alt="Rappify" className={styles.image} draggable={false} />
    </motion.div>
  );
}
