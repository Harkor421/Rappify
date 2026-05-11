import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fetchOffers } from "./rappi.js";

const OUT_DIR = "out";

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");

  console.log("Consultando Rappi...");
  const { ids, stores, raw } = await fetchOffers();

  await writeFile(path.join(OUT_DIR, `lista-${ts}.json`), JSON.stringify(raw.list, null, 2));
  if (raw.offers) {
    await writeFile(path.join(OUT_DIR, `ofertas-${ts}.json`), JSON.stringify(raw.offers, null, 2));
  }
  await writeFile(path.join(OUT_DIR, `stores-${ts}.json`), JSON.stringify(stores, null, 2));

  const withDiscount = stores.filter((s) => s.discounts.badges.length > 0);
  withDiscount.sort((a, b) => b.rating - a.rating);

  console.log(`\nIDs: ${ids.length}  Tiendas procesadas: ${stores.length}  Con promo: ${withDiscount.length}\n`);
  for (const s of withDiscount.slice(0, 30)) {
    const tags = s.discounts.badges.map((b) => b.text).join(" | ");
    console.log(`• [${s.store_id}] ${s.name}  ★${s.rating}  ${s.eta}  ${tags}`);
  }
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
