import { CACHE_TTL, DEFAULT_LOCATION, RAPPI_ENDPOINTS } from "../config";
import type {
  BrandResponse,
  DiscountSummary,
  DiscountTag,
  FetchProgress,
  Location,
  Product,
  RappiCredentials,
  RawProduct,
  RawStore,
  Store,
} from "../types/rappi";
import { runWithConcurrency } from "../utils/concurrency";
import { cacheGet, cacheSet } from "./cache";
import { buildHeaders, getCredentials } from "./credentials";

export class RappiAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RappiAuthError";
  }
}

const IMAGES_BASE = "https://images.rappi.com";
const RAPPI_WEB = "https://www.rappi.com.co";

function requireCreds(): RappiCredentials {
  const c = getCredentials();
  if (!c?.authorization || !c?.deviceid) {
    throw new RappiAuthError(
      "Faltan credenciales de Rappi. Configúralas desde el botón de ajustes.",
    );
  }
  return c;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const creds = requireCreds();
  const res = await fetch(url, {
    method: "POST",
    headers: buildHeaders(creds),
    body: JSON.stringify(body),
  });
  if (res.status === 401 || res.status === 403) {
    throw new RappiAuthError(
      "El token de Rappi expiró o es inválido. Actualízalo en ajustes.",
    );
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} en ${url}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

function imageUrl(file: string | undefined, kind: "logo" | "background" | "product"): string | null {
  if (!file) return null;
  if (file.startsWith("http")) return file;
  const folder =
    kind === "logo"
      ? "restaurants_logo"
      : kind === "product"
        ? "products"
        : "restaurants_background";
  return `${IMAGES_BASE}/${folder}/${file}`;
}

function summarizeDiscounts(tags: DiscountTag[] = []): DiscountSummary {
  const summary: DiscountSummary = {
    free_shipping: false,
    best_percent: 0,
    best_value: 0,
    has_prime: false,
    badges: [],
    cards: [],
  };
  for (const t of tags) {
    if (!t) continue;
    if (t.is_prime_exclusive) summary.has_prime = true;
    summary.badges.push({
      text: t.tag,
      color: t.color || "#76d548",
      type: t.type,
    });
    if (t.card_details) {
      summary.cards.push({
        title: t.card_details.title || t.title || "",
        ...(t.card_details.description && { description: t.card_details.description }),
        ...(t.card_details.applicable_stores && {
          applicable_stores: t.card_details.applicable_stores,
        }),
        ...((t.card_details.expires_at || t.card_details.ends_at) && {
          ends_at: t.card_details.expires_at || t.card_details.ends_at,
        }),
        ...(t.card_details.terms_and_conditions && { terms: t.card_details.terms_and_conditions }),
        ...(t.card_details.conditions && { conditions_html: t.card_details.conditions }),
      });
    }
    const isFreeShipping =
      t.type === "charge" ||
      /env(í|i)o\s+grat/i.test(t.tag || "") ||
      /free\s*ship/i.test(t.title || "");
    if (isFreeShipping) summary.free_shipping = true;
    if (
      t.type === "offer_by_product" ||
      t.type === "percentage" ||
      /percentage/i.test(t.type)
    ) {
      const v = Number(t.value || 0);
      if (v > summary.best_percent) summary.best_percent = v;
    }
    if (t.type === "value") {
      const v = Number(t.value || 0);
      if (v > summary.best_value) summary.best_value = v;
    }
  }
  return summary;
}

function shapeStore(s: RawStore): Store {
  const lat = Array.isArray(s.location) ? s.location[1] : null;
  const lng = Array.isArray(s.location) ? s.location[0] : null;
  const slug = s.friendly_url?.friendly_url;
  const url = slug
    ? `${RAPPI_WEB}/restaurantes/restaurante/${slug}-${s.store_id}`
    : `${RAPPI_WEB}/restaurantes/restaurante/${s.store_id}`;

  return {
    store_id: s.store_id,
    brand_id: s.brand_id,
    name: s.name || s.brand_name || `Tienda ${s.store_id}`,
    brand: s.brand_name,
    logo: imageUrl(s.logo, "logo"),
    background: s.full_background || imageUrl(s.background, "background"),
    eta: s.eta,
    eta_value: s.eta_value,
    rating: Number(s.rating?.score ?? 0),
    reviews: Number(s.rating?.total_reviews ?? 0),
    distance_m: s.distance_v2 ?? null,
    delivery_price: s.delivery_price ?? 0,
    address: s.address,
    lat,
    lng,
    is_open: s.is_currently_available === true || s.status === "OPEN",
    is_new: !!(s.is_new || s.new),
    is_exclusive: !!(s.is_rappi_exclusive || s.is_exclusive),
    tier: s.tier,
    delivery_methods: s.delivery_methods || [],
    url,
    discounts: summarizeDiscounts(s.discount_tags),
  };
}

function shapeProduct(p: RawProduct, store: Store, categories: string[]): Product {
  const discounts = Array.isArray(p.discounts) ? p.discounts : [];
  const discountedPrice = discounts[0]?.price;
  const finalPrice =
    discountedPrice != null && discountedPrice < p.real_price
      ? discountedPrice
      : (p.price ?? p.real_price ?? 0);
  const original = Number(p.real_price ?? p.price ?? 0);
  const pct = Number(p.discount_percentage ?? 0);
  const computedPct =
    original > 0 && finalPrice < original ? Math.round(((original - finalPrice) / original) * 100) : 0;
  const isPrime = discounts.some((d) => d.is_prime_exclusive);
  return {
    id: p.id || `${p.store_id}_${p.product_id}`,
    product_id: p.product_id,
    name: p.name,
    image: imageUrl(p.image, "product"),
    price: Number(finalPrice),
    real_price: original,
    discount_percentage: pct || computedPct,
    is_prime_exclusive: isPrime,
    is_popular: !!p.is_popular,
    minimum_price: p.minimum_price && p.minimum_price > 0 ? p.minimum_price : null,
    store_id: store.store_id,
    store_name: store.name,
    store_brand: store.brand,
    store_logo: store.logo,
    store_url: store.url,
    store_eta: store.eta,
    store_distance_m: store.distance_m,
    store_rating: store.rating,
    store_free_shipping: store.discounts.free_shipping,
    categories,
  };
}

function deepCollectStoreIds(node: unknown, acc = new Set<number>()): Set<number> {
  if (node == null) return acc;
  if (Array.isArray(node)) {
    for (const item of node) deepCollectStoreIds(item, acc);
    return acc;
  }
  if (typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if ((k === "store_id" || k === "id") && (typeof v === "number" || typeof v === "string")) {
        const n = Number(v);
        if (Number.isFinite(n) && n > 1_000_000) acc.add(n);
      }
      if (k === "store_ids" && Array.isArray(v)) {
        for (const id of v) {
          const n = Number(id);
          if (Number.isFinite(n)) acc.add(n);
        }
      }
      deepCollectStoreIds(v, acc);
    }
  }
  return acc;
}

