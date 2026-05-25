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
    "Bearer ft.gAAAAABqE_XPbM-8vlYGD8hpV4H_Nw6IStMQ8aP6fzsm3tVG0OgoxfjxSWhSo4bOx82eL6wjSNyytUEzqzmOBXKjMUubGNJ6-nDR1A1n0Jlaanux2-_mbFxCjOfM9do_ofnZUwMxwh_4qzaN6InTaiUKkxCKm5TIoTHS7vjWwsdoqGSsH1BIWjCdSuCAK8EBYcg6MGVif4rqFNRk0aTkTpTrs2T1KY5WX4t2jOYZT8AlLz41hUBDTrkv0uwK_NypAQq0fNshZOJ1f594oX4sg-agzPOPfC7WXp76lRDPQVd4O6zxzV8F_1ctqoiU7iOkOpnXhCznu5RudrlB62pVj-NNIFeL3IJAVrLA8bBHdMVvVZ_dcPm55jD16PhoH3KUX8EkADY1juYxaxYKsQWFLuqD8m1UtPO5sw==",
  deviceid: "de1f3359-277e-4239-832a-b9165fa80e1a",
  app_version: "1.161.2",
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
