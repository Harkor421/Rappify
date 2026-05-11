import { Search, SlidersHorizontal, X } from "../icons";
import styles from "./Toolbar.module.css";

export type SortMode =
  | "discount_pct"
  | "discount_abs"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "popular";

export interface Filters {
  query: string;
  sort: SortMode;
  popular: boolean;
  freeShipping: boolean;
  prime: boolean;
  categories: string[];
}

interface ToolbarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  total: number;
  shown: number;
}

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "discount_pct", label: "Mayor % descuento" },
  { value: "discount_abs", label: "Mayor ahorro $" },
  { value: "price_asc", label: "Precio más bajo" },
  { value: "price_desc", label: "Precio más alto" },
  { value: "rating", label: "Mejor restaurante" },
  { value: "popular", label: "Populares primero" },
];

export function Toolbar({ filters, onChange, total, shown }: ToolbarProps) {
  const update = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    onChange({ ...filters, [k]: v });

  const activeFilterCount =
    Number(filters.popular) +
    Number(filters.freeShipping) +
    Number(filters.prime) +
    filters.categories.length +
    (filters.query.trim() ? 1 : 0);

  const clearAll = () =>
    onChange({
      ...filters,
      query: "",
      popular: false,
      freeShipping: false,
      prime: false,
      categories: [],
    });

  return (
    <div className={styles.bar}>
      <div className={styles.search}>
        <Search size={15} strokeWidth={2} />
        <input
          type="search"
          placeholder="Buscar producto o restaurante…"
          value={filters.query}
          onChange={(e) => update("query", e.target.value)}
        />
        {filters.query && (
          <button
            type="button"
            className={styles.clearSearch}
            onClick={() => update("query", "")}
            aria-label="Limpiar búsqueda"
          >
            <X size={13} strokeWidth={2.2} />
          </button>
        )}
      </div>

      <div className={styles.chips}>
        <Chip
          label="Populares"
          checked={filters.popular}
          onChange={(v) => update("popular", v)}
        />
        <Chip
          label="Envío gratis"
          checked={filters.freeShipping}
          onChange={(v) => update("freeShipping", v)}
        />
        <Chip label="Prime" checked={filters.prime} onChange={(v) => update("prime", v)} />

        {activeFilterCount > 0 && (
          <button type="button" className={styles.clearAll} onClick={clearAll}>
            Limpiar
            <X size={12} strokeWidth={2.4} />
          </button>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.count}>
          <span className={styles.countNum}>{shown.toLocaleString("es-CO")}</span>
          <span className={styles.countDim}>de {total.toLocaleString("es-CO")}</span>
        </div>

        <label className={styles.sort}>
          <SlidersHorizontal size={13} strokeWidth={2} />
          <select
            value={filters.sort}
            onChange={(e) => update("sort", e.target.value as SortMode)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function Chip({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={`${styles.chip} ${checked ? styles.chipOn : ""}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