function extractStores(data: unknown): RawStore[] {
  if (Array.isArray(data)) return data as RawStore[];
  const d = data as Record<string, unknown>;
  if (Array.isArray(d?.stores)) return d.stores as RawStore[];
  if (Array.isArray(d?.data)) return d.data as RawStore[];
  if (Array.isArray(d?.results)) return d.results as RawStore[];
  const found: RawStore[] = [];
  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      const first = node[0] as Record<string, unknown> | undefined;
      if (first && (first.store_id || first.id)) {
        found.push(...(node as RawStore[]));
        return;
      }
      for (const item of node) walk(item);
      return;
    }
    for (const v of Object.values(node as Record<string, unknown>)) walk(v);
  };
  walk(data);
  return found;
}

function locKey(loc: Location): string {
  return `${loc.lat.toFixed(5)},${loc.lng.toFixed(5)}`;
}

export async function fetchStores(location: Location = DEFAULT_LOCATION): Promise<Store[]> {
  const cacheKey = `stores:${locKey(location)}`;
  const cached = cacheGet<Store[]>(cacheKey, CACHE_TTL.STORES_MS);
  if (cached) return cached;

  const list = await postJson<unknown>(RAPPI_ENDPOINTS.STORES_LIST, {
    lat: location.lat,
    lng: location.lng,
    store_type: location.store_type,
    is_prime: location.is_prime,
    prime_config: location.prime_config,
    states: location.states,
  });

  const ids = [...deepCollectStoreIds(list)];
  if (ids.length === 0) return [];

  const offers = await postJson<unknown>(RAPPI_ENDPOINTS.STORES_FILTERS, {
    lat: location.lat,
    lng: location.lng,
    store_type: location.store_type,
    is_prime: location.is_prime,
    prime_config: location.prime_config,
    states: location.states,
    filters: { discounts: { types: [] } },
    store_ids: ids,
  });

  const stores = extractStores(offers).map(shapeStore).filter((s) => s.store_id);
  cacheSet(cacheKey, stores);
  return stores;
}

