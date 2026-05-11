const grid = document.getElementById("grid");
const gridP = document.getElementById("grid-p");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");
const metaCount = document.getElementById("meta-count");
const metaCache = document.getElementById("meta-cache");
const refreshBtn = document.getElementById("refresh");
const search = document.getElementById("search");
const sortSel = document.getElementById("sort");
const fDiscount = document.getElementById("f-discount");
const fFree = document.getElementById("f-free");
const fOpen = document.getElementById("f-open");
const fExclusive = document.getElementById("f-exclusive");
const searchP = document.getElementById("search-p");
const sortP = document.getElementById("sort-p");
const fPopular = document.getElementById("f-popular");
const fFreeP = document.getElementById("f-free-p");
const fPrime = document.getElementById("f-prime");
const dialog = document.getElementById("detail");
const dialogContent = document.getElementById("detail-content");

const fmtCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

let allStores = [];
let allProducts = [];
let view = "products";
let storesLoaded = false;
let storesLoading = false;
let productsLoaded = false;
let productsLoading = false;

async function loadStores(fresh = false) {
  if (storesLoading) return;
  storesLoading = true;
  loader.textContent = "Cargando ofertas...";
  loader.classList.remove("hidden");
  errorBox.classList.add("hidden");
  grid.innerHTML = "";
  try {
    const res = await fetch(`/api/ofertas${fresh ? "?fresh=1" : ""}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allStores = data.stores || [];
    storesLoaded = true;
    const cacheState = res.headers.get("X-Cache") || "?";
    const ago = data.cached_at ? Math.round((Date.now() - data.cached_at) / 1000) : 0;
    metaCache.textContent = `${cacheState} · ${ago}s`;
    render();
  } catch (e) {
    errorBox.textContent = `Error: ${e.message}`;
    errorBox.classList.remove("hidden");
  } finally {
    storesLoading = false;
    loader.classList.add("hidden");
  }
}

async function loadProducts(fresh = false) {
  if (productsLoading) return;
  productsLoading = true;
  loader.textContent = "Cargando productos (puede tardar la primera vez)...";
  loader.classList.remove("hidden");
  errorBox.classList.add("hidden");
  gridP.innerHTML = "";
  try {
    const res = await fetch(`/api/productos${fresh ? "?fresh=1" : ""}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allProducts = data.products || [];
    productsLoaded = true;
    const cacheState = res.headers.get("X-Cache") || "?";
    const ago = data.cached_at ? Math.round((Date.now() - data.cached_at) / 1000) : 0;
    metaCache.textContent = `${cacheState} · ${ago}s`;
    renderProducts();
  } catch (e) {
    errorBox.textContent = `Error: ${e.message}`;
    errorBox.classList.remove("hidden");
  } finally {
    productsLoading = false;
    loader.classList.add("hidden");
  }
}

function applyFilters(stores) {
  const q = search.value.trim().toLowerCase();
  return stores.filter((s) => {
    if (fDiscount.checked && (!s.discounts || s.discounts.badges.length === 0)) return false;
    if (fFree.checked && !s.discounts?.free_shipping) return false;
    if (fOpen.checked && !s.is_open) return false;
    if (fExclusive.checked && !s.is_exclusive) return false;
    if (q && !(s.name || "").toLowerCase().includes(q) && !(s.brand || "").toLowerCase().includes(q)) return false;
    return true;
  });
}

function applySort(stores) {
  const mode = sortSel.value;
  const arr = [...stores];
  const cmp = {
    discount_pct: (a, b) => (b.discounts?.best_percent || 0) - (a.discounts?.best_percent || 0),
    discount_value: (a, b) => (b.discounts?.best_value || 0) - (a.discounts?.best_value || 0),
    free_shipping: (a, b) => Number(b.discounts?.free_shipping) - Number(a.discounts?.free_shipping),
    rating: (a, b) => (b.rating || 0) - (a.rating || 0),
    eta: (a, b) => (a.eta_value || 9999) - (b.eta_value || 9999),
    distance: (a, b) => (a.distance_m ?? 1e9) - (b.distance_m ?? 1e9),
    delivery_price: (a, b) => (a.delivery_price || 0) - (b.delivery_price || 0),
  }[mode];
  return arr.sort(cmp);
}

function tagClass(type) {
  if (type === "charge") return "charge";
  if (type === "value") return "value";
  return "";
}

function renderTags(badges, max = 3) {
  return badges
    .slice(0, max)
    .map((b) => `<span class="tag ${tagClass(b.type)}">${escape(b.text || "")}</span>`)
    .join("");
}

function renderBadges(badges) {
  return badges
    .map((b) => `<span class="badge ${tagClass(b.type)}">${escape(b.text || "")}</span>`)
    .join("");
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function distanceTxt(m) {
  if (m == null) return null;
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function deliveryTxt(s) {
  if (s.discounts?.free_shipping) {
    return `<span class="free">Envío gratis</span>${s.delivery_price ? ` <span class="strike">${fmtCOP.format(s.delivery_price)}</span>` : ""}`;
  }
  return s.delivery_price ? `Envío ${fmtCOP.format(s.delivery_price)}` : "";
}

function card(s) {
  const cover = s.background
    ? `<img src="${s.background}" loading="lazy" alt="" onerror="this.style.display='none'">`
    : "";
  const tags = renderTags(s.discounts?.badges || []);
  const status = !s.is_open ? `<span class="cover-status">Cerrado</span>` : (s.is_new ? `<span class="cover-status">Nuevo</span>` : "");
  const rating = s.rating > 0 ? `<span><span class="star">★</span> ${s.rating.toFixed(1)} <span style="opacity:.6">(${s.reviews})</span></span>` : "";
  const dist = distanceTxt(s.distance_m);
  const eta = s.eta ? `<span>${escape(s.eta)}</span>` : "";
  const distEl = dist ? `<span>${dist}</span>` : "";
  const delivery = deliveryTxt(s);

  return `
    <article class="card ${s.is_open ? "" : "closed"}" data-id="${s.store_id}">
      <div class="cover">
        ${cover}
        <div class="cover-tags">${tags}</div>
        ${status}
      </div>
      <div class="body">
        <div class="logo">${s.logo ? `<img src="${s.logo}" loading="lazy" alt="" onerror="this.style.display='none'">` : ""}</div>
        <div class="info">
          ${s.brand && s.brand !== s.name ? `<span class="brand-name">${escape(s.brand)}</span>` : ""}
          <div class="title-row">${escape(s.name || "")}</div>
          <div class="facts">
            ${rating}${eta}${distEl}${delivery ? `<span>${delivery}</span>` : ""}
          </div>
          ${s.discounts?.badges?.length > 3 ? `<div class="badges">${renderBadges(s.discounts.badges.slice(3))}</div>` : ""}
        </div>
      </div>
    </article>
  `;
}

function render() {
  const filtered = applySort(applyFilters(allStores));
  metaCount.textContent = `${filtered.length} / ${allStores.length}`;
  if (filtered.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-dim);grid-column:1/-1;text-align:center;padding:40px">Sin resultados con esos filtros.</p>`;
    return;
  }
  grid.innerHTML = filtered.map(card).join("");
}

function applyProductFilters(items) {
  const q = searchP.value.trim().toLowerCase();
  return items.filter((p) => {
    if (fPopular.checked && !p.is_popular) return false;
    if (fFreeP.checked && !p.store_free_shipping) return false;
    if (fPrime.checked && !p.is_prime_exclusive) return false;
    if (q) {
      const hay = `${p.name || ""} ${p.store_name || ""} ${p.store_brand || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function applyProductSort(items) {
  const mode = sortP.value;
  const arr = [...items];
  const cmp = {
    discount_pct: (a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0),
    discount_abs: (a, b) => (b.real_price - b.price) - (a.real_price - a.price),
    price_asc: (a, b) => (a.price || 0) - (b.price || 0),
    price_desc: (a, b) => (b.price || 0) - (a.price || 0),
    rating: (a, b) => (b.store_rating || 0) - (a.store_rating || 0),
    popular: (a, b) => Number(b.is_popular) - Number(a.is_popular),
  }[mode];
  return arr.sort(cmp);
}

function pcard(p) {
  const hasImage = !!p.image;
  const pct = p.discount_percentage > 0 ? `<div class="pcard-pct">-${p.discount_percentage}%</div>` : "";
  const flags = [];
  if (p.is_popular) flags.push(`<span class="pflag popular">Popular</span>`);
  if (p.is_prime_exclusive) flags.push(`<span class="pflag prime">Prime</span>`);
  const wasPrice = p.real_price > p.price ? `<span class="was">${fmtCOP.format(p.real_price)}</span>` : "";
  const eta = p.store_eta ? `<span class="seta">· ${escape(p.store_eta)}</span>` : "";
  return `
    <article class="pcard" data-id="${escape(p.id)}">
      <div class="pcard-img ${hasImage ? "" : "empty"}">
        ${hasImage ? `<img src="${p.image}" loading="lazy" alt="" onerror="this.parentElement.classList.add('empty');this.remove();">` : ""}
        ${pct}
        ${flags.length ? `<div class="pcard-flags">${flags.join("")}</div>` : ""}
      </div>
      <div class="pcard-body">
        <div class="pcard-name">${escape(p.name || "")}</div>
        <div class="pcard-price">
          <span class="now">${fmtCOP.format(p.price)}</span>
          ${wasPrice}
        </div>
        <div class="pcard-store">
          <div class="slogo">${p.store_logo ? `<img src="${p.store_logo}" alt="" onerror="this.remove();">` : ""}</div>
          <span class="sname">${escape(p.store_name || p.store_brand || "")}</span>
          ${eta}
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  const filtered = applyProductSort(applyProductFilters(allProducts));
  metaCount.textContent = `${filtered.length} / ${allProducts.length}`;
  if (filtered.length === 0) {
    gridP.innerHTML = `<p style="color:var(--text-dim);grid-column:1/-1;text-align:center;padding:40px">Sin productos con esos filtros.</p>`;
    return;
  }
  gridP.innerHTML = filtered.map(pcard).join("");
}

gridP.addEventListener("click", (e) => {
  const el = e.target.closest(".pcard");
  if (!el) return;
  const id = el.dataset.id;
  const p = allProducts.find((x) => x.id === id);
  if (p && p.store_url) window.open(p.store_url, "_blank", "noopener");
});

grid.addEventListener("click", (e) => {
  const el = e.target.closest(".card");
  if (!el) return;
  const id = Number(el.dataset.id);
  const s = allStores.find((x) => x.store_id === id);
  if (s) openDetail(s);
});

function openDetail(s) {
  const cards = (s.discounts?.cards || [])
    .map(
      (c) => `
      <div class="discount-card">
        <div class="dc-title">${escape(c.title || "")}</div>
        ${c.applicable_stores ? `<div class="dc-meta">${escape(c.applicable_stores)}</div>` : ""}
        ${c.ends_at ? `<div class="dc-meta">Vence: ${escape(c.ends_at)}</div>` : ""}
        ${c.conditions_html ? `<div class="dc-conditions">${c.conditions_html}</div>` : ""}
        ${c.terms ? `<div class="dc-meta"><a href="${c.terms}" target="_blank" rel="noopener">Términos y condiciones</a></div>` : ""}
      </div>
    `
    )
    .join("");

  dialogContent.innerHTML = `
    <div class="detail-cover">
      ${s.background ? `<img src="${s.background}" alt="">` : ""}
    </div>
    <div class="detail-body">
      <div class="detail-title">
        <div class="logo">${s.logo ? `<img src="${s.logo}" alt="">` : ""}</div>
        <div>
          ${s.brand ? `<span class="brand-name">${escape(s.brand)}</span>` : ""}
          <h2>${escape(s.name || "")}</h2>
        </div>
      </div>
      <div class="facts" style="margin-top:12px">
        ${s.rating > 0 ? `<span><span class="star" style="color:var(--yellow)">★</span> ${s.rating.toFixed(1)} (${s.reviews})</span>` : ""}
        ${s.eta ? `<span>${escape(s.eta)}</span>` : ""}
        ${s.distance_m != null ? `<span>${distanceTxt(s.distance_m)}</span>` : ""}
        <span>${deliveryTxt(s)}</span>
      </div>
      ${s.address ? `<div class="detail-section"><h3>Dirección</h3>${escape(s.address)}</div>` : ""}
      ${cards ? `<div class="detail-section"><h3>Promociones</h3>${cards}</div>` : ""}
      <div class="detail-actions">
        <a class="btn-primary" href="${s.url}" target="_blank" rel="noopener">Ver en Rappi</a>
      </div>
    </div>
  `;
  dialog.showModal();
}

dialog.addEventListener("click", (e) => {
  if (e.target === dialog || e.target.dataset.close !== undefined) dialog.close();
});

[search, sortSel, fDiscount, fFree, fOpen, fExclusive].forEach((el) =>
  el.addEventListener("input", render)
);
[searchP, sortP, fPopular, fFreeP, fPrime].forEach((el) =>
  el.addEventListener("input", renderProducts)
);

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b === btn));
    view = btn.dataset.view;
    document.querySelectorAll('.toolbar').forEach((t) => t.classList.toggle("hidden", t.dataset.view !== view));
    grid.classList.toggle("hidden", view !== "stores");
    gridP.classList.toggle("hidden", view !== "products");
    if (view === "stores") {
      if (storesLoaded) render();
      else loadStores();
    } else {
      if (productsLoaded) renderProducts();
      else loadProducts();
    }
  });
});

refreshBtn.addEventListener("click", () => {
  if (view === "stores") loadStores(true);
  else loadProducts(true);
});

loadProducts();
