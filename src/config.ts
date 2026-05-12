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
    "Bearer ft.gAAAAABqApsfciKOzm4U3_AGJOzZtSFBaXH8Q0Iuv1Ri9LiEAwKUER4VnGJfolOsSySMPu589aqM0Gem3wgeI_S7IwvVQMJvRgzdOhU6hNg6685ijpksAVMezUkr5G5F6ijE9r8DzmNkp2DrMokYwsWk_kyQOTStAMwZGlu0-wl8sva_ZN3ei83_jec2lErnzRC4OZRogaHbGlyYrDog9923LIj6YPsCArYzjg8jnr1lxVpXgr4-wfrhm8cK18Y-4JoJTIq1PcdGnoVuKRubgy73rHDKDnXzGelme9OpUWYNRHsG4rNBlHD8657nDMS-qgenP0UsHKZXhhjXHxDiwe66GCQMJgf_dN6hyhV0_6LE1RIgC77xylSG8_73z5jqmeZGCSbzAS4QyYFnbzVr2KKoGcajxjJSSQ==",
  deviceid: "1a20f853-4810-4017-a413-634e18698b64R",
  app_version: "1.161.2",
};

const env = import.meta.env;
export const FALLBACK_CREDENTIALS: RappiCredentials = {
  authorization: env.VITE_RAPPI_AUTH || DEFAULT_CREDENTIALS.authorization,
  deviceid: env.VITE_RAPPI_DEVICEID || DEFAULT_CREDENTIALS.deviceid,
  app_version: env.VITE_RAPPI_APP_VERSION || DEFAULT_CREDENTIALS.app_version,
};
