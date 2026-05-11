import { motion } from "framer-motion";
import { useState } from "react";
import type { Product } from "../../types/rappi";
import { formatCOP, formatDistance } from "../../utils/format";
import { ArrowUpRight, Clock, Flame, Star, Truck, UtensilsCrossed } from "../icons";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  index: number;
}

const HOT_THRESHOLD = 40;

export function ProductCard({ product, index }: ProductCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const wasDiscounted = product.real_price > product.price;
  const isHot = product.discount_percentage >= HOT_THRESHOLD;
  const distance = formatDistance(product.store_distance_m);

  return (
    <motion.a
      href={product.store_url}
      target="_blank"
      rel="noopener"
      className={`${styles.card} ${isHot ? styles.hot : ""}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.012, 0.4),
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
          <UtensilsCrossed size={32} strokeWidth={1.4} className={styles.imagePlaceholder} />
        )}

        {product.discount_percentage > 0 && (
          <div className={`${styles.pct} ${isHot ? styles.pctHot : ""}`}>
            {isHot && <Flame size={11} strokeWidth={2.5} />}-{product.discount_percentage}%
          </div>
        )}

        <div className={styles.flags}>
          {product.is_popular && <span className={styles.flagPopular}>Popular</span>}
          {product.is_prime_exclusive && <span className={styles.flagPrime}>Prime</span>}
        </div>

        <div className={styles.openHint}>
          <ArrowUpRight size={14} strokeWidth={2.2} />
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

        <div className={styles.metaRow}>
          {product.store_rating > 0 && (
            <span className={styles.meta}>
              <Star size={11} strokeWidth={2} className={styles.starIcon} />
              {product.store_rating.toFixed(1)}
            </span>
          )}
          {product.store_eta && (
            <span className={styles.meta}>
              <Clock size={11} strokeWidth={2} />
              {product.store_eta}
            </span>
          )}
          {distance && <span className={styles.meta}>{distance}</span>}
          {product.store_free_shipping && (
            <span className={`${styles.meta} ${styles.metaFree}`}>
              <Truck size={11} strokeWidth={2} />
              Envío gratis
            </span>
          )}
        </div>

        <div className={styles.store}>
          <div className={styles.storeLogo}>
            {product.store_logo && <img src={product.store_logo} alt="" />}
          </div>
          <span className={styles.storeName}>{product.store_brand || product.store_name}</span>
        </div>
      </div>
    </motion.a>
  );
}
