/* B-Lite Food — shared UI runtime (header, cart, drawer, search, cookies, reveal, toasts).
 * Framework-free so the prototype runs from any static host. Each block maps 1:1 to a
 * component in the planned Next.js build (see blitefood/README.md).
 */
(function () {
  "use strict";
  const D = window.BliteData, A = window.BliteArt;
  const B = (window.Blite = window.Blite || {});
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  B.reduceMotion = reduceMotion;

  /* ---------- utils ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
  const money = (n) => gbp.format(n || 0);
  const store = {
    get(k, d) { try { const v = localStorage.getItem("blite." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("blite." + k, JSON.stringify(v)); } catch (e) { /* storage unavailable: state lives for this page only */ } },
    del(k) { try { localStorage.removeItem("blite." + k); } catch (e) { /* ignore */ } },
  };
  const params = new URLSearchParams(location.search);
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  Object.assign(B, { $, $$, esc, money, store, params, emit });

  B.ready = function (fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  };

  /* ---------- icons ---------- */
  const P = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-left": '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    cart: '<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20.5" r="1.2"/><circle cx="17" cy="20.5" r="1.2"/>',
    bag: '<path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    heart: '<path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4 7 4c2 0 3.6 1 5 3 1.4-2 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 15.4 12 20 12 20Z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    leaf: '<path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15Z"/><path d="M5 19 14 10"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    chef: '<path d="M7 14a4 4 0 1 1 1.3-7.8A4.5 4.5 0 0 1 16 5a4 4 0 1 1 1 9"/><path d="M7 14v6h10v-6M7 17h10"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2A5 5 0 0 1 21.5 19"/>',
    box: '<path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z"/><path d="m3 7 9 4 9-4M12 11v10"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    sort: '<path d="M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3"/>',
    "chev-left": '<path d="m15 6-6 6 6 6"/>',
    "chev-right": '<path d="m9 6 6 6-6 6"/>',
    "chev-down": '<path d="m6 9 6 6 6-6"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4v-9Z"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    cake: '<path d="M4 21h16v-8H4v8ZM4 16c2 1.5 4 1.5 6 0s4-1.5 6 0 3 1 4 0"/><path d="M12 13V9M12 6.5a1.5 1.5 0 0 0 0-3"/>',
    rings: '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="m9 5 1.5-2h3L15 5"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>',
    party: '<path d="M4 20 9 7l8 8-13 5Z"/><path d="M14 4c1 1 1 2 0 3M18 8c1 1 2 1 3 0M17 3l.5 1.5M20 5.5l1.5.5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/>',
    flame: '<path d="M12 21c-4 0-7-2.7-7-6.5 0-3 2-5 3.5-6.5.3 2 1.5 3 2.5 3 0-3 1-6 4-8 0 3 2 4.5 3.5 6.5 1 1.3 1.5 2.8 1.5 4.5C20 18.3 16 21 12 21Z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>',
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z"/>',
    tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.5 4.5 5 4.5"/>',
    whatsapp: '<path d="M4 20l1.2-4A8 8 0 1 1 8 18.8L4 20Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8A4 4 0 0 1 10.3 11l.8-1-1-2L9 9.5Z"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    "eye-off": '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    repeat: '<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  };
  B.icon = (name, cls = "") => `<svg class="i ${name === "arrow" ? "i-arrow " : ""}${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;
  const I = B.icon;

  /* ---------- images with generated fallback ---------- */
  // mode: "scene" (fills card), "cutout" (transparent dish), "photo" (captioned placeholder)
  B.img = function (src, { dish = "rice", seed = "", mode = "scene", alt = "", cls = "", eager = false } = {}) {
    return `<span class="dish ${mode === "cutout" ? "dish--cutout" : ""} ${cls}"><img src="${esc(src)}" alt="${esc(alt)}" ${eager ? "" : 'loading="lazy"'} decoding="async" data-dish="${esc(dish)}" data-seed="${esc(seed)}" data-mode="${mode}"></span>`;
  };
  B.productImg = (p, i = 0, mode = "scene") => B.img(p.images[i] || p.img, { dish: p.dish, seed: p.id + i, mode, alt: p.name });
  B.swap = function (img) {
    if (!img || !img.isConnected || img.dataset.swapped) return;
    img.dataset.swapped = "1";
    const { dish, seed, mode } = img.dataset;
    const tmp = document.createElement("div");
    tmp.innerHTML = mode === "photo" ? A.photo(img.alt || "Photo", seed) : mode === "cutout" ? A.dish(dish, seed) : A.scene(dish, seed);
    const node = tmp.firstElementChild;
    img.replaceWith(node);
    const hero = node.closest && node.closest(".hero-food");
    if (hero) hero.classList.add("is-loaded");
  };
  const swapBroken = (root = document) =>
    $$("img[data-dish]", root).forEach((img) => {
      if (img.dataset.failed || (img.complete && img.naturalWidth === 0)) B.swap(img);
    });
  // Errors that fire before this script ran are tagged by the inline head snippet (data-failed).
  window.addEventListener("error", (e) => { const t = e.target; if (t && t.tagName === "IMG" && t.dataset && t.dataset.dish !== undefined) B.swap(t); }, true);
  new MutationObserver(() => swapBroken()).observe(document.documentElement, { childList: true, subtree: true });

  /* ---------- toasts ---------- */
  B.toast = function (msg, action) {
    let wrap = $(".toasts");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toasts"; wrap.setAttribute("role", "status"); wrap.setAttribute("aria-live", "polite"); document.body.appendChild(wrap); }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = I("check") + `<span>${msg}</span>` + (action ? `<a href="${action.href || "#"}" ${action.onclick ? 'data-act="1"' : ""}>${action.label}</a>` : "");
    if (action && action.onclick) t.querySelector("[data-act]").addEventListener("click", (e) => { e.preventDefault(); action.onclick(); });
    wrap.appendChild(t);
    while (wrap.children.length > 3) wrap.firstChild.remove();
    setTimeout(() => { t.classList.add("is-leaving"); setTimeout(() => t.remove(), 280); }, 3200);
  };

  /* ---------- account (prototype: local only; production uses Supabase Auth) ---------- */
  B.user = () => store.get("user", null);
  B.signIn = (u) => { store.set("user", u); emit("blite:user"); };
  B.signOut = () => { store.del("user"); emit("blite:user"); };

  // Email + password accounts. Prototype only: accounts live in this browser with a salted SHA-256
  // hash (never the plain password). PRODUCTION: supabase.auth.signUp / signInWithPassword /
  // resetPasswordForEmail — passwords are then hashed and stored by Supabase, never by us.
  async function hashPw(pw, salt) {
    const data = new TextEncoder().encode(salt + ":" + pw);
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    let h = 2166136261; for (const b of data) { h ^= b; h = Math.imul(h, 16777619); } return "f" + (h >>> 0).toString(16);
  }
  const accounts = () => store.get("accounts", {});
  B.register = async function ({ firstName, lastName, email, phone, password }) {
    const key = email.trim().toLowerCase(), all = accounts();
    if (all[key]) return { ok: false, error: "exists" };
    const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
    all[key] = { firstName, lastName, email: email.trim(), phone: phone || "", salt, hash: await hashPw(password, salt), since: new Date().toISOString() };
    store.set("accounts", all);
    const { salt: _s, hash: _h, ...profile } = all[key];
    B.signIn(profile);
    return { ok: true };
  };
  B.login = async function (email, password) {
    const a = accounts()[email.trim().toLowerCase()];
    if (!a || (await hashPw(password, a.salt)) !== a.hash) return { ok: false };
    const { salt: _s, hash: _h, ...profile } = a;
    B.signIn(profile);
    return { ok: true };
  };
  B.updateProfile = function (patch) {
    const u = Object.assign({}, B.user(), patch), all = accounts(), key = u.email.toLowerCase();
    if (all[key]) { Object.assign(all[key], patch); store.set("accounts", all); }
    B.signIn(u);
  };
  B.initials = (u) => ((u.firstName || u.email || "?")[0] + ((u.lastName || "")[0] || "")).toUpperCase();

  /* ---------- favourites (needs an account; browsing never does) ---------- */
  B.favs = () => store.get("favs", []);
  B.isFav = (id) => B.favs().includes(id);
  B.toggleFav = function (id, btn) {
    if (!B.user()) {
      B.toast("Sign in to save favourites.", { label: "Sign in", href: "account.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search) });
      return;
    }
    const f = B.favs(), on = !f.includes(id);
    store.set("favs", on ? f.concat(id) : f.filter((x) => x !== id));
    $$(`.fav-btn[data-fav="${id}"]`).forEach((b) => { b.setAttribute("aria-pressed", on); b.setAttribute("aria-label", on ? "Remove from favourites" : "Save to favourites"); });
    if (btn && !reduceMotion) { btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop"); }
    if (on) B.toast("Saved to your favourites.", { label: "View", href: "account.html#favourites" });
  };

  /* ---------- food basket ---------- */
  B.product = (id) => D.products.find((p) => p.id === id);
  B.unitPrice = function (line) {
    const p = B.product(line.id);
    if (!p) return 0;
    const portion = p.portions.find((x) => x.id === line.portion) || p.portions[0];
    const addons = (line.addons || []).reduce((s, a) => s + ((p.addons.find((x) => x.id === a) || {}).price || 0), 0);
    return p.price + (portion ? portion.delta : 0) + addons;
  };
  B.cart = () => store.get("cart", []).filter((l) => B.product(l.id));
  B.cartCount = () => B.cart().reduce((s, l) => s + l.qty, 0);
  B.cartSubtotal = () => B.cart().reduce((s, l) => s + B.unitPrice(l) * l.qty, 0);
  B.lineLabel = function (line) {
    const p = B.product(line.id);
    const bits = [];
    const portion = p.portions.find((x) => x.id === line.portion);
    if (portion && p.portions.length > 1) bits.push(portion.name);
    (line.addons || []).forEach((a) => { const x = p.addons.find((y) => y.id === a); if (x) bits.push("+ " + x.name); });
    return bits.join(" · ");
  };
  function saveCart(c) { store.set("cart", c); emit("blite:cart"); }
  B.isSoldOut = (id) => store.get("admin.hidden", []).includes(id);
  B.addToCart = function (id, opts = {}) {
    const p = B.product(id);
    if (B.isSoldOut(id)) { B.toast(`${esc(p.name)} is sold out today.`); return false; }
    const line = { id, portion: opts.portion || p.portions[0].id, addons: (opts.addons || []).slice().sort(), qty: opts.qty || 1 };
    line.key = [line.id, line.portion, line.addons.join("+")].join("|");
    const c = B.cart();
    const ex = c.find((l) => l.key === line.key);
    if (ex) ex.qty += line.qty; else c.push(line);
    saveCart(c);
    if (opts.openDrawer !== false && window.innerWidth > 768) B.openDrawer();
    else B.toast(`${esc(p.name)} added to your basket.`, { label: "View basket", href: "cart.html" });
  };
  B.setQty = function (key, qty) {
    let c = B.cart();
    if (qty <= 0) c = c.filter((l) => l.key !== key);
    else c.forEach((l) => { if (l.key === key) l.qty = Math.min(qty, 99); });
    saveCart(c);
  };
  B.clearCart = () => saveCart([]);
  B.cartHasScheduledOnly = () => B.cart().some((l) => !B.product(l.id).quick);

  /* ---------- delivery (postcode-first) ---------- */
  B.normalisePostcode = function (v) {
    const s = String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (s.length < 5 || s.length > 7) return null;
    const out = s.slice(0, -3) + " " + s.slice(-3);
    return /^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/.test(out) ? out : null;
  };
  B.checkDelivery = function (pc) {
    const norm = B.normalisePostcode(pc);
    if (!norm) return { ok: false, reason: "invalid" };
    const area = norm.match(/^[A-Z]+/)[0];
    const zone = D.deliveryZones.find((z) => z.prefixes.includes(area));
    if (!zone) return { ok: false, reason: "out", postcode: norm };
    return { ok: true, postcode: norm, fee: zone.fee, eta: zone.eta };
  };

  /* ---------- orders (prototype store; production: the Revolut order-completed webhook creates these) ---------- */
  B.orders = () => store.get("orders", []);
  B.saveOrder = (o) => { const all = B.orders().filter((x) => x.id !== o.id); all.unshift(o); store.set("orders", all); };
  B.order = (id) => B.orders().find((o) => o.id === id);
  B.nextOrderId = () => "BL-" + (1048 + B.orders().length);

  /* ---------- product card ---------- */
  B.productCard = function (p, { tag } = {}) {
    const fav = B.isFav(p.id);
    const portionsNote = p.portions.length > 1 ? `<small>from</small> ` : "";
    return `<article class="p-card">
      <a class="p-card__media" href="product.html?id=${p.id}" aria-label="${esc(p.name)}">${B.productImg(p)}
        ${tag || p.quick ? `<span class="p-card__tags"><span class="pill">${tag || "Same day"}</span></span>` : ""}</a>
      <button class="fav-btn" data-fav="${p.id}" aria-pressed="${fav}" aria-label="${fav ? "Remove from favourites" : "Save to favourites"}">${I("heart", "i-sm")}</button>
      <div class="p-card__body">
        <h3 class="p-card__title"><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
        <p class="p-card__desc">${esc(p.desc)}</p>
        <div class="p-card__foot">
          <span class="price">${portionsNote}${money(p.price)}</span>
          ${B.isSoldOut(p.id) ? '<span class="pill pill--muted">Sold out</span>' : `<button class="add-btn" data-add="${p.id}" aria-label="Add ${esc(p.name)} to basket">${I("cart")}<span>Add</span></button>`}
        </div>
      </div>
    </article>`;
  };
  B.skeletonCards = (n) => Array.from({ length: n }, () => `<div class="sk-card" aria-hidden="true"><div class="skeleton sk-img"></div><div class="sk-lines"><div class="skeleton sk-line" style="width:70%"></div><div class="skeleton sk-line" style="width:90%"></div><div class="skeleton sk-line" style="width:40%"></div></div></div>`).join("");

  /* ---------- chrome: header / footer / mobile nav ---------- */
  const NAV = [
    ["home", "index.html", "Home"],
    ["menu", "menu.html", "Menu"],
    ["catering", "catering.html", "Catering"],
    ["equipment", "equipment.html", "Equipment"],
    ["events", "events.html", "Events"],
    ["about", "about.html", "About"],
  ];
  function renderHeader(page) {
    const h = document.createElement("header");
    h.className = "site-header";
    h.innerHTML = `<div class="container">
      <a href="index.html" class="logo" aria-label="B-Lite Food home"><img class="logo__img" src="assets/img/brand/logo.webp" alt="B-Lite" width="720" height="443"></a>
      <nav class="main-nav" aria-label="Main">${NAV.map(([k, href, label]) => `<a href="${href}" ${k === page ? 'aria-current="page"' : ""}>${label}</a>`).join("")}</nav>
      <div class="header-actions">
        <button class="icon-btn" data-open-search aria-label="Search the menu">${I("search")}</button>
        <a class="icon-btn desktop-only" href="account.html" aria-label="Your account" data-acct-btn>${I("user")}</a>
        <button class="icon-btn" data-open-cart aria-label="Open basket">${I("bag")}<span class="badge" data-cart-count>0</span></button>
        <a class="btn btn--sm btn--order" href="menu.html">Order now ${I("arrow", "i-sm")}</a>
        <button class="icon-btn menu-toggle" data-open-menu aria-label="Open menu" aria-expanded="false">${I("menu")}</button>
      </div></div>`;
    document.body.prepend(h);
    const paintAcct = () => {
      const u = B.user(), a = h.querySelector("[data-acct-btn]");
      if (!a) return;
      a.innerHTML = u ? `<span class="acct-avatar">${esc(B.initials(u))}</span>` : I("user");
      a.setAttribute("aria-label", u ? `Your account (${u.firstName || u.email})` : "Sign in or create an account");
    };
    paintAcct();
    document.addEventListener("blite:user", paintAcct);
    const skip = document.createElement("a");
    skip.className = "skip-link"; skip.href = "#main"; skip.textContent = "Skip to content";
    document.body.prepend(skip);
    if (document.body.dataset.header === "solid") h.classList.add("is-solid");
    if (document.body.dataset.header === "dark") h.classList.add("on-dark");
    const onScroll = () => h.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function renderFooter() {
    const b = D.business;
    const f = document.createElement("footer");
    f.className = "site-footer";
    f.innerHTML = `<div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="logo logo--light" aria-label="B-Lite Food home"><img class="logo__img" src="assets/img/brand/logo-dark.webp" alt="B-Lite" width="720" height="443"><span class="logo__tag">Authentic Nigerian food</span></a>
          <p>Nigerian flavour, made for Britain. Food delivery, catering and equipment hire from Hatfield, Hertfordshire.</p>
          <div class="socials">
            <a href="${b.instagram}" aria-label="Instagram" rel="noopener" target="_blank">${I("instagram", "i-sm")}</a>
            <a href="${b.tiktok}" aria-label="TikTok" rel="noopener" target="_blank">${I("tiktok", "i-sm")}</a>
            <a href="${b.facebook}" aria-label="Facebook" rel="noopener" target="_blank">${I("facebook", "i-sm")}</a>
            <a href="${b.whatsapp}" aria-label="WhatsApp" rel="noopener" target="_blank">${I("whatsapp", "i-sm")}</a>
          </div>
        </div>
        <div><h4>Order</h4><ul>
          <li><a href="menu.html">Full menu</a></li><li><a href="menu.html?cat=rice">Rice & noodles</a></li><li><a href="menu.html?cat=soups">Soups</a></li>
          <li><a href="cart.html">Your basket</a></li><li><a href="account.html#orders">Track an order</a></li></ul></div>
        <div><h4>Services</h4><ul>
          <li><a href="catering.html">Catering</a></li><li><a href="equipment.html">Equipment hire</a></li><li><a href="events.html">Events</a></li>
          <li><a href="about.html">About us</a></li><li><a href="contact.html">Contact</a></li></ul></div>
        <div><h4>Help</h4><ul>
          <li><a href="legal.html?page=delivery">Delivery information</a></li><li><a href="legal.html?page=allergens">Allergen information</a></li>
          <li><a href="legal.html?page=refunds">Returns & refunds</a></li><li><a href="legal.html?page=catering-terms">Catering terms</a></li>
          <li><a href="legal.html?page=rental-terms">Equipment rental terms</a></li></ul></div>
        <div><h4>Contact</h4><ul class="contact-list">
          <li>${I("pin", "i-sm")}<span>${b.address}</span></li>
          <li>${I("phone", "i-sm")}<a href="tel:${b.phoneHref}">${b.phone}</a></li>
          <li>${I("mail", "i-sm")}<a href="mailto:${b.email}">${b.email}</a></li>
          <li>${I("clock", "i-sm")}<span>Orders 07:00–19:00 (UK time)</span></li></ul></div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} B-Lite Food. All rights reserved. · <a href="legal.html?page=privacy">Privacy</a> · <a href="legal.html?page=cookies">Cookies</a> · <a href="legal.html?page=terms">Terms</a> · <button type="button" data-cookie-prefs>Cookie settings</button></span>
        <span class="motto">Good food · Happy people · Great memories</span>
      </div></div>`;
    document.body.appendChild(f);
  }

  function renderMobileChrome(page) {
    const nav = document.createElement("nav");
    nav.className = "bottom-nav";
    nav.setAttribute("aria-label", "Quick navigation");
    const items = [["home", "index.html", "home", "Home"], ["menu", "menu.html", "grid", "Menu"], ["orders", "account.html#orders", "receipt", "Orders"], ["account", "account.html", "user", "Account"], ["cart", "cart.html", "bag", "Basket"]];
    nav.innerHTML = items.map(([k, href, icon, label]) => `<a href="${href}" ${k === page ? 'aria-current="page"' : ""}>${I(icon)}${k === "cart" ? '<span class="badge" data-cart-count>0</span>' : ""}<span>${label}</span></a>`).join("");
    document.body.appendChild(nav);

    if (!["cart", "checkout"].includes(page)) {
      // Floating basket bar (mobile). The × collapses it to a small bubble; the choice lasts for this visit.
      const bar = document.createElement("div");
      bar.className = "cart-bar";
      bar.innerHTML = `<a class="cb-link" href="cart.html">${I("bag")}<span data-cart-bar-count></span><span class="cb-total"><span data-cart-bar-total></span>${I("arrow", "i-sm")}</span></a>` +
        `<button type="button" class="cb-hide" aria-label="Hide basket bar">${I("close", "i-sm")}</button>`;
      const mini = document.createElement("button");
      mini.type = "button"; mini.className = "cart-mini"; mini.setAttribute("aria-label", "Show basket");
      mini.innerHTML = `${I("bag")}<span class="badge has-items" data-cart-mini-count>0</span>`;
      document.body.append(bar, mini);
      const setHidden = (h) => { try { h ? sessionStorage.setItem("blite.cartbar.hidden", "1") : sessionStorage.removeItem("blite.cartbar.hidden"); } catch (e) {} paintCounts(); };
      bar.querySelector(".cb-hide").addEventListener("click", () => setHidden(true));
      mini.addEventListener("click", () => setHidden(false));
    }

    const mm = document.createElement("div");
    mm.className = "mobile-menu"; mm.setAttribute("aria-hidden", "true"); mm.id = "mobile-menu";
    mm.innerHTML = `<button class="icon-btn close" data-close-menu aria-label="Close menu">${I("close")}</button>
      <nav aria-label="Mobile">${NAV.concat([["contact", "contact.html", "Contact"], ["help", "legal.html?page=delivery", "Help"]]).map(([k, href, label]) => `<a href="${href}" ${k === page ? 'aria-current="page"' : ""}>${label}${I("chev-right")}</a>`).join("")}</nav>
      <div class="mm-ctas"><a class="btn btn--block" href="menu.html">Order food ${I("arrow")}</a><a class="btn btn--secondary btn--block" href="catering.html">Book catering</a><a class="btn btn--ghost btn--block" href="equipment.html">Rent equipment</a></div>`;
    document.body.appendChild(mm);
  }

  /* ---------- overlays ---------- */
  let overlay;
  const openLayers = new Set();
  function getOverlay() {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "overlay";
      overlay.addEventListener("click", closeAll);
      document.body.appendChild(overlay);
    }
    return overlay;
  }
  let lastFocus = null;
  B.openLayer = function (el, { modal = false } = {}) {
    lastFocus = document.activeElement;
    const o = getOverlay();
    o.classList.toggle("overlay--modal", modal);
    o.classList.add("is-open");
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    openLayers.add(el);
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => { const f = el.querySelector("[autofocus], input, button, a"); if (f) f.focus({ preventScroll: true }); }, 60);
  };
  B.closeLayer = function (el) {
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    openLayers.delete(el);
    if (!openLayers.size) {
      if (overlay) overlay.classList.remove("is-open");
      document.documentElement.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
  };
  function closeAll() { Array.from(openLayers).forEach(B.closeLayer); }
  B.closeAll = closeAll;
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

  /* ---------- cart drawer ---------- */
  function renderDrawer() {
    const d = document.createElement("aside");
    d.className = "drawer"; d.id = "cart-drawer"; d.setAttribute("aria-hidden", "true"); d.setAttribute("aria-label", "Your basket"); d.setAttribute("role", "dialog");
    d.innerHTML = `<div class="drawer__head"><h3>Your basket</h3><button class="icon-btn" data-close-layer aria-label="Close basket">${I("close")}</button></div>
      <div class="drawer__body" data-drawer-body></div><div class="drawer__foot" data-drawer-foot></div>`;
    document.body.appendChild(d);
  }
  B.lineItemHTML = function (l) {
    const p = B.product(l.id);
    return `<div class="line-item" data-key="${esc(l.key)}">
      <a class="line-item__img" href="product.html?id=${p.id}">${B.productImg(p)}</a>
      <div><h4>${esc(p.name)}</h4><div class="meta">${esc(B.lineLabel(l))}</div>
        <div style="margin-top:8px" class="qty"><button data-qty="-1" aria-label="Decrease quantity">${I("minus", "i-sm")}</button><output>${l.qty}</output><button data-qty="1" aria-label="Increase quantity">${I("plus", "i-sm")}</button></div></div>
      <div class="line-item__right"><span class="price">${money(B.unitPrice(l) * l.qty)}</span><button class="remove" data-remove>Remove</button></div>
    </div>`;
  };
  B.emptyBasketHTML = () => `<div class="state"><div class="state__icon">${I("bag")}</div><h3>Your basket is waiting.</h3><p>Looks like you haven't added anything delicious yet.</p><a class="btn" href="menu.html">Browse menu ${I("arrow")}</a></div>`;
  function paintDrawer() {
    const body = $("[data-drawer-body]"), foot = $("[data-drawer-foot]");
    if (!body) return;
    const c = B.cart();
    if (!c.length) { body.innerHTML = B.emptyBasketHTML(); foot.hidden = true; return; }
    foot.hidden = false;
    body.innerHTML = c.map(B.lineItemHTML).join("");
    foot.innerHTML = `<div class="sum-row"><span>Subtotal</span><span>${money(B.cartSubtotal())}</span></div>
      <p class="small muted" style="margin:4px 0 14px">Delivery calculated from your postcode at checkout.</p>
      <a class="btn btn--block" href="checkout.html">Continue to checkout ${I("arrow")}</a>
      <a class="btn btn--ghost btn--block" style="margin-top:8px" href="cart.html">View full basket</a>`;
  }
  B.openDrawer = () => { paintDrawer(); B.openLayer($("#cart-drawer")); };

  // qty controls work in the drawer and on the cart page
  document.addEventListener("click", (e) => {
    const li = e.target.closest(".line-item");
    if (!li) return;
    const key = li.dataset.key;
    const line = B.cart().find((l) => l.key === key);
    if (!line) return;
    const q = e.target.closest("[data-qty]");
    if (q) B.setQty(key, line.qty + Number(q.dataset.qty));
    if (e.target.closest("[data-remove]")) {
      li.classList.add("is-leaving");
      setTimeout(() => B.setQty(key, 0), reduceMotion ? 0 : 260);
      const p = B.product(line.id);
      B.toast(`${esc(p.name)} removed.`, { label: "Undo", onclick: () => { const c = B.cart(); c.push(line); saveCart(c); } });
    }
  });

  function paintCounts() {
    const n = B.cartCount();
    $$("[data-cart-count]").forEach((b) => {
      const prev = Number(b.textContent);
      b.textContent = n;
      b.classList.toggle("has-items", n > 0);
      if (n > prev && !reduceMotion) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
    });
    const bar = $(".cart-bar"), mini = $(".cart-mini");
    if (bar) {
      let hidden = false; try { hidden = sessionStorage.getItem("blite.cartbar.hidden") === "1"; } catch (e) {}
      bar.classList.toggle("is-visible", n > 0 && !hidden);
      if (mini) { mini.classList.toggle("is-visible", n > 0 && hidden); $("[data-cart-mini-count]").textContent = n; }
      $("[data-cart-bar-count]").textContent = n + (n === 1 ? " item" : " items");
      $("[data-cart-bar-total]").textContent = money(B.cartSubtotal());
    }
  }

  /* ---------- search ---------- */
  function renderSearch() {
    const s = document.createElement("div");
    s.className = "search-panel"; s.id = "search-panel"; s.setAttribute("aria-hidden", "true"); s.setAttribute("role", "dialog"); s.setAttribute("aria-label", "Search");
    s.innerHTML = `<div class="container">
      <div class="search-bar">${I("search", "i-lg")}<input type="search" placeholder="Search our menu…" aria-label="Search our menu" autocomplete="off" data-search-input autofocus>
      <button class="icon-btn" data-close-layer aria-label="Close search">${I("close")}</button></div>
      <div class="search-results" data-search-results></div></div>`;
    document.body.appendChild(s);
    const input = $("[data-search-input]", s), out = $("[data-search-results]", s);
    const mark = (text, q) => { const i = text.toLowerCase().indexOf(q); return i < 0 ? esc(text) : esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length)); };
    function paint() {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        const pop = D.products.filter((p) => p.featured || p.quick).slice(0, 6);
        out.innerHTML = `<div><h4>Popular right now</h4>${pop.map((p) => hit(p, "")).join("")}</div>
          <div><h4>Categories</h4>${D.categories.map((c) => `<a class="search-hit" href="menu.html?cat=${c.id}"><strong>${c.title}</strong></a>`).join("")}</div>`;
        return;
      }
      const foods = D.products.filter((p) => (p.name + " " + p.desc).toLowerCase().includes(q)).slice(0, 8);
      const cats = D.categories.filter((c) => (c.title + c.name).toLowerCase().includes(q));
      if (!foods.length && !cats.length) {
        out.innerHTML = `<div class="state" style="grid-column:1/-1;padding:24px"><h3>Nothing delicious here yet.</h3><p>Try another search — “jollof”, “soup” or “puff puff”.</p></div>`;
        return;
      }
      out.innerHTML = `<div><h4>Food</h4>${foods.map((p) => hit(p, q)).join("") || '<p class="muted small">No dishes match.</p>'}</div>
        <div><h4>Categories</h4>${cats.map((c) => `<a class="search-hit" href="menu.html?cat=${c.id}"><strong>${mark(c.title, q)}</strong></a>`).join("") || '<p class="muted small">—</p>'}</div>`;
    }
    function hit(p, q) {
      return `<a class="search-hit" href="product.html?id=${p.id}"><span class="thumb">${B.productImg(p)}</span><span><strong>${q ? mark(p.name, q) : esc(p.name)}</strong><span class="small muted">${money(p.price)} · ${esc((D.categories.find((c) => c.id === p.cat) || {}).name || "")}</span></span></a>`;
    }
    input.addEventListener("input", paint);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { const first = $(".search-hit", out); if (first) location.href = first.getAttribute("href"); else location.href = "menu.html?q=" + encodeURIComponent(input.value); }
    });
    paint();
  }

  /* ---------- cookie consent (ICO: equal-weight choices, granular control) ---------- */
  function renderCookies() {
    const c = document.createElement("div");
    c.className = "cookie"; c.setAttribute("role", "region"); c.setAttribute("aria-label", "Cookie consent");
    c.innerHTML = `<h3>We use cookies</h3>
      <p>Essential cookies keep B-Lite working — like remembering your basket. With your permission, we'd also like to use analytics cookies to improve the website. <a href="legal.html?page=cookies">Cookie policy</a></p>
      <div class="cookie__actions"><button class="btn btn--dark" data-consent="all">Accept all</button><button class="btn btn--dark" data-consent="essential">Reject non-essential</button><button class="btn btn--ghost" data-cookie-prefs>Manage preferences</button></div>`;
    document.body.appendChild(c);

    const m = document.createElement("div");
    m.className = "modal"; m.id = "cookie-modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "cookie-title"); m.setAttribute("aria-hidden", "true");
    const cur = store.get("consent", null) || {};
    m.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><h3 id="cookie-title" class="h3">Cookie preferences</h3><button class="icon-btn" data-close-layer aria-label="Close">${I("close")}</button></div>
      <div class="pref-row"><div><strong>Strictly necessary</strong><p>Basket, checkout, sign-in and security. Always on — the site can't work without them.</p></div><label class="switch"><input type="checkbox" checked disabled aria-label="Strictly necessary cookies, always on"><span></span></label></div>
      <div class="pref-row"><div><strong>Analytics</strong><p>Anonymous usage statistics (GA4) so we can see which pages help and which don't.</p></div><label class="switch"><input type="checkbox" data-pref="analytics" ${cur.analytics ? "checked" : ""} aria-label="Analytics cookies"><span></span></label></div>
      <div class="pref-row"><div><strong>Marketing</strong><p>Measure our social media adverts. Off unless you switch it on.</p></div><label class="switch"><input type="checkbox" data-pref="marketing" ${cur.marketing ? "checked" : ""} aria-label="Marketing cookies"><span></span></label></div>
      <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap"><button class="btn" data-save-prefs>Save preferences</button><button class="btn btn--ghost" data-consent="essential">Reject non-essential</button></div>`;
    document.body.appendChild(m);

    const setConsent = (v) => { store.set("consent", Object.assign({ necessary: true, at: new Date().toISOString() }, v)); c.classList.remove("is-open"); B.closeLayer(m); emit("blite:consent"); B.toast("Cookie preferences saved."); };
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-consent],[data-cookie-prefs],[data-save-prefs]");
      if (!t) return;
      if (t.dataset.consent === "all") setConsent({ analytics: true, marketing: true });
      else if (t.dataset.consent === "essential") setConsent({ analytics: false, marketing: false });
      else if (t.hasAttribute("data-save-prefs")) setConsent({ analytics: $("[data-pref=analytics]", m).checked, marketing: $("[data-pref=marketing]", m).checked });
      else if (t.hasAttribute("data-cookie-prefs")) { c.classList.remove("is-open"); B.openLayer(m, { modal: true }); }
    });
    if (!store.get("consent", null)) setTimeout(() => c.classList.add("is-open"), 1200);
  }

  /* ---------- scroll reveal (headings + max-4 staggered cards) ---------- */
  B.observeReveal = function (root = document) {
    const els = $$("[data-reveal]:not(.is-revealed), [data-stagger]:not(.is-revealed)", root);
    if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-revealed", "is-settled")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-revealed");
        if (en.target.hasAttribute("data-stagger")) setTimeout(() => en.target.classList.add("is-settled"), 900);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => io.observe(el));
  };

  /* ---------- rails (carousels) ---------- */
  B.bindRails = function (root = document) {
    $$("[data-rail]", root).forEach((rail) => {
      const id = rail.id;
      const prev = $(`[data-rail-prev="${id}"]`), next = $(`[data-rail-next="${id}"]`);
      const step = () => { const c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 24) : 300; };
      const upd = () => {
        if (prev) prev.disabled = rail.scrollLeft < 4;
        if (next) next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
      };
      if (prev) prev.onclick = () => rail.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" });
      if (next) next.onclick = () => rail.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" });
      rail.addEventListener("scroll", upd, { passive: true });
      window.addEventListener("resize", upd);
      upd();
    });
  };

  /* ---------- global click delegation ---------- */
  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      e.preventDefault();
      if (B.addToCart(add.dataset.add) === false) return;
      if (add.classList.contains("add-btn")) {
        add.classList.add("is-added");
        add.innerHTML = I("check") + "<span>Added</span>";
        setTimeout(() => { add.classList.remove("is-added"); add.innerHTML = I("cart") + "<span>Add</span>"; }, 1600);
      }
      return;
    }
    const fav = e.target.closest("[data-fav]");
    if (fav) { e.preventDefault(); B.toggleFav(fav.dataset.fav, fav); return; }
    if (e.target.closest("[data-open-cart]")) { e.preventDefault(); if (window.innerWidth <= 768) location.href = "cart.html"; else B.openDrawer(); return; }
    if (e.target.closest("[data-open-search]")) { B.openLayer($("#search-panel")); return; }
    if (e.target.closest("[data-open-menu]")) { B.openLayer($("#mobile-menu")); return; }
    if (e.target.closest("[data-close-menu]")) { B.closeLayer($("#mobile-menu")); return; }
    const cl = e.target.closest("[data-close-layer]");
    if (cl) { const layer = cl.closest(".drawer,.search-panel,.modal,.sheet,.mobile-menu"); if (layer) B.closeLayer(layer); }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); B.openLayer($("#search-panel")); }
  });

  /* ---------- newsletter (shared) ---------- */
  document.addEventListener("submit", (e) => {
    const f = e.target.closest("[data-newsletter]");
    if (!f) return;
    e.preventDefault();
    const email = f.querySelector("input[type=email]");
    if (!email.checkValidity()) { email.setAttribute("aria-invalid", "true"); email.focus(); return; }
    email.removeAttribute("aria-invalid");
    f.innerHTML = `<p style="padding:12px 14px;color:var(--dark);font-weight:600;display:flex;gap:8px;align-items:center">${I("check")} You're on the list — check your inbox to confirm.</p>`;
  });

  /* ---------- boot ---------- */
  B.ready(() => {
    const page = document.body.dataset.page || "";
    if (document.body.dataset.chrome === "none") { swapBroken(); return; } // admin uses its own shell
    renderHeader(page);
    renderSearch();
    renderDrawer();
    if (!document.body.hasAttribute("data-no-footer")) renderFooter();
    renderMobileChrome(page);
    renderCookies();
    paintCounts();
    $$("[data-icon]").forEach((el) => { if (!el.querySelector("svg.i")) el.insertAdjacentHTML("afterbegin", I(el.dataset.icon)); });
    $$("[data-stars]").forEach((el) => { el.innerHTML = Array(+el.dataset.stars + 1).join(I("star")); });
    swapBroken();
    B.observeReveal();
    B.bindRails();
    document.addEventListener("blite:cart", () => { paintCounts(); if ($("#cart-drawer").classList.contains("is-open")) paintDrawer(); });
    window.addEventListener("storage", (e) => { if (e.key === "blite.cart") emit("blite:cart"); });
  });
})();
