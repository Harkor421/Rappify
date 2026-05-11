import { useCallback, useEffect, useRef, useState } from "react";
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
  load: (location: Location) => Promise<void>;
  reset: () => void;
}

export function useProducts(): UseProductsResult {
  const [state, setState] = useState<LoadState>("idle");
  const [products, setProducts] = useState<Product[]>([]);
  const [progress, setProgress] = useState<FetchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
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
  }, []);

  const load = useCallback(async (loc: Location) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setError(null);
    setIsAuthError(false);
    setProgress(null);
    setState("loading-stores");
    try {
      const location: Location = { ...DEFAULT_LOCATION, lat: loc.lat, lng: loc.lng };
      const stores = await fetchStores(location);
      if (ctrl.signal.aborted) return;
      setState("loading-products");
      const result = await fetchProducts(stores, {
        location,
        concurrency: FETCH_CONCURRENCY,
        onProgress: (p) => {
          if (!ctrl.signal.aborted) setProgress(p);
        },
        signal: ctrl.signal,
      });
      if (ctrl.signal.aborted) return;
      const sorted = result.products.sort(
        (a, b) => b.discount_percentage - a.discount_percentage,
      );
      setProducts(sorted);
      setState("ready");
    } catch (e) {
      if (ctrl.signal.aborted) return;
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setIsAuthError(e instanceof RappiAuthError);
      setState("error");
    }
  }, []);

  return { state, products, progress, error, isAuthError, load, reset };
}
