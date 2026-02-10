/**
 * G300 RAZE V27 — launch-safe interactions
 * - Variant selector updates accent + gallery (3 angles) + "Selected" label
 * - Gallery thumbs swap main image
 * - Currency dropdown updates display prices (estimates)
 * - Ticker loop (smooth)
 * - Reveal on scroll
 * - Checkout uses Stripe Payment Link OR server endpoint (POST)
 */
(() => {
  const state = { variant: "black", angle: 0, currency: "CAD" };

  const basePriceNow = 149.99;
  const basePriceWas = 219.99;

  const currencyRates = { CAD: 1.0, USD: 0.74, EUR: 0.68, GBP: 0.58, AUD: 1.12 }; // display-only
  const currencySymbols = { CAD:"CA$", USD:"US$", EUR:"€", GBP:"£", AUD:"A$" };

  window.STRIPE_CHECKOUT_ENDPOINT = window.STRIPE_CHECKOUT_ENDPOINT || "/api/create-checkout-session";

  const variants = {
    black: {
      name: "BLACKOUT",
      accent: "#ff5a00",
      angles: ["./assets/img/g300-black1.webp","./assets/img/g300-black2.webp","./assets/img/g300-black3.webp"]
    },
    blue: {
      name: "ELECTRIC BLUE",
      accent: "#2d7cff",
      angles: ["./assets/img/g300-blue1.webp","./assets/img/g300-blue2.webp","./assets/img/g300-blue3.webp"]
    },
    orange: {
      name: "ORANGE CHAOS",
      accent: "#ff5a00",
      angles: ["./assets/img/g300-orange1.webp","./assets/img/g300-orange2.webp","./assets/img/g300-orange3.webp"]
    },
  };

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function setAccent(vKey){
    const v = variants[vKey];
    if(!v) return;
    document.documentElement.style.setProperty("--accent", v.accent);
  }

  function fmtPrice(cur, value){
    const sym = currencySymbols[cur] || "";
    return sym + value.toFixed(2);
  }

  function setCurrency(cur){
    state.currency = cur;
    const r = currencyRates[cur] || 1;
    const now = fmtPrice(cur, basePriceNow * r);
    const was = fmtPrice(cur, basePriceWas * r);

    const ids = ["priceNow","priceWas","priceNow2","priceWas2"];
    const elNow = $("#priceNow"), elWas=$("#priceWas"), elNow2=$("#priceNow2"), elWas2=$("#priceWas2");
    if(elNow) elNow.textContent = now;
    if(elWas) elWas.textContent = was;
    if(elNow2) elNow2.textContent = now;
    if(elWas2) elWas2.textContent = was;

    const curBtn = $("#currencyBtn");
    if(curBtn) curBtn.textContent = cur;
  }

  function setAngle(i){
    state.angle = i;
    const v = variants[state.variant];
    const src = v.angles[i] || v.angles[0];

    const main = $("#galleryMain");
    if(main) main.src = src;

    $$(".gThumb").forEach((b, idx)=>{
      b.classList.toggle("is-active", idx === i);
      b.setAttribute("aria-pressed", idx === i ? "true" : "false");
    });

    
    
  }

  function setVariant(vKey){
    const v = variants[vKey];
    if(!v) return;
    state.variant = vKey;

    setAccent(vKey);

    $$(".swatch").forEach(btn=>{
      const active = btn.dataset.variant === vKey;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    const buyColor = $("#buyColor");
    if(buyColor) buyColor.textContent = v.name;

    const thumbs = $$(".gThumb img");
    thumbs.forEach((img, idx)=>{
      if(img) img.src = v.angles[idx] || v.angles[0];
    });

    setAngle(0);
  }

  function initVariantUI(){
    $$(".swatch").forEach(btn=>{
      btn.addEventListener("click", ()=> setVariant(btn.dataset.variant));
    });
    $$(".gThumb").forEach((btn, idx)=>{
      btn.addEventListener("click", ()=> setAngle(idx));
    });
  }

  function initCurrency(){
    const btn = $("#currencyBtn");
    const menu = $("#currencyMenu");
    if(!btn || !menu) return;

    const toggle = (open) => {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      menu.style.display = open ? "block" : "none";
    };

    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      toggle(!(menu.style.display === "block"));
    });

    $$("button[data-cur]", menu).forEach(opt=>{
      opt.addEventListener("click", ()=>{
        setCurrency(opt.dataset.cur);
        toggle(false);
      });
    });

    document.addEventListener("click", ()=> toggle(false));
  }

  function initReveals(){
    const els = $$(".reveal");
    if(!("IntersectionObserver" in window) || els.length === 0){
      els.forEach(el=> el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14 });
    els.forEach(el=> io.observe(el));
  }

  function initTicker(){
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduce) return;

    const track = $(".ticker__track");
    if(!track) return;

    let x = 0;
    let last = performance.now();
    const speed = 52;
    const gap = 18;

    function tick(now){
      const dt = Math.min(48, now-last)/1000;
      last = now;
      x -= speed*dt;

      const first = track.firstElementChild;
      if(first){
        const w = first.getBoundingClientRect().width || first.offsetWidth || 0;
        if(w && (-x) >= (w + gap)){
          x += (w + gap);
          track.appendChild(first);
        }
      }
      track.style.transform = `translate3d(${x}px,0,0)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  async function startCheckout(){
    const paymentLink = window.STRIPE_PAYMENT_LINK;
    const endpoint = window.STRIPE_CHECKOUT_ENDPOINT;

    if(paymentLink){
      const url = new URL(paymentLink);
      url.searchParams.set("variant", state.variant);
      window.location.href = url.toString();
      return;
    }

    if(endpoint){
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant: state.variant })
      });
      if(res.ok){
        const data = await res.json();
        if(data?.url) { window.location.href = data.url; return; }
      }
    }

    alert("Checkout isn't live yet — set Stripe env vars on Vercel (STRIPE_PAYMENT_LINK or your /api endpoint).");
  }

  function initCheckout(){
    const buttons = ["#checkoutBtn","[data-checkout]"].flatMap(sel => $$(sel));
    buttons.forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        e.preventDefault();
        btn.disabled = true;
        const prev = btn.textContent;
        btn.textContent = "Loading…";
        startCheckout().finally(()=>{
          btn.disabled = false;
          btn.textContent = prev;
        });
      });
    });
  }

  // boot
  setCurrency("CAD");
  initCurrency();
  initVariantUI();
  initReveals();
  initTicker();
  initCheckout();
  setVariant("black");
})();
