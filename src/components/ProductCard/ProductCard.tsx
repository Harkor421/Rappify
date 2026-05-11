import { motion } from "framer-motion";
import { useState } from "react";
import type { Product } from "../../types/rappi";
import { formatCOP } from "../../utils/format";
import { UtensilsCrossed } from "../icons";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const wasDiscounted = product.real_price > product.price;

  return (
    <motion.a
      href={product.store_url}
      target="_blank"
      rel="noopener"
      className={styles.card}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.015, 0.5),
      }}
      whileHover={{ y: -4 }}
      layout
    >
      <div className={`${styles.image} ${imgFailed || !product.image ? styles.imageEmpty : ""}`}>
        {product.image && !imgFailed ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <UtensilsCrossed size={36} strokeWidth={1.5} className={styles.imagePlaceholder} />
        )}
        {product.discount_percentage > 0 && (
          <div className={styles.pct}>-{product.discount_percentage}%</div>
        )}
        <div className={styles.flags}>
          {product.is_popular && <span className={styles.flagPopular}>Popular</span>}
          {product.is_prime_exclusive && <span className={styles.flagPrime}>Prime</span>}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.name}>{product.name}</div>
        <div className={styles.priceRow}>
          <span className={styles.priceNow}>{formatCOP(product.price)}</span>
          {wasDiscounted && (
            <span className={styles.priceWas}>{formatCOP(product.real_price)}</span>
          )}
        </div>
        <div className={styles.store}>
          <div className={styles.storeLogo}>
            {product.store_logo && <img src={product.store_logo} alt="" />}
          </div>
          <span className={styles.storeName}>{product.store_brand || product.store_name}</span>
          {product.store_eta && <span className={styles.storeEta}>· {product.store_eta}</span>}
        </div>
      </div>
    </motion.a>
  );
}
