import { forwardRef, useMemo, type CSSProperties, type ReactNode } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import type { Product } from "../../types/rappi";
import { ProductCard } from "../ProductCard/ProductCard";
import type { Filters, SortMode } from "../Toolbar/Toolbar";
import styles from "./ProductGrid.module.css";

interface ProductGridProps {
  products: Product[];
  filters: Filters;
}

const COMPARATORS: Record<SortMode, (a: Product, b: Product) => number> = {
  discount_pct: (a, b) => b.discount_percentage - a.discount_percentage,
  discount_abs: (a, b) => b.real_price - b.price - (a.real_price - a.price),
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  rating: (a, b) => b.store_rating - a.store_rating,
  popular: (a, b) => Number(b.is_popular) - Number(a.is_popular),
};

const GridList = forwardRef<HTMLDivElement, { style?: CSSProperties; children?: ReactNode }>(
  function GridList({ style, children, ...rest }, ref) {
    return (
      <div ref={ref} {...rest} className={styles.grid} style={style}>
        {children}
      </div>
    );
  },
);

function GridItem({ children }: { children?: ReactNode }) {
  return <div className={styles.gridItem}>{children}</div>;
}

export function ProductGrid({ products, filters }: ProductGridProps) {
  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    let arr = products.filter((p) => {
      if (filters.popular && !p.is_popular) return false;
      if (filters.freeShipping && !p.store_free_shipping) return false;
      if (filters.prime && !p.is_prime_exclusive) return false;
      if (filters.categories.length > 0 && !p.categories.some((c) => filters.categories.includes(c)))
        return false;
      if (q) {
        const hay = `${p.name} ${p.store_name} ${p.store_brand ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    arr = [...arr].sort(COMPARATORS[filters.sort]);
    return arr;
  }, [products, filters]);

  if (filtered.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Sin productos con esos filtros. Prueba quitando alguno.</p>
      </div>
    );
  }

  return (
    <VirtuosoGrid
      useWindowScroll
      totalCount={filtered.length}
      overscan={400}
      components={{ List: GridList, Item: GridItem }}
      computeItemKey={(index) => filtered[index]?.id ?? index}
      itemContent={(index) => {
        const product = filtered[index];
        if (!product) return null;
        return <ProductCard product={product} index={index} />;
      }}
    />
  );
}
