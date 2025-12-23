/* VÉRA ACTIVE — calm, conversion-friendly interactions.
   - Slow cursor blob
   - Gentle drift parallax
   - Scroll reveal
   - Simple shop filter/sort
   - Demo cart (localStorage)
*/

const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

/* Mobile menu */
const toggle = $('.nav-toggle');
const links = $('.nav-links');
if (toggle && links){
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

/* Cursor blob */
const blob = $('.cursor-blob');
let mx = 0, my = 0, bx = -999, by = -999;
let vx = 0, vy = 0;

window.addEventListener('mousemove', (e) => {
  mx = e.clientX;
  my = e.clientY;
  if (blob) blob.style.opacity = 0.65;
}, {passive:true});

window.addEventListener('mouseleave', () => {
  if (blob) blob.style.opacity = 0;
}, {passive:true});

function tickBlob(){
  // low gravity follow: spring + damping
  const dx = mx - bx;
  const dy = my - by;
  vx += dx * 0.010;   // spring
  vy += dy * 0.010;
  vx *= 0.82;         // damping
  vy *= 0.82;

  bx += vx;
  by += vy;

  if (blob){
    blob.style.transform = `translate(${bx - 23}px, ${by - 23}px)`;
  }
  requestAnimationFrame(tickBlob);
}
requestAnimationFrame(tickBlob);

/* Scroll reveal */
const io = new IntersectionObserver((entries) => {
  entries.forEach(ent => {
    if (ent.isIntersecting) ent.target.classList.add('on');
  });
}, { threshold: 0.14 });
$$('.reveal').forEach(el => io.observe(el));

/* Gentle drift (very slow) */
const driftEls = $$('[data-drift]');
let t = Math.random() * 1000;

function tickDrift(){
  t += 0.004; // slow
  driftEls.forEach((el, i) => {
    const a = (i + 1) * 0.7;
    const x = Math.sin(t * 0.9 + a) * 4;
    const y = Math.cos(t * 0.8 + a) * 5;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
  requestAnimationFrame(tickDrift);
}
requestAnimationFrame(tickDrift);

/* Demo catalog */

const products = [
  {
    id: "onepiece",
    cat: "onepieces",
    name: "ContourZip One-Piece",
    variant: "Multiple Colors",
    price: 64.99,
    currency: "CAD",
    href: "product-contourzip-onepiece.html",
    img: "assets/onepiece-black.jpg",
    badge: "First Drop"
  }
];


/* Shop page render */
const grid = $('#shopGrid');
function money(n){ return `$${n} CAD`; }

function renderShop(list){
  if (!grid) return;
  grid.innerHTML = list.map(p => `
    <a class="product-card reveal" href="${p.href}">
      <div class="product-media" data-drift="1"><img src="${p.img}" alt="${p.name} image"/></div>
      <div class="product-meta">
        <div class="product-name">${p.name}</div>
        <div class="product-sub muted">${p.variant}</div>
        <div class="product-row">
          <div class="price">${money(p.price)}</div>
          <button class="mini-btn" data-add="${p.id}" onclick="event.preventDefault(); addToCart('${p.id}')">Quick add</button>
        </div>
      </div>
    </a>
  `).join('');
  // re-observe reveals on rerender
  $$('.reveal', grid).forEach(el => io.observe(el));
}

/* Filters */
const chips = $$('.chip');
let activeCat = "all";
chips.forEach(ch => {
  ch.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('active'));
    ch.classList.add('active');
    activeCat = ch.dataset.filter;
    applyShop();
  });
});

/* Sort */
const sortSel = $('#sort');
if (sortSel) sortSel.addEventListener('change', applyShop);

function applyShop(){
  if (!grid) return;
  let list = [...products];
  // URL params
  const params = new URLSearchParams(location.search);
  const catQ = params.get('cat');
  if (catQ) activeCat = catQ;
  // apply filter
  if (activeCat && activeCat !== "all"){
    list = list.filter(p => p.cat === activeCat);
    chips.forEach(x => x.classList.toggle('active', x.dataset.filter === activeCat));
  } else {
    chips.forEach(x => x.classList.toggle('active', x.dataset.filter === "all"));
  }

  const s = (sortSel ? sortSel.value : (params.get('sort') || 'best'));
  if (sortSel && params.get('sort') && !sortSel.value) sortSel.value = params.get('sort');
  if (s === "low") list.sort((a,b) => a.price - b.price);
  if (s === "high") list.sort((a,b) => b.price - a.price);
  if (s === "new") list.sort((a,b) => (a.badge === "New" ? -1 : 1));

  renderShop(list);
}
applyShop();

