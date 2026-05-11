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

const env = import.meta.env;
const envCreds: RappiCredentials | null =
  env.VITE_RAPPI_AUTH && env.VITE_RAPPI_DEVICEID
    ? {
        authorization: env.VITE_RAPPI_AUTH,
        deviceid: env.VITE_RAPPI_DEVICEID,
        app_version: env.VITE_RAPPI_APP_VERSION || "1.161.2",
      }
    : null;

export const FALLBACK_CREDENTIALS: RappiCredentials | null = envCreds;
