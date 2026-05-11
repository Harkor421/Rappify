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
    "Bearer ft.gAAAAABqAT9PTKJBPGQbN7deggGuHjK2VSJYG3-NjP2WNuTxD04PL_FmIup3nZ6w9Aivcob5b-52qdkVtKSThiPLawGMl1f3HOGsuapTCMfOvpVeELYNdVrbTbFW-Ymu35F5hy6dh_SRQ1yfR7zCfjXCbCZCCsuXhWxN__ftSuAozdHq3EOtvlOzP2EvGSQDzJk4nazXuGnsruEqd1ohwqLtcrPzQNRLg6YFy9VCMIzp1hz3vjBdYwSCJPq_7WBqLhBqSrtZ7B5LhomHN8C5ZWg7BUXxfW8gCgJO1oQzgMc1R3zn9X4L8mxeq0ndUoP-kVO1Zy7m-redFPxakzrxBjHT0CkR0N4cd-bUcEt7i1IzRKa19_pOW7TXcOQniVvUb6Q5ocluQ3_87qWvu7VvItD_rxCK788Beg==",
  deviceid: "1a20f853-4810-4017-a413-634e18698b64R",
  app_version: "1.161.2",
};

const env = import.meta.env;
export const FALLBACK_CREDENTIALS: RappiCredentials = {
  authorization: env.VITE_RAPPI_AUTH || DEFAULT_CREDENTIALS.authorization,
  deviceid: env.VITE_RAPPI_DEVICEID || DEFAULT_CREDENTIALS.deviceid,
  app_version: env.VITE_RAPPI_APP_VERSION || DEFAULT_CREDENTIALS.app_version,
};
