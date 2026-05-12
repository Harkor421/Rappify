import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { GeocodeResult } from "./api/geocode";
import { hasCredentials } from "./api/credentials";
import { BackgroundDots } from "./components/BackgroundDots/BackgroundDots";
import { CategoryRow } from "./components/CategoryRow/CategoryRow";
import { ErrorState } from "./components/ErrorState/ErrorState";
import { Hero } from "./components/Hero/Hero";
import { LoadingState } from "./components/LoadingState/LoadingState";
import { ProductGrid } from "./components/ProductGrid/ProductGrid";
import { SettingsModal } from "./components/SettingsModal/SettingsModal";
import { StaleBanner } from "./components/StaleBanner/StaleBanner";
import { type Filters, Toolbar } from "./components/Toolbar/Toolbar";
import { TopProgress } from "./components/TopProgress/TopProgress";
import { GithubIcon, Heart, Settings } from "./components/icons";
import { useProducts } from "./hooks/useProducts";
import { DEFAULT_LOCATION } from "./config";
import { shortAddress } from "./utils/format";
import styles from "./App.module.css";

const INITIAL_FILTERS: Filters = {
  query: "",
  sort: "discount_pct",
  popular: false,
  freeShipping: false,
  prime: false,
  categories: [],
};

const SAVED_LOCATION_KEY = "rappify:location";

function loadSavedLocation(): GeocodeResult | null {
  try {
    const raw = localStorage.getItem(SAVED_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GeocodeResult>;
    if (typeof parsed.lat === "number" && typeof parsed.lng === "number" && parsed.display_name) {
      return parsed as GeocodeResult;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function App() {
  const [selected, setSelected] = useState<GeocodeResult | null>(null);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [, setNowTick] = useState(0);
  const products = useProducts();

  useEffect(() => {
    if (products.dataAge == null) return;
    const id = setInterval(() => setNowTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, [products.dataAge]);

  useEffect(() => {
    const saved = loadSavedLocation();
    if (saved && hasCredentials()) {
      setSelected(saved);
      void products.load({ ...DEFAULT_LOCATION, lat: saved.lat, lng: saved.lng });
    }
    // products.load is stable (useCallback in hook). Only run once on mount;
    // depending on the whole `products` object would loop because it's a new object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (r: GeocodeResult) => {
    if (!hasCredentials()) {
      setSettingsOpen(true);
      return;
    }
    try {
      localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(r));
    } catch {
      /* ignore */
    }
    setSelected(r);
    setFilters(INITIAL_FILTERS);
    void products.load({
      ...DEFAULT_LOCATION,
      lat: r.lat,
      lng: r.lng,
    });
  };

  const handleGoHome = () => {
    try {
      localStorage.removeItem(SAVED_LOCATION_KEY);
    } catch {
      /* ignore */
    }
    setSelected(null);
    setFilters(INITIAL_FILTERS);
    products.reset();
  };

  const handleRefresh = () => {
    if (!selected) return;
    void products.load(
      { ...DEFAULT_LOCATION, lat: selected.lat, lng: selected.lng },
      { force: true },
    );
  };

  const phase: "stores" | "products" =
    products.state === "loading-stores" ? "stores" : "products";
  const isLoading =
    products.state === "loading-stores" || products.state === "loading-products";
  const hasData = products.products.length > 0;
  const STALE_THRESHOLD_MS = 5 * 60 * 1000;
  const ageMs = products.dataAge ? Date.now() - products.dataAge : 0;
  const isStale =
    products.dataAge != null && hasData && !isLoading && ageMs > STALE_THRESHOLD_MS;
  const ageMinutes = Math.floor(ageMs / 60_000);

  return (
    <>
      {!selected && <BackgroundDots />}
      <button
        className={styles.settingsBtn}
        onClick={() => setSettingsOpen(true)}
        aria-label="Configuración"
        title="Configurar credenciales"
      >
        <Settings size={18} strokeWidth={1.8} />
      </button>

      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div key="hero" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <Hero onSelect={handleSelect} busy={products.state === "loading-stores"} />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <Hero
              compact
              onSelect={handleSelect}
              selectedAddress={shortAddress(selected.display_name)}
              onChangeAddress={handleGoHome}
              onGoHome={handleGoHome}
              onRefresh={handleRefresh}
              refreshing={isLoading}
            />

            <TopProgress
              visible={isLoading}
              phase={phase}
              progress={products.progress}
            />

            <StaleBanner
              visible={isStale}
              ageMinutes={ageMinutes}
              refreshing={isLoading}
              onRefresh={handleRefresh}
            />

            {hasData && (
              <>
                <CategoryRow
                  products={products.products}
                  selected={filters.categories}
                  onChange={(c) => setFilters({ ...filters, categories: c })}
                />
                <Toolbar
                  filters={filters}
                  onChange={setFilters}
                  total={products.products.length}
                  shown={getShownCount(products.products, filters)}
                />
                <ProductGrid products={products.products} filters={filters} />
              </>
            )}

            {isLoading && !hasData && (
              <LoadingState phase={phase} progress={products.progress} preview={[]} />
            )}

            {products.state === "error" && !hasData && (
              <ErrorState
                message={products.error ?? "Error desconocido"}
                isAuthError={products.isAuthError}
                onRetry={handleRefresh}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => {
          if (selected) handleRefresh();
        }}
      />

      <a
        className={styles.githubBtn}
        href="https://github.com/Harkor421/RappiOfertas"
        target="_blank"
        rel="noopener"
        aria-label="Ver en GitHub"
        title="Ver código en GitHub"
      >
        <GithubIcon size={18} />
      </a>

      <footer className={styles.footer}>
        <span className={styles.footerInner}>
          Hecho con <Heart size={12} strokeWidth={2.2} className={styles.heart} />
          <span className={styles.dot}>·</span>
          <a href="https://github.com/Harkor421/RappiOfertas" target="_blank" rel="noopener">
            Open source
          </a>
          <span className={styles.dot}>·</span>
          No afiliado a Rappi
        </span>
      </footer>
    </>
  );
}

function getShownCount(
  products: ReturnType<typeof useProducts>["products"],
  filters: Filters,
): number {
  const q = filters.query.trim().toLowerCase();
  return products.filter((p) => {
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
  }).length;
}
