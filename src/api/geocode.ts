import { CACHE_TTL, COUNTRY_CODE, NOMINATIM_ENDPOINT } from "../config";
import { cacheGet, cacheSet } from "./cache";

export interface GeocodeResult {
  lat: number;
  lng: number;
  display_name: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export async function geocode(query: string): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (!q) return [];
  const cacheKey = `geocode:${q.toLowerCase()}`;
  const cached = cacheGet<GeocodeResult[]>(cacheKey, CACHE_TTL.GEOCODE_MS);
  if (cached) return cached;

  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("countrycodes", COUNTRY_CODE);
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "0");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  const data = (await res.json()) as NominatimResult[];
  const results: GeocodeResult[] = data.map((r) => ({
    lat: Number(r.lat),
    lng: Number(r.lon),
    display_name: r.display_name,
  }));
  cacheSet(cacheKey, results);
  return results;
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
  const cacheKey = `reverse:${lat.toFixed(5)},${lng.toFixed(5)}`;
  const cached = cacheGet<GeocodeResult>(cacheKey, CACHE_TTL.GEOCODE_MS);
  if (cached) return cached;

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "json");
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "0");

  const fallback: GeocodeResult = { lat, lng, display_name: "Tu ubicación" };
  try {
    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) return fallback;
    const data = (await res.json()) as { display_name?: string };
    const result: GeocodeResult = {
      lat,
      lng,
      display_name: data.display_name || fallback.display_name,
    };
    cacheSet(cacheKey, result);
    return result;
  } catch {
    return fallback;
  }
}

export function getBrowserLocation(): Promise<GeocodeResult> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Tu navegador no soporta geolocalización."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const r = await reverseGeocode(lat, lng);
        resolve(r);
      },
      (err) => reject(new Error(err.message || "No se pudo obtener tu ubicación.")),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 },
    );
  });
}
