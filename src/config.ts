import type { Location, RappiCredentials } from "./types/rappi";

export const DEFAULT_LOCATION: Location = {
  lat: 11.0117458,
  lng: -74.8374738,
  store_type: "restaurant",
  is_prime: false,
  prime_config: { unlimited_shipping: false },
  states: ["opened", "unavailable", "closed"],
};

export const RAPPI_ENDPOINTS = {
  STORES_LIST:
    "https://services.grability.rappi.com/api/web-gateway/web/restaurants-bus/stores/catalog-paged/home/",
  STORES_FILTERS:
    "https://services.grability.rappi.com/api/web-gateway/web/restaurants-bus/stores/filters/",
  BRAND_BASE: "https://services.grability.rappi.com/api/restaurant-bus/store/brand/id",
} as const;

export const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

export const COUNTRY_CODE = "co";

export const CACHE_TTL = {
  STORES_MS: 5 * 60 * 1000,
  PRODUCTS_MS: 30 * 60 * 1000,
  BRAND_MS: 30 * 60 * 1000,
  GEOCODE_MS: 24 * 60 * 60 * 1000,
} as const;

export const FETCH_CONCURRENCY = 6;

// Public demo credentials shipped with Rappify. The account is intentionally
// shared so anyone cloning the repo can run the app without setup.
// Override locally via .env.local (VITE_RAPPI_AUTH / VITE_RAPPI_DEVICEID)
// or via the in-app Settings modal (which writes to localStorage).
const DEFAULT_CREDENTIALS: RappiCredentials = {
  authorization:
    "Bearer ft.gAAAAABqH2ILKUMRhFFx5duGvx6m-ftzomB8se22UIBdYxqHKRZRZat0GGBzACQtktvt2r9D0-cM7lg6FYen1TPvG5FUUuQIQMcsVB538e8CIzjMDKGfjh8FMtpmZ5Jft6HJqrFLfei1u8SOoBPaNOzRaVQomUZwQvFfQlSlgEWlCNf8hebOIn6sAMHtfSw6HT9rprJiMJ83YIX8rSHETwUSxrcbomM663ZDVJ-qqV7xI1L3MbdBKHUWG8-zMZDAz8Y0-nvVXtEO0uPFztexDX0c-4X9V75jV8yj0gy_5bvkFgrVTB9PkIcM9Q7yxbMlFHNd9HEPy66BK5IGxD_ZDdFzk3Vepk5-N7F_vtKIRoxv-u2rpkbCHqODpFYpfp9VnVgBlSs19ixBXc9VawbBZDga2mFS7V7eUA==",
  deviceid: "a61c9d41-4e2f-460b-a5ce-378c3baf4212",
  app_version: "1.156.0",
};

const env = import.meta.env;
export const FALLBACK_CREDENTIALS: RappiCredentials = {
  authorization: env.VITE_RAPPI_AUTH || DEFAULT_CREDENTIALS.authorization,
  deviceid: env.VITE_RAPPI_DEVICEID || DEFAULT_CREDENTIALS.deviceid,
  app_version: env.VITE_RAPPI_APP_VERSION || DEFAULT_CREDENTIALS.app_version,
};

// Shared-credentials sync: every client reads the bearer token from a
// GitHub Gist on boot and writes back when /ms/application-user/auth
// hands out a fresh one. This lets a single account power all visitors
// without each of them re-pasting after a token rotation.
//
// The gist is "secret" (unlisted) — only people with the URL can read.
// VITE_GIST_WRITE_TOKEN is a fine-grained PAT scoped to gists-only; if
// it leaks the worst-case is someone editing this single gist, which
// the next client refresh would correct anyway.
export const SHARED_TOKEN_GIST = {
  id: env.VITE_GIST_ID || "4020d5887f922fff218c5d0ef0d33db9",
  filename: env.VITE_GIST_FILE || "rappify-shared-credentials.json",
  owner: env.VITE_GIST_OWNER || "Harkor421",
  writeToken: env.VITE_GIST_WRITE_TOKEN || "",
} as const;
