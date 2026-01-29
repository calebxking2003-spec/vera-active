/**
 * G300 RAZE — interactions (CLEAN, single checkout)
 * - Variant + size selectors (updates images + accents)
 * - Scroll reveals
 * - ONE checkout button in the Buy section (no duplicate handlers)
 *
 * IMPORTANT: product images are NOT animated.
 */

window.STRIPE_CHECKOUT_ENDPOINT = "/api/create-checkout-session";

const state = { variant: "black", size: "small" };

const variantData = {
  black: { name:"BLACKOUT", img:"./assets/img/variant-black.webp", accent:"#b6ff00", accent2:"#00d4ff",
    fitNoteSmall:"TIGHTER SPORT FIT.", fitNoteLarge:"ROOMIER SPORT FIT." },
  blue: { name:"ELECTRIC BLUE", img:"./assets/img/variant-blue.webp", accent:"#00d4ff", accent2:"#2d7cff",
    fitNoteSmall:"TIGHTER SPORT FIT.", fitNoteLarge:"ROOMIER SPORT FIT." },
  orange: { name:"ORANGE CHAOS", img:"./assets/img/variant-orange.webp", accent:"#ff5a00", accent2:"#00ffc6",
    fitNoteSmall:"TIGHTER SPORT FIT.", fitNoteLarge:"ROOMIER SPORT FIT." }
};

function setCSSAccent(k){
  const v = variantData[k]; if(!v) return;
  document.documentElement.style.setProperty("--accent", v.accent);
  document.documentElement.style.setProperty("--accent2", v.accent2);
}

function setVariant(k){
  if(!variantData[k]) return;
  state.variant = k;

  document.querySelectorAll(".swatch").forEach(btn=>{
    const active = btn.dataset.variant === k;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  const nextSrc = variantData[k].img;
  const hero = document.getElementById("heroProduct");
  const spec = document.getElementById("specProduct");
  if(hero) hero.src = nextSrc;
  if(spec) spec.src = nextSrc;

  const bc = document.getElementById("buyColor");
  if(bc) bc.textContent = variantData[k].name;

  const note = document.getElementById("fitNote");
  if(note){
    note.textContent = state.size === "large" ? variantData[k].fitNoteLarge : variantData[k].fitNoteSmall;
  }

  setCSSAccent(k);
}

function setSize(s){
  if(s !== "small" && s !== "large") return;
  state.size = s;

  document.querySelectorAll(".pill").forEach(btn=>{
    const active = btn.dataset.size === s;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  const bs = document.getElementById("buySize");
  if(bs) bs.textContent = s.toUpperCase();

  const v = variantData[state.variant];
  const note = document.getElementById("fitNote");
  if(note && v){
    note.textContent = s === "large" ? v.fitNoteLarge : v.fitNoteSmall;
  }
}

function initPickers(){
  document.querySelectorAll(".swatch").forEach(btn=>{
    btn.addEventListener("click", ()=> setVariant(btn.dataset.variant));
  });
  document.querySelectorAll(".pill").forEach(btn=>{
    btn.addEventListener("click", ()=> setSize(btn.dataset.size));
  });
  document.querySelectorAll(".js-set").forEach(a=>{
    a.addEventListener("click", ()=> {
      const v = a.dataset.variant;
      if(v) setVariant(v);
    });
  });
}

function initReveals(){
  const els = document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){
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
  }, { threshold: 0.12 });
  els.forEach(el=> io.observe(el));
}

async function checkout(){
  const btn = document.getElementById("checkoutBtn");
  if(!window.STRIPE_CHECKOUT_ENDPOINT){
    alert("Checkout unavailable — missing endpoint.");
    return;
  }
  const old = btn ? btn.textContent : "";
  try{
    if(btn){ btn.disabled = true; btn.textContent = "LOADING…"; }
    const res = await fetch(window.STRIPE_CHECKOUT_ENDPOINT, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ variant: state.variant, size: state.size })
    });
    const data = await res.json().catch(()=> ({}));
    if(res.ok && data?.url){
      window.location.href = data.url;
      return;
    }
    console.error("Checkout API error:", res.status, data);
    alert("Checkout error — check Vercel env vars + logs.");
  }catch(err){
    console.error(err);
    alert("Checkout error — check console + Vercel logs.");
  }finally{
    if(btn){ btn.disabled = false; btn.textContent = old || "CHECKOUT"; }
  }
}

function initBuyScrollLinks(){
  const go = (e)=>{
    e.preventDefault();
    document.getElementById("buy")?.scrollIntoView({ behavior:"smooth", block:"start" });
  };
  document.querySelectorAll(".js-buy, [data-buy], a[href='#buy']").forEach(el=>{
    el.addEventListener("click", go);
  });
}

function initCheckoutButton(){
  document.getElementById("checkoutBtn")?.addEventListener("click", checkout);
}

(function init(){
  setCSSAccent("black");
  setVariant("black");
  setSize("small");
  initPickers();
  initReveals();
  initBuyScrollLinks();
  initCheckoutButton();
})();
