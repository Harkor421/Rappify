import { useMemo } from "react";
import type { Product } from "../../types/rappi";
import styles from "./CategoryRow.module.css";

interface CategoryRowProps {
  products: Product[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function CategoryRow({ products, selected, onChange }: CategoryRowProps) {
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      for (const c of p.categories) {
        counts.set(c, (counts.get(c) || 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [products]);

  if (categories.length === 0) return null;

  const toggle = (cat: string) => {
    if (selected.includes(cat)) onChange(selected.filter((c) => c !== cat));
    else onChange([...selected, cat]);
  };

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`${styles.chip} ${selected.length === 0 ? styles.chipOn : ""}`}
        onClick={() => onChange([])}
      >
        Todas
      </button>
      {categories.map(([cat, count]) => (
        <button
          key={cat}
          type="button"
          className={`${styles.chip} ${selected.includes(cat) ? styles.chipOn : ""}`}
          onClick={() => toggle(cat)}
        >
          {cat}
          <span className={styles.count}>{count}</span>
        </button>
      ))}
    </div>
  );
}
