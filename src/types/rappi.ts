export interface Location {
  lat: number;
  lng: number;
  store_type: "restaurant";
  is_prime: boolean;
  prime_config: { unlimited_shipping: boolean };
  states: string[];
}

export interface RappiCredentials {
  authorization: string;
  deviceid: string;
  app_version: string;
}

export interface DiscountTag {
  id: number;
  type: string;
  tag: string;
  title?: string;
  description?: string;
  value?: number;
  color?: string;
  is_prime_exclusive?: boolean;
  card_details?: {
    title?: string;
    description?: string;
    image?: string;
    ends_at?: string;
    expires_at?: string;
    applicable_stores?: string;
    terms_and_conditions?: string;
    conditions?: string;
  };
}

export interface RawStore {
  store_id: number;
  id?: string;
  brand_id?: number;
  brand_name?: string;
  name?: string;
  logo?: string;
  background?: string;
  full_background?: string;
  eta?: string;
  eta_value?: number;
  rating?: { score: number; total_reviews: number };
  distance_v2?: number;
  delivery_price?: number;
  address?: string;
  location?: [number, number];
  is_currently_available?: boolean;
  status?: string;
  is_new?: boolean;
  new?: boolean;
  is_rappi_exclusive?: boolean;
  is_exclusive?: boolean;
  tier?: string;
  delivery_methods?: string[];
  friendly_url?: { friendly_url?: string; store_id?: number };
  discount_tags?: DiscountTag[];
}

export interface DiscountSummary {
  free_shipping: boolean;
  best_percent: number;
  best_value: number;
  has_prime: boolean;
  badges: { text: string; color: string; type: string }[];
  cards: {
    title: string;
    description?: string;
    applicable_stores?: string;
    ends_at?: string;
    terms?: string;
    conditions_html?: string;
  }[];
}

export interface Store {
  store_id: number;
  brand_id: number | undefined;
  name: string;
  brand: string | undefined;
  logo: string | null;
  background: string | null;
  eta: string | undefined;
  eta_value: number | undefined;
  rating: number;
  reviews: number;
  distance_m: number | null;
  delivery_price: number;
  address: string | undefined;
  lat: number | null;
  lng: number | null;
  is_open: boolean;
  is_new: boolean;
  is_exclusive: boolean;
  tier: string | undefined;
  delivery_methods: string[];
  url: string;
  discounts: DiscountSummary;
}

export interface RawProduct {
  id: string;
  product_id: number;
  name: string;
  image?: string;
  real_price: number;
  price: number;
  store_id: number;
  is_popular?: boolean;
  discount_percentage?: number;
  discounts?: {
    type: string;
    value?: number;
    price?: number;
    is_prime_exclusive?: boolean;
  }[];
  minimum_price?: number;
}

export interface BrandTag {
  id: number;
  name: string;
}

export interface BrandResponse {
  store_id?: number;
  brand_id?: number;
  brand_name?: string;
  tags?: BrandTag[];
  carousels_v2?: { products?: RawProduct[] }[];
  corridors?: { products?: RawProduct[] }[];
}

export interface Product {
  id: string;
  product_id: number;
  name: string;
  image: string | null;
  price: number;
  real_price: number;
  discount_percentage: number;
  is_prime_exclusive: boolean;
  is_popular: boolean;
  minimum_price: number | null;
  store_id: number;
  store_name: string;
  store_brand: string | undefined;
  store_logo: string | null;
  store_url: string;
  store_eta: string | undefined;
  store_distance_m: number | null;
  store_rating: number;
  store_free_shipping: boolean;
  categories: string[];
}

export interface FetchProgress {
  done: number;
  total: number;
  errors: number;
}