/* Demo cart */
const CART_KEY = "vera_cart_v1";




function updateCartDot(items = readCart()){
  const dot = $('.cart-dot');
  if (!dot) return;
  dot.classList.toggle('on', items.length > 0);
}





$$('[data-add]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.add;
    if (id === "onepiece") return addToCart(id, { color: "Charcoal Black", size: "M" });
    return addToCart(id);
  });
});
updateCartDot();

/* Cart page render */
const cartWrap = $('#cartItems');
if (cartWrap){
  const items = readCart();
  if (!items.length){
    cartWrap.innerHTML = `<p class="muted">Your cart is empty.</p><a class="btn btn-ghost" href="shop.html">Shop now</a>`;
  } else {
    const subtotal = items.reduce((s,x)=>s+x.price,0);
    cartWrap.innerHTML = items.map((x, i) => `
      <div class="cart-item">
        <div>
          <div style="font-weight:600">${x.name}</div>
          <div class="muted small">Item ${i+1}</div>
        </div>
        <div style="font-weight:600">${money(x.price)}</div>
      </div>
    `).join('');
    const sub = $('#subtotal');
    if (sub) sub.textContent = money(subtotal);
  }

  const checkout = $('#checkoutBtn');
  if (checkout){
    checkout.addEventListener('click', () => {
      alert("Demo checkout. For real checkout, connect Shopify / Stripe.");
    });
  }
}

/* Product page: swatches + sizes */
(function(){
  const swatches = $$('.swatch');
  const sizeBtns = $$('.size');
  const mainImg = $('#mainProductImage');
  const selColor = $('#selColor');
  const selSize = $('#selSize');
  const msg = $('#selectMsg');
  const addBtn = $('[data-add="onepiece"]');

  let currentColor = "Charcoal Black";
  let currentSize = "";

  function showMsg(text){
    if (!msg) return;
    msg.style.display = "block";
    msg.textContent = text;
    clearTimeout(showMsg._t);
    showMsg._t = setTimeout(() => { msg.style.display = "none"; }, 2400);
  }

  if (swatches.length){
    swatches.forEach(sw => {
      sw.addEventListener('click', () => {
        swatches.forEach(x => x.classList.remove('active'));
        sw.classList.add('active');

        const c = sw.dataset.color || "Charcoal Black";
        const img = sw.dataset.img || onepieceColors[c] || onepieceColors["Charcoal Black"];

        currentColor = c;
        if (selColor) selColor.textContent = c;
        if (mainImg) mainImg.src = img;

        // also keep second/third gallery images stable (lifestyle/detail already there)
      });
    });
  }

  if (sizeBtns.length){
    sizeBtns.forEach(b => {
      b.addEventListener('click', () => {
        sizeBtns.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        currentSize = b.textContent.trim();
        if (selSize) selSize.textContent = currentSize;
      });
    });
  }

  if (addBtn){
    addBtn.addEventListener('click', (e) => {
      // if user clicks the sticky button on product page
      if (!currentSize){
        e.preventDefault();
        return showMsg("Pick a size (S, M, or L).");
      }
      addToCart("onepiece", { color: currentColor, size: currentSize });
      showMsg("Added to cart.");
    });
  }
})();


