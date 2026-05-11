import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const BASE = "https://services.grability.rappi.com/api/web-gateway/web/restaurants-bus";
export const ENDPOINT_LIST = `${BASE}/stores/catalog-paged/home/`;
export const ENDPOINT_OFFERS = `${BASE}/stores/filters/`;
const BRAND_BASE = "https://services.grability.rappi.com/api/restaurant-bus/store/brand/id";
const BRANDS_DIR = path.join("out", "brands");

export const DEFAULT_LOCATION = {
  lat: 11.0117458,
  lng: -74.8374738,
  store_type: "restaurant",
  is_prime: false,
  prime_config: { unlimited_shipping: false },
  states: ["opened", "unavailable", "closed"],
};

const HEADERS_FILE = "headers.json";
const IMAGES_BASE = "https://images.rappi.com";
const RAPPI_WEB = "https://www.rappi.com.co";

let cachedHeaders = null;
export async function loadHeaders() {
  if (cachedHeaders) return cachedHeaders;
  if (!existsSync(HEADERS_FILE)) {
    throw new Error(`Falta ${HEADERS_FILE}. Copia headers.example.json y completa los datos.`);
  }
  cachedHeaders = JSON.parse(await readFile(HEADERS_FILE, "utf8"));
  return cachedHeaders;
}

