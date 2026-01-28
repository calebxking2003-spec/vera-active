
/**
 * Pit Viper-ish site interactions:
 * - Variant + size selectors (updates images + accent colors)
 * - Scroll reveals (IntersectionObserver)
 * - Checkout button wiring (Stripe Payment Link OR your endpoint)
 *
 * IMPORTANT: product images are NOT animated (no transforms).
 */

const state = {
  variant: "black",
  size: "small",
};

const variantData = {
  black: {
    name: "BLACKOUT",
    img: "./assets/img/variant-black.webp",
    accent: "#b6ff00",
    accent2: "#00d4ff",
    fitNoteSmall: "TIGHTER SPORT FIT.",
    fitNoteLarge: "ROOMIER SPORT FIT.",
  },
  blue: {
    name: "ELECTRIC BLUE",
    img: "./assets/img/variant-blue.webp",
    accent: "#00d4ff",
    accent2: "#2d7cff",
    fitNoteSmall: "TIGHTER SPORT FIT.",
    fitNoteLarge: "ROOMIER SPORT FIT.",
  },
  orange: {
    name: "ORANGE CHAOS",
    img: "./assets/img/variant-orange.webp",
    accent: "#ff5a00",
    accent2: "#00ffc6",
    fitNoteSmall: "TIGHTER SPORT FIT.",
    fitNoteLarge: "ROOMIER SPORT FIT.",
  }
};

function setCSSAccent(vKey){
  const v = variantData[vKey];
  document.documentElement.style.setProperty("--accent", v.accent);
  document.documentElement.style.setProperty("--accent2", v.accent2);
}

function setVariant(vKey){
  if(!variantData[vKey]) return;
  state.variant = vKey;

  // update swatches
  document.querySelectorAll(".swatch").forEach(btn=>{
    const active = btn.dataset.variant === vKey;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  // update images (instant swap)
  const nextSrc = variantData[vKey].img;
  const hero = document.getElementById("heroProduct");
  const spec = document.getElementById("specProduct");
  if(hero) hero.src = nextSrc;
  if(spec) spec.src = nextSrc;

  // update buy summary
  const bc = document.getElementById("buyColor");
  if(bc) bc.textContent = variantData[vKey].name;

  setCSSAccent(vKey);
}

function setSize(sizeKey){
  state.size = sizeKey;

  document.querySelectorAll(".pill").forEach(btn=>{
    const active = btn.dataset.size === sizeKey;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  const bs = document.getElementById("buySize");
  if(bs) bs.textContent = sizeKey.toUpperCase();

  const note = document.getElementById("fitNote");
  const v = variantData[state.variant];
  if(note){
    note.textContent = sizeKey === "large" ? v.fitNoteLarge : v.fitNoteSmall;
  }
}

function initPickers(){
  document.querySelectorAll(".swatch").forEach(btn=>{
    btn.addEventListener("click", ()=> setVariant(btn.dataset.variant));
  });
  document.querySelectorAll(".pill").forEach(btn=>{
    btn.addEventListener("click", ()=> setSize(btn.dataset.size));
  });

  // poster buttons
  document.querySelectorAll(".js-set").forEach(a=>{
    a.addEventListener("click", ()=>{
      const v = a.dataset.variant;
      if(v) setVariant(v);
    });
  });
}

function initReveals(){
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el=> io.observe(el));
}

function initCheckout(){
  const btn = document.getElementById("checkoutBtn");

  // Option A: Stripe Payment Link (recommended for quick launch)
  // Example: window.STRIPE env vars = "https://buy.stripe.com/xxxx";
  const paymentLink = window.STRIPE env vars;

  // Option B: Your server endpoint that creates a Stripe Checkout Session
  // Example: window.STRIPE_CHECKOUT_ENDPOINT = "/api/create-checkout-session";
  const endpoint = window.STRIPE_CHECKOUT_ENDPOINT;

  if(!btn) return;

  btn.addEventListener("click", async ()=>{
    if(paymentLink){
      const url = new URL(paymentLink);
      // optional: pass selection metadata via query params (depends on your Stripe setup)
      url.searchParams.set("variant", state.variant);
      url.searchParams.set("size", state.size);
      window.location.href = url.toString();
      return;
    }

    if(endpoint){
      btn.disabled = true;
      btn.textContent = "LOADING…";
      try{
        const res = await fetch(endpoint, {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            variant: state.variant,
            size: state.size,
            price_cad: 94.99
          })
        });
        const data = await res.json();
        if(data && data.url){
          window.location.href = data.url;
        } else {
          alert("Checkout is not configured yet. Add STRIPE env vars or STRIPE_CHECKOUT_ENDPOINT.");
        }
      } catch(err){
        console.error(err);
        alert("Checkout error. Check console.");
      } finally{
        btn.disabled = false;
        btn.textContent = "CHECKOUT";
      }
      return;
    }

    alert("Checkout is not configured yet. Add STRIPE env vars or STRIPE_CHECKOUT_ENDPOINT in app.js / window.");
  });
}

function initBuyAnchors(){
  document.querySelectorAll(".js-buy").forEach(a=>{
    a.addEventListener("click", ()=>{
      // nothing special, anchor scroll
    });
  });
}

(function init(){
  setCSSAccent("black");
  setVariant("black");
  setSize("small");
  initPickers();
  initReveals();
  initCheckout();
  initBuyAnchors();
})();


async function __g300Checkout(payload){
  const res = await fetch(window.STRIPE_CHECKOUT_ENDPOINT, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data?.url) window.location.href = data.url;
  alert("Checkout error. Check Vercel env vars + deployment logs.");
}

function __getSelectedVariant(){
  return (window.state && window.state.variant) || (typeof state !== "undefined" && state.variant) || "black";
}
function __getSelectedSize(){
  return (window.state && window.state.size) || (typeof state !== "undefined" && state.size) || "small";
}

document.querySelectorAll('[data-checkout], #checkoutBtn, a[href="#buy"], a[href="#checkout"]').forEach((el)=>{
  el.addEventListener("click", (e)=>{
    // Only intercept if element is a button/cta, not general anchors
    if (el.tagName === "A") e.preventDefault();
    __g300Checkout({ variant: __getSelectedVariant(), size: __getSelectedSize() });
  });
});