export async function fetchBrand(
  brandId: number,
  location: Location = DEFAULT_LOCATION,
): Promise<BrandResponse> {
  const cacheKey = `brand:${brandId}:${locKey(location)}`;
  const cached = cacheGet<BrandResponse>(cacheKey, CACHE_TTL.BRAND_MS);
  if (cached) return cached;

  const data = await postJson<BrandResponse>(`${RAPPI_ENDPOINTS.BRAND_BASE}/${brandId}`, {
    is_prime: location.is_prime,
    lat: location.lat,
    lng: location.lng,
    store_type: location.store_type,
    prime_config: location.prime_config,
  });
  cacheSet(cacheKey, data);
  return data;
}

export function extractDiscountedProducts(brand: BrandResponse, store: Store): Product[] {
  const seen = new Map<string, RawProduct>();
  const collect = (arr?: RawProduct[]): void => {
    if (!Array.isArray(arr)) return;
    for (const p of arr) {
      if (!p?.id) continue;
      if (!seen.has(p.id)) seen.set(p.id, p);
    }
  };
  for (const c of brand.carousels_v2 || []) collect(c.products);
  for (const c of brand.corridors || []) collect(c.products);
  const categories = (brand.tags || []).map((t) => t.name).filter(Boolean);
  return [...seen.values()]
    .map((p) => shapeProduct(p, store, categories))
    .filter((p) => p.discount_percentage > 0 || p.real_price > p.price);
}

export interface FetchProductsResult {
  products: Product[];
  total_brands: number;
  errors: number;
}

export async function fetchProducts(
  stores: Store[],
  options: {
    location?: Location;
    concurrency?: number;
    onProgress?: (p: FetchProgress) => void;
    signal?: AbortSignal;
  } = {},
): Promise<FetchProductsResult> {
  const { location = DEFAULT_LOCATION, concurrency = 6, onProgress, signal } = options;
  const byBrand = new Map<number, Store[]>();
  for (const s of stores) {
    if (!s.brand_id) continue;
    const existing = byBrand.get(s.brand_id);
    if (existing) existing.push(s);
    else byBrand.set(s.brand_id, [s]);
  }
  const brandIds = [...byBrand.keys()];
  const products: Product[] = [];
  let done = 0;
  let errors = 0;

  await runWithConcurrency(
    brandIds,
    async (brandId) => {
      if (signal?.aborted) return;
      try {
        const data = await fetchBrand(brandId, location);
        const owners = byBrand.get(brandId);
        if (!owners?.length) return;
        const owner = owners[0]!;
        products.push(...extractDiscountedProducts(data, owner));
      } catch (e) {
        if (e instanceof RappiAuthError) throw e;
        errors++;
      } finally {
        done++;
        onProgress?.({ done, total: brandIds.length, errors });
      }
    },
    concurrency,
  );

  return { products, total_brands: brandIds.length, errors };
}
