import { useCallback, useEffect, useRef, useState } from "react";
import { cacheGetEntry, cacheSet } from "../api/cache";
import { fetchProducts, fetchStores, RappiAuthError } from "../api/rappi";
import { DEFAULT_LOCATION, FETCH_CONCURRENCY } from "../config";
import type { FetchProgress, Location, Product } from "../types/rappi";

export type LoadState = "idle" | "loading-stores" | "loading-products" | "ready" | "error";

export interface UseProductsResult {
  state: LoadState;
  products: Product[];
  progress: FetchProgress | null;
  error: string | null;
  isAuthError: boolean;
  dataAge: number | null;
  load: (location: Location, opts?: { force?: boolean }) => Promise<void>;
  reset: () => void;
}

function productsCacheKey(loc: Location): string {
  return `products:${loc.lat.toFixed(5)},${loc.lng.toFixed(5)}`;
}

export function useProducts(): UseProductsResult {
  const [state, setState] = useState<LoadState>("idle");
  const [products, setProducts] = useState<Product[]>([]);
  const [progress, setProgress] = useState<FetchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [dataAge, setDataAge] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState("idle");
    setProducts([]);
    setProgress(null);
    setError(null);
    setIsAuthError(false);
    setDataAge(null);
  }, []);

  const load = useCallback(async (loc: Location, opts: { force?: boolean } = {}) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const location: Location = { ...DEFAULT_LOCATION, lat: loc.lat, lng: loc.lng };
    const cacheKey = productsCacheKey(location);

    if (!opts.force) {
      const cached = cacheGetEntry<Product[]>(cacheKey);
      if (cached?.value && Array.isArray(cached.value) && cached.value.length > 0) {
        setProducts(cached.value);
        setDataAge(cached.t);
        setProgress(null);
        setError(null);
        setIsAuthError(false);
        setState("ready");
        return;
      }
    }

    setError(null);
    setIsAuthError(false);
    setProgress(null);
    setProducts([]);
    setDataAge(null);
    setState("loading-stores");
    try {
      const stores = await fetchStores(location);
      if (ctrl.signal.aborted) return;
      setState("loading-products");
      const result = await fetchProducts(stores, {
        location,
        concurrency: FETCH_CONCURRENCY,
        onProgress: (p) => {
          if (!ctrl.signal.aborted) setProgress(p);
        },
        onBatch: (partial) => {
          if (ctrl.signal.aborted) return;
          // Sort each partial batch so the user sees the top deals first
          // even mid-fetch. Sort is O(n log n) on a few hundred items —
          // dwarfed by the network cost it's overlapping with.
          const sorted = [...partial].sort(
            (a, b) => b.discount_percentage - a.discount_percentage,
          );
          setProducts(sorted);
        },
        signal: ctrl.signal,
      });
      if (ctrl.signal.aborted) return;
      const sorted = result.products.sort(
        (a, b) => b.discount_percentage - a.discount_percentage,
      );
      const now = Date.now();
      cacheSet(cacheKey, sorted);
      setProducts(sorted);
      setDataAge(now);
      setState("ready");
    } catch (e) {
      if (ctrl.signal.aborted) return;
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setIsAuthError(e instanceof RappiAuthError);
      setState("error");
    }
  }, []);

  return { state, products, progress, error, isAuthError, dataAge, load, reset };
}
