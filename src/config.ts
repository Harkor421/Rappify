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
    "Bearer ft.gAAAAABqApwGMbRWYCA9RCVYHT5ukR5BzNL7Dkv43lFVWg6PQWQmwY6qFN7H4gjJp5lJJWbOK6DTooQ1NEEDADS-Z_nberwTLqoHpo4OFiDBkr_dTAFPYshzEmMM4fY4NdmYO0PZvYMpa-c9En1pCPlIMDoUSvtFFODKyFCJs8gC0HTNGbA3uC_f4M3GipegL68V_JcnYi_RfiMrtSGsIBbIMmUrKO284_KD5F_Cj3jhm0xwx2DceKZsXoHJLEG3YN0weQgf41Vhcn6612ibukZLL75aMM9yfI0RRk4xExrig5SXGUNv-CQzFwrb41E3s1l4eY0ww5Cg_UgcM8X0EcNo-uKjPWX2pEh_WVoaxudldTrU00cWdq35G_98VwhCDFeX9xEA64D_JaoxKrQfiMDH5Qj9plwkvQ==",
  deviceid: "4f6aff85-ccfe-4bfd-8f4b-f742ac962f02",
  app_version: "1.161.2",
};

const env = import.meta.env;
export const FALLBACK_CREDENTIALS: RappiCredentials = {
  authorization: env.VITE_RAPPI_AUTH || DEFAULT_CREDENTIALS.authorization,
  deviceid: env.VITE_RAPPI_DEVICEID || DEFAULT_CREDENTIALS.deviceid,
  app_version: env.VITE_RAPPI_APP_VERSION || DEFAULT_CREDENTIALS.app_version,
};