/* Advanced motion layer (subtle, premium) */
(function(){
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  // Parallax (scroll + inertia)
  const parallaxEls = $$('[data-parallax]');
  let sy = window.scrollY || 0;
  let psy = sy;

  window.addEventListener('scroll', () => { sy = window.scrollY || 0; }, {passive:true});

  // Tilt (pointer)
  const tiltEls = $$('[data-tilt]');
  let px = window.innerWidth/2, py = window.innerHeight/2;
  window.addEventListener('pointermove', (e)=>{ px=e.clientX; py=e.clientY; }, {passive:true});

  // Sheen highlight: update CSS vars on hover
  function attachSheen(el){
    el.addEventListener('pointermove', (e)=>{
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left)/r.width)*100;
      const y = ((e.clientY - r.top)/r.height)*100;
      el.style.setProperty('--mx', x + '%');
      el.style.setProperty('--my', y + '%');
    }, {passive:true});
  }
  [...$$('.product-card'), ...$$('.media-frame'), ...$$('.cardbox'), ...$$('.quote-card')].forEach(attachSheen);

  // Magnetic buttons (very light)
  const mags = $$('.btn, .btn-ghost, .nav-cart');
  mags.forEach(el => {
    let tx=0, ty=0;
    el.addEventListener('pointermove', (e)=>{
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) / r.width;
      const dy = (e.clientY - (r.top + r.height/2)) / r.height;
      tx = dx * 6; ty = dy * 6;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });
    el.addEventListener('pointerleave', ()=>{
      el.style.transform = '';
    });
  });

  // RAF loop
  function raf(){
    // smooth scroll lerp
    psy += (sy - psy) * 0.08;

    // parallax elements
    parallaxEls.forEach((el, i)=>{
      const strength = parseFloat(el.dataset.parallax || "0.1");
      const r = el.getBoundingClientRect();
      const center = r.top + r.height/2;
      const viewCenter = window.innerHeight/2;
      const dist = (center - viewCenter) / window.innerHeight;
      const y = (-psy * strength) + dist * 18 * strength;
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    });

    // tilt elements
    tiltEls.forEach((el)=>{
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top + r.height/2;
      const dx = (px - cx) / Math.max(260, r.width);
      const dy = (py - cy) / Math.max(260, r.height);
      const rx = clamp(dy * -6, -6, 6);
      const ry = clamp(dx * 6, -6, 6);
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });

    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

function subscribeEmail(){
  alert("Thanks — you’re on the list.");
}

async function startCheckout() {
  const color = (document.querySelector("#selColor")?.textContent || "").trim();
  const size  = (document.querySelector("#selSize")?.textContent || "").trim();

  if (!size) {
    alert("Pick a size (S, M, or L).");
    return;
  }
  if (!color) {
    alert("Pick a color.");
    return;
  }

  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ color, size })
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.error || "Checkout failed.");
    return;
  }

  window.location.href = data.url;
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("buyNowBtn");
  if (btn) btn.addEventListener("click", startCheckout);

  // Live summary under button (nice + reassuring)
  const sum = document.getElementById("checkoutSummary");
  if (sum) {
    const tick = () => {
      const c = (document.querySelector("#selColor")?.textContent || "Color").trim();
      const s = (document.querySelector("#selSize")?.textContent || "Size").trim();
      sum.textContent = `${c} — ${s}`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
});

function toast(text){
  let el = document.querySelector('.toast');
  if (!el){
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> el.classList.remove('show'), 2200);
}

function addRipple(e){
  const btn = e.currentTarget;
  const r = btn.getBoundingClientRect();
  const s = document.createElement('span');
  s.className = 'ripple';
  const d = Math.max(r.width, r.height);
  s.style.width = s.style.height = d + 'px';
  s.style.left = (e.clientX - r.left - d/2) + 'px';
  s.style.top  = (e.clientY - r.top  - d/2) + 'px';
  btn.appendChild(s);
  setTimeout(()=> s.remove(), 800);
}

function bindBuyNow(){
  const btn = document.getElementById("buyNowBtn");
  if (!btn) return;

  const updateSummary = () => {
    const c = (document.querySelector("#selColor")?.textContent || "Color").trim();
    const s = (document.querySelector("#selSize")?.textContent || "Size").trim();
    const sum = document.getElementById("checkoutSummary");
    if (sum) sum.textContent = `${c} — ${s}`;
  };

  updateSummary();
  setInterval(updateSummary, 200);

  btn.addEventListener("click", async (e)=>{
    try{
      const color = (document.querySelector("#selColor")?.textContent || "").trim();
      const size  = (document.querySelector("#selSize")?.textContent || "").trim();

      if (!size) { toast ? toast("Pick a size (S, M, or L).") : alert("Pick a size (S, M, or L)."); return; }
      if (!color) { toast ? toast("Pick a color.") : alert("Pick a color."); return; }

      // little click feedback
      if (typeof addRipple === "function") addRipple(e);

      const res = await fetch("/api/create-checkout-session", {
        method:"POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ color, size })
      });
      const data = await res.json();
      if (!res.ok) { toast ? toast(data.error || "Checkout failed.") : alert(data.error || "Checkout failed."); return; }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    }catch(err){
      toast ? toast("Checkout error. Try again.") : alert("Checkout error. Try again.");
    }
  });
}

document.addEventListener("DOMContentLoaded", bindBuyNow);
