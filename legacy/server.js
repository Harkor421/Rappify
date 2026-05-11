import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchOffers, fetchAllBrandsForStores, DEFAULT_LOCATION } from "./rappi.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const CACHE_TTL_MS = 5 * 60 * 1000;
const PRODUCTS_TTL_MS = 30 * 60 * 1000;
let cache = { at: 0, key: "", data: null };
let productsCache = { at: 0, key: "", data: null };
let productsInflight = null;

function cacheKey(loc) {
  return `${loc.lat},${loc.lng},${loc.store_type}`;
}

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/ofertas", async (req, res) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : DEFAULT_LOCATION.lat;
    const lng = req.query.lng ? Number(req.query.lng) : DEFAULT_LOCATION.lng;
    const location = { ...DEFAULT_LOCATION, lat, lng };
    const key = cacheKey(location);
    const fresh = req.query.fresh === "1";

    if (!fresh && cache.data && cache.key === key && Date.now() - cache.at < CACHE_TTL_MS) {
      res.set("X-Cache", "HIT");
      return res.json({ stores: cache.data, cached_at: cache.at, location });
    }

    const { stores } = await fetchOffers({ location });
    cache = { at: Date.now(), key, data: stores };
    res.set("X-Cache", "MISS");
    res.json({ stores, cached_at: cache.at, location });
  } catch (err) {
    console.error("Error /api/ofertas:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/productos", async (req, res) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : DEFAULT_LOCATION.lat;
    const lng = req.query.lng ? Number(req.query.lng) : DEFAULT_LOCATION.lng;
    const location = { ...DEFAULT_LOCATION, lat, lng };
    const key = cacheKey(location);
    const fresh = req.query.fresh === "1";

    if (!fresh && productsCache.data && productsCache.key === key && Date.now() - productsCache.at < PRODUCTS_TTL_MS) {
      res.set("X-Cache", "HIT");
      return res.json({ products: productsCache.data, cached_at: productsCache.at, location });
    }

    if (productsInflight && productsInflight.key === key) {
      const result = await productsInflight.promise;
      res.set("X-Cache", "INFLIGHT");
      return res.json({ products: result, cached_at: productsCache.at, location });
    }

    productsInflight = {
      key,
      promise: (async () => {
        let stores = cache.data;
        if (!stores || cache.key !== key || Date.now() - cache.at > CACHE_TTL_MS) {
          const r = await fetchOffers({ location });
          stores = r.stores;
          cache = { at: Date.now(), key, data: stores };
        }
        const sample = stores.filter((s) => s.brand_id);
        let lastLog = 0;
        const { products, total_brands, errors } = await fetchAllBrandsForStores(sample, {
          location,
          useCache: !fresh,
          concurrency: 4,
          onProgress: ({ done, total }) => {
            if (done - lastLog >= 10 || done === total) {
              lastLog = done;
              console.log(`  brands ${done}/${total}`);
            }
          },
        });
        console.log(`Productos: ${products.length} de ${total_brands} brands (${errors} errores)`);
        productsCache = { at: Date.now(), key, data: products };
        return products;
      })(),
    };

    try {
      const products = await productsInflight.promise;
      res.set("X-Cache", "MISS");
      res.json({ products, cached_at: productsCache.at, location });
    } finally {
      productsInflight = null;
    }
  } catch (err) {
    productsInflight = null;
    console.error("Error /api/productos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Rappi Ofertas → http://localhost:${PORT}`);
});