async function postJson(url, headers, body) {
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} en ${url}: ${text.slice(0, 400)}`);
  }
  return res.json();
}

function deepCollectStoreIds(node, acc = new Set()) {
  if (node == null) return acc;
  if (Array.isArray(node)) {
    for (const item of node) deepCollectStoreIds(item, acc);
    return acc;
  }
  if (typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
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

function extractStores(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.stores)) return data.stores;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  const found = [];
  (function walk(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      if (node.length && typeof node[0] === "object" && (node[0].store_id || node[0].id)) {
        found.push(...node);
        return;
      }
      for (const item of node) walk(item);
      return;
    }
    for (const v of Object.values(node)) walk(v);
  })(data);
  return found;
}

function imageUrl(filename, kind) {
  if (!filename) return null;
  if (filename.startsWith("http")) return filename;
  const folder =
    kind === "logo" ? "restaurants_logo" :
    kind === "product" ? "products" :
    "restaurants_background";
  return `${IMAGES_BASE}/${folder}/${filename}`;
}

function summarizeDiscounts(tags = []) {
  const summary = {
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
        title: t.card_details.title || t.title,
        description: t.card_details.description,
        applicable_stores: t.card_details.applicable_stores,
        ends_at: t.card_details.expires_at || t.card_details.ends_at,
        terms: t.card_details.terms_and_conditions,
        conditions_html: t.card_details.conditions,
      });
    }
    const isFreeShipping =
      t.type === "charge" ||
      /env(í|i)o\s+grat/i.test(t.tag || "") ||
      /free\s*ship/i.test(t.title || "");
    if (isFreeShipping) summary.free_shipping = true;
    if (t.type === "offer_by_product" || t.type === "percentage" || t.type_filter === "percentage_filter") {
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

function shapeStore(s) {
  const lat = Array.isArray(s?.location) ? s.location[1] : null;
  const lng = Array.isArray(s?.location) ? s.location[0] : null;
  const storeId = s?.store_id ?? s?.id;
  const slug = s?.friendly_url?.friendly_url;
  const url = slug
    ? `${RAPPI_WEB}/restaurantes/restaurante/${slug}-${storeId}`
    : `${RAPPI_WEB}/restaurantes/restaurante/${storeId}`;

  const discounts = summarizeDiscounts(s?.discount_tags);

  return {
    store_id: storeId,
    brand_id: s?.brand_id,
    name: s?.name || s?.brand_name,
    brand: s?.brand_name,
    logo: imageUrl(s?.logo, "logo"),
    background: s?.full_background || imageUrl(s?.background, "background"),
    eta: s?.eta,
    eta_value: s?.eta_value,
    rating: Number(s?.rating?.score ?? 0),
    reviews: Number(s?.rating?.total_reviews ?? 0),
    distance_m: s?.distance_v2 ?? null,
    delivery_price: s?.delivery_price ?? 0,
    address: s?.address,
    lat,
    lng,
    is_open: s?.is_currently_available === true || s?.status === "OPEN",
    is_new: s?.is_new || s?.new || false,
    is_exclusive: s?.is_rappi_exclusive || s?.is_exclusive || false,
    tier: s?.tier,
    delivery_methods: s?.delivery_methods || [],
    url,
    discounts,
  };
}

function shapeProduct(p, store) {
  const discounts = Array.isArray(p?.discounts) ? p.discounts : [];
  const finalPrice =
    discounts[0]?.price != null && discounts[0].price < p?.real_price
      ? discounts[0].price
      : p?.price ?? p?.real_price ?? 0;
  const original = Number(p?.real_price ?? p?.price ?? 0);
  const pct = Number(p?.discount_percentage ?? 0);
  const computedPct = original > 0 && finalPrice < original
    ? Math.round(((original - finalPrice) / original) * 100)
    : 0;
  const isPrime = discounts.some((d) => d?.is_prime_exclusive);
  return {
    id: p?.id || `${p?.store_id}_${p?.product_id}`,
    product_id: p?.product_id,
    name: p?.name,
    image: imageUrl(p?.image, "product"),
    price: Number(finalPrice),
    real_price: original,
    discount_percentage: pct || computedPct,
    is_prime_exclusive: isPrime,
    is_popular: !!p?.is_popular,
    minimum_price: p?.minimum_price > 0 ? p.minimum_price : null,
    store_id: store.store_id,
    store_name: store.name,
    store_brand: store.brand,
    store_logo: store.logo,
    store_url: store.url,
    store_eta: store.eta,
    store_distance_m: store.distance_m,
    store_rating: store.rating,
    store_free_shipping: store.discounts?.free_shipping || false,
  };
}

export function extractProductsFromBrand(brandJson, store) {
  const seen = new Map();
  const collect = (arr) => {
    if (!Array.isArray(arr)) return;
    for (const p of arr) {
      if (!p || !p.id) continue;
      if (!seen.has(p.id)) seen.set(p.id, p);
    }
  };
  for (const c of brandJson?.carousels_v2 || []) collect(c.products);
  for (const c of brandJson?.corridors || []) collect(c.products);
  const all = [...seen.values()].map((p) => shapeProduct(p, store));
  return all.filter((p) => p.discount_percentage > 0 || p.real_price > p.price);
}

export async function fetchAllBrandsForStores(stores, { location = DEFAULT_LOCATION, headers, concurrency = 4, useCache = true, onProgress } = {}) {
  const hdrs = headers || (await loadHeaders());
  const byBrand = new Map();
  for (const s of stores) {
    if (!s?.brand_id) continue;
    if (!byBrand.has(s.brand_id)) byBrand.set(s.brand_id, []);
    byBrand.get(s.brand_id).push(s);
  }

  const brandIds = [...byBrand.keys()];
  const products = [];
  let done = 0;
  let errors = 0;

  const worker = async (id) => {
    try {
      const data = await fetchBrand(id, { headers: hdrs, location, useCache });
      const owners = byBrand.get(id);
      const owner = owners[0];
      const shaped = extractProductsFromBrand(data, owner);
      products.push(...shaped);
    } catch (e) {
      errors++;
    } finally {
      done++;
      if (onProgress) onProgress({ done, total: brandIds.length, errors });
    }
  };

  const queue = [...brandIds];
  const runners = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const id = queue.shift();
      await worker(id);
    }
  });
  await Promise.all(runners);

  return { products, total_brands: brandIds.length, errors };
}

export async function fetchBrand(brandId, { headers, location = DEFAULT_LOCATION, useCache = true } = {}) {
  await mkdir(BRANDS_DIR, { recursive: true });
  const file = path.join(BRANDS_DIR, `${brandId}.json`);
  if (useCache && existsSync(file)) {
    return JSON.parse(await readFile(file, "utf8"));
  }
  const hdrs = headers || (await loadHeaders());
  const body = {
    is_prime: location.is_prime,
    lat: location.lat,
    lng: location.lng,
    store_type: location.store_type,
    prime_config: location.prime_config,
  };
  const data = await postJson(`${BRAND_BASE}/${brandId}`, hdrs, body);
  await writeFile(file, JSON.stringify(data, null, 2));
  return data;
}

export async function fetchOffers({ headers, location = DEFAULT_LOCATION } = {}) {
  const hdrs = headers || (await loadHeaders());

  const list = await postJson(ENDPOINT_LIST, hdrs, location);
  const ids = [...deepCollectStoreIds(list)];
  if (ids.length === 0) {
    return { ids: [], stores: [], raw: { list, offers: null } };
  }

  const offers = await postJson(ENDPOINT_OFFERS, hdrs, {
    ...location,
    filters: { discounts: { types: [] } },
    store_ids: ids,
  });

  const rawStores = extractStores(offers);
  const stores = rawStores.map(shapeStore).filter((s) => s.store_id);

  return { ids, stores, raw: { list, offers } };
}
