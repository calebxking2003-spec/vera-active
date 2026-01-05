
(function(){
  const COLORS = {
    black: { img: "assets/images/black.png" },
    green: { img: "assets/images/green.png" },
    orange:{ img: "assets/images/orange.png" }
  };

  const main = document.getElementById("mainProduct");
  const swatchBtns = Array.from(document.querySelectorAll(".swatchBtn"));
  const thumbs = Array.from(document.querySelectorAll(".thumb"));

  function setColor(color, {pushState=true} = {}){
    if(!COLORS[color]) color = "black";

    // Image swap (this is the only truth source)
    main.src = COLORS[color].img;

    // Swatch active
    swatchBtns.forEach(b=>{
      const is = b.dataset.color === color;
      b.classList.toggle("active", is);
      b.setAttribute("aria-checked", is ? "true" : "false");
    });

    // Thumb active
    thumbs.forEach(t=> t.classList.toggle("active", t.dataset.color === color));

    // URL param
    if(pushState){
      const url = new URL(window.location.href);
      url.searchParams.set("color", color);
      window.history.replaceState({}, "", url.toString());
    }
  }

  // Swatch click
  swatchBtns.forEach(b=>{
    b.addEventListener("click", ()=> setColor(b.dataset.color));
  });

  // Thumb click
  thumbs.forEach(t=>{
    t.addEventListener("click", ()=> setColor(t.dataset.color));
  });

  // Init from URL
  const url = new URL(window.location.href);
  const initial = url.searchParams.get("color") || "black";
  setColor(initial, {pushState:false});

  // Size select
  const sizeBtns = Array.from(document.querySelectorAll(".size"));
  sizeBtns.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      sizeBtns.forEach(b=>{ b.classList.remove("active"); b.setAttribute("aria-checked","false"); });
      btn.classList.add("active");
      btn.setAttribute("aria-checked","true");
    });
  });
})();


/* Checkout upsell: leash modal (30-min suppression, robust triggers) */
(function(){
  const overlay = document.getElementById("upsellOverlay");
  const checkoutBtn = document.getElementById("checkoutBtn");
  if(!overlay || !checkoutBtn) return;

  const closeBtn = document.getElementById("upsellClose");
  const addBtn = document.getElementById("addLeashBtn");
  const noBtn = document.getElementById("noThanksBtn");

  const KEY = "thedogface_upsell_snooze_until";
  const now = () => Date.now();

  function shouldShow(){
    const until = Number(sessionStorage.getItem(KEY) || "0");
    return now() > until;
  }
  function snooze30min(){ sessionStorage.setItem(KEY, String(now() + 30*60*1000)); }

  function openModal(){
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden","false");
  }
  function closeModal(){
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden","true");
  }
  function goCheckout(){ window.location.href = "checkout.html"; }

  checkoutBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    if(shouldShow()) openModal();
    else goCheckout();
  });

  closeBtn?.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e)=>{ if(e.target === overlay) closeModal(); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeModal(); });

  addBtn?.addEventListener("click", ()=>{
    sessionStorage.setItem("thedogface_leash_added","1");
    closeModal();
    goCheckout();
  });
  noBtn?.addEventListener("click", ()=>{
    snooze30min();
    closeModal();
    goCheckout();
  });
})();

/* Persist selections (color + size) for cart/checkout */
(function(){
  const main = document.getElementById("mainProduct");
  const swatches = Array.from(document.querySelectorAll(".swatchBtn"));
  const thumbs = Array.from(document.querySelectorAll(".thumb"));
  const sizes = Array.from(document.querySelectorAll(".size"));

  function setSelectedColor(color){
    sessionStorage.setItem("thedogface_selected_color", color);
  }
  function setSelectedSize(size){
    sessionStorage.setItem("thedogface_selected_size", size);
  }

  // Listen swatches/thumbs
  [...swatches, ...thumbs].forEach(el=>{
    el.addEventListener("click", ()=>{
      const c = el.dataset.color;
      if(c) setSelectedColor(c);
    });
  });

  // Init on load from URL or main image
  try{
    const url = new URL(window.location.href);
    const c = url.searchParams.get("color");
    if(c) setSelectedColor(c);
  }catch(e){}

  // Sizes
  sizes.forEach(el=>{
    el.addEventListener("click", ()=>{
      const s = el.dataset.size || el.textContent.trim();
      if(s) setSelectedSize(s);
    });
  });

  // Default size + color if missing
  if(!sessionStorage.getItem("thedogface_selected_size")){
    const active = document.querySelector(".size.active");
    if(active) setSelectedSize(active.dataset.size || active.textContent.trim());
  }
  if(!sessionStorage.getItem("thedogface_selected_color")){
    sessionStorage.setItem("thedogface_selected_color","black");
  }
})();

/* PDP upsell intercept (before going to cart) */
(function(){
  const addBtn = document.getElementById("addToCartBtn");
  const buyBtn = document.getElementById("buyNowBtn");
  const overlay = document.getElementById("upsellOverlay");
  if(!overlay || (!addBtn && !buyBtn)) return;

  const closeBtn = document.getElementById("upsellClose");
  const addLeash = document.getElementById("addLeashBtn");
  const noThanks = document.getElementById("noThanksBtn");

  const KEY = "thedogface_upsell_snooze_until";
  const now = () => Date.now();

  function shouldShow(){
    const until = Number(sessionStorage.getItem(KEY) || "0");
    return now() > until;
  }
  function snooze30min(){ sessionStorage.setItem(KEY, String(now() + 30*60*1000)); }

  function open(){ overlay.classList.add("open"); overlay.setAttribute("aria-hidden","false"); }
  function close(){ overlay.classList.remove("open"); overlay.setAttribute("aria-hidden","true"); }

  function goCart(){ try{ window.__dogfaceAddSelectedToCart && window.__dogfaceAddSelectedToCart(); }catch(e){} window.location.href = "cart.html"; }

  function handler(e){
    // always route through modal unless snoozed
    e.preventDefault();
    if(shouldShow()) open();
    else goCart();
  }

  addBtn?.addEventListener("click", handler);
  buyBtn?.addEventListener("click", handler);

  closeBtn?.addEventListener("click", close);
  overlay.addEventListener("click", (e)=>{ if(e.target === overlay) close(); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") close(); });

  addLeash?.addEventListener("click", ()=>{
    sessionStorage.setItem("thedogface_leash_added","1");
    close();
    goCart();
  });
  noThanks?.addEventListener("click", ()=>{
    snooze30min();
    close();
    goCart();
  });
})();

/* DOGFACE_CART_SYSTEM: localStorage cart with quantities + variants */
(function(){
  const CART_KEY = "thedogface_cart_v1";
  const MONEY = (n)=>"$" + (Math.round(n*100)/100).toFixed(2);

  const imgMap = {
    black:"assets/images/black.png",
    green:"assets/images/green.png",
    orange:"assets/images/orange.png"
  };

  function loadCart(){
    try{ return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }catch(e){ return []; }
  }
  function saveCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); }
  function addItem(item){
    const items = loadCart();
    const key = item.sku;
    const found = items.find(i=>i.sku===key);
    if(found){ found.qty += item.qty; }
    else { items.push(item); }
    saveCart(items);
  }
  function removeItem(sku){
    const items = loadCart().filter(i=>i.sku!==sku);
    saveCart(items);
  }
  function setQty(sku, qty){
    const items = loadCart();
    const it = items.find(i=>i.sku===sku);
    if(!it) return;
    it.qty = Math.max(1, Math.min(99, qty|0));
    saveCart(items);
  }
  function cartTotals(items){
    let sub = 0;
    items.forEach(i=> sub += (i.price * i.qty));
    return {subtotal: sub, total: sub};
  }

  // Expose for pages
  window.DogfaceCart = {loadCart, saveCart, addItem, removeItem, setQty, cartTotals, MONEY, imgMap};
})();

/* DOGFACE_PDP_ADD: add selected variant to cart */
(function(){
  const addBtn = document.getElementById("addToCartBtn");
  const buyBtn = document.getElementById("buyNowBtn");
  if(!addBtn && !buyBtn) return;
  if(!window.DogfaceCart) return;

  function getSelected(){
    const color = (sessionStorage.getItem("thedogface_selected_color") || "black").toLowerCase();
    const size = (sessionStorage.getItem("thedogface_selected_size") || "S").toUpperCase();
    return {color, size};
  }

  function buildItem(){
    const sel = getSelected();
    const price = 64.99; // sale price
    const name = "THE DOG FACE™ Puffer Jacket";
    const sku = `puffer-${sel.color}-${sel.size}`;
    return {
      sku,
      name,
      color: sel.color,
      size: sel.size,
      price,
      qty: 1,
      img: (window.DogfaceCart.imgMap[sel.color] || window.DogfaceCart.imgMap.black)
    };
  }

  function addToCartAndGoCart(){
    window.DogfaceCart.addItem(buildItem());
    window.location.href = "cart.html";
  }

  // If upsell modal exists, the existing handler opens it first.
  // We'll only attach if buttons aren't already prevented. Use capture so it runs after modal decision.
  addBtn?.addEventListener("dogface_add", addToCartAndGoCart);

  // Fallback: if no upsell overlay, click should add immediately.
  const overlay = document.getElementById("upsellOverlay");
  if(!overlay){
    addBtn?.addEventListener("click",(e)=>{ e.preventDefault(); addToCartAndGoCart(); });
    buyBtn?.addEventListener("click",(e)=>{ e.preventDefault(); addToCartAndGoCart(); });
  }

  // If upsell flow used, we hook when modal completes by watching navigation to cart; but easiest:
  // also add on modal accept/decline right before going to cart (handled in existing code by redirect).
  // We'll add a small helper on window for modal code to call:
  window.__dogfaceAddSelectedToCart = function(){
    window.DogfaceCart.addItem(buildItem());
  };
})();

/* DOGFACE_STICKY_BAR: show on mobile after scroll */
(function(){
  const bar = document.getElementById("stickyBar");
  const btn = document.getElementById("stickyPreorderBtn");
  if(!bar || !btn) return;

  function updateVisibility(){
    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    const y = window.scrollY || document.documentElement.scrollTop;
    if(isMobile && y > 520){
      bar.classList.add("open");
      bar.setAttribute("aria-hidden","false");
    }else{
      bar.classList.remove("open");
      bar.setAttribute("aria-hidden","true");
    }
  }
  updateVisibility();
  window.addEventListener("scroll", updateVisibility, {passive:true});
  window.addEventListener("resize", updateVisibility);

  btn.addEventListener("click", (e)=>{
    e.preventDefault();
    const buy = document.getElementById("buyNowBtn") || document.getElementById("addToCartBtn");
    if(buy) buy.click();
    else window.location.href="cart.html";
  });
})();

/* Email capture placeholder */
(function(){
  const btn = document.getElementById("emailJoinBtn");
  const input = document.getElementById("emailInput");
  if(!btn || !input) return;
  btn.addEventListener("click", ()=>{
    const v = (input.value||"").trim();
    if(!v || !v.includes("@")){ input.focus(); return; }
    sessionStorage.setItem("thedogface_email_capture", v);
    btn.textContent = "Added";
    btn.disabled = true;
    setTimeout(()=>{ btn.textContent="Join"; btn.disabled=false; }, 1600);
    input.value="";
  });
})();

/* DOGFACE_MOTION_INIT */
(function(){
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.addEventListener("load", ()=>{ document.body.classList.add("is-loaded"); });

  // Paw field
  if(!reduce && !document.querySelector(".pawField")){
    const field = document.createElement("div");
    field.className = "pawField";
    const pawSVG = `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 27c3 0 6-3 6-7s-3-8-6-8-6 4-6 8 3 7 6 7Zm20 0c3 0 6-3 6-7s-3-8-6-8-6 4-6 8 3 7 6 7ZM13 38c2 0 4-2 4-5s-2-6-4-6-4 3-4 6 2 5 4 5Zm38 0c2 0 4-2 4-5s-2-6-4-6-4 3-4 6 2 5 4 5Z" fill="rgba(0,0,0,.18)"/>
        <path d="M32 56c-9 0-16-6-16-13 0-5 5-9 10-10 3-1 6 1 6 3 0-2 3-4 6-3 5 1 10 5 10 10 0 7-7 13-16 13Z" fill="rgba(0,0,0,.14)"/>
      </svg>`;
    const count = window.matchMedia("(max-width: 900px)").matches ? 10 : 16;
    for(let i=0;i<count;i++){
      const p = document.createElement("div");
      p.className = "paw";
      const x = Math.random()*window.innerWidth;
      const y = Math.random()*window.innerHeight;
      const r = (Math.random()*70-35).toFixed(1)+"deg";
      const s = (0.8+Math.random()*0.7).toFixed(2);
      const o = (0.06+Math.random()*0.10).toFixed(2);
      p.style.setProperty("--x", x+"px");
      p.style.setProperty("--y", y+"px");
      p.style.setProperty("--r", r);
      p.style.setProperty("--s", s);
      p.style.setProperty("--o", o);
      p.style.animation = `pawDrift 22s linear ${(-Math.random()*10).toFixed(2)}s infinite`;
      p.innerHTML = pawSVG;
      field.appendChild(p);
    }
    document.body.prepend(field);
    if(!window.matchMedia("(max-width: 900px)").matches){
      window.addEventListener("mousemove",(e)=>{
        const dx = (e.clientX/window.innerWidth - 0.5);
        const dy = (e.clientY/window.innerHeight - 0.5);
        field.style.transform = `translate3d(${dx*8}px, ${dy*10}px, 0)`;
      }, {passive:true});
    }
  }

  const heroImg = document.getElementById("mainProduct");
  if(heroImg && !reduce) heroImg.classList.add("floaty");
  const cta = document.querySelector(".ctaRow .btn");
  if(cta && !reduce) cta.classList.add("breathe");

  const h = document.querySelector("h1, .hero h1, .heroTitle");
  if(h && !h.dataset.split){
    const words = h.textContent.trim().split(/\s+/);
    h.textContent = "";
    words.forEach((w, i)=>{
      const span = document.createElement("span");
      span.className = "word";
      span.style.animationDelay = (i*0.08)+"s";
      span.textContent = w + (i<words.length-1 ? " " : "");
      h.appendChild(span);
    });
    h.dataset.split = "1";
  }

  const revealTargets = [];
  document.querySelectorAll("section, .block, .trustCard, .cartItem, .reviewCard").forEach((el)=>{
    el.classList.add("reveal");
    revealTargets.push(el);
  });
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((ent)=>{
      if(ent.isIntersecting){
        ent.target.classList.add("is-in");
        io.unobserve(ent.target);
      }
    });
  }, {threshold: 0.12});
  revealTargets.forEach((el, idx)=>{
    el.classList.add("delay-"+((idx%4)+1));
    io.observe(el);
  });

  if(!reduce && !window.matchMedia("(max-width: 900px)").matches){
    document.querySelectorAll(".btn").forEach((btn)=>{
      btn.classList.add("magnet");
      btn.addEventListener("mousemove",(e)=>{
        const r = btn.getBoundingClientRect();
        const mx = (e.clientX - (r.left + r.width/2)) * 0.12;
        const my = (e.clientY - (r.top + r.height/2)) * 0.12;
        btn.style.setProperty("--mx", mx.toFixed(1)+"px");
        btn.style.setProperty("--my", my.toFixed(1)+"px");
        btn.classList.add("is-hover");
      });
      btn.addEventListener("mouseleave",()=>{
        btn.style.setProperty("--mx","0px");
        btn.style.setProperty("--my","0px");
        btn.classList.remove("is-hover");
      });
    });
  }

  document.addEventListener("click",(e)=>{
    const b = e.target.closest(".btn, .swatchBtn, .size");
    if(!b) return;
    b.classList.remove("pop");
    void b.offsetWidth;
    b.classList.add("pop");
    if(b.classList.contains("swatchBtn") || b.classList.contains("size")){
      b.classList.add("wiggleOnce");
      setTimeout(()=>b.classList.remove("wiggleOnce"), 520);
    }
  });

  const main = document.getElementById("mainProduct");
  if(main){
    function softSwap(){
      if(reduce) return;
      main.classList.add("swapFadeOut");
      setTimeout(()=>{
        main.classList.remove("swapFadeOut");
        main.classList.add("swapFadeIn");
        setTimeout(()=>main.classList.remove("swapFadeIn"), 260);
      }, 90);
    }
    document.querySelectorAll(".swatchBtn, .thumb").forEach((el)=> el.addEventListener("click", softSwap));
  }

  document.querySelectorAll(".reviewCard").forEach((c, i)=>{
    c.classList.add("dealIn");
    c.style.transitionDelay = (i*0.08)+"s";
  });
  const rio = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){
        ent.target.classList.add("is-in");
        ent.target.querySelectorAll(".stars, .starRow, .rating").forEach(s=>{
          s.classList.add("starShimmer");
          setTimeout(()=>s.classList.remove("starShimmer"), 1300);
        });
        rio.unobserve(ent.target);
      }
    });
  }, {threshold:0.2});
  document.querySelectorAll(".reviewCard.dealIn").forEach(el=>rio.observe(el));
})();

/* DOGFACE_ABANDONED_CART */
(function(){
  const email = sessionStorage.getItem("thedogface_email_capture");
  const cart = localStorage.getItem("thedogface_cart_v1");
  if(email && cart){
    localStorage.setItem("thedogface_abandoned_payload", JSON.stringify({
      email: email,
      cart: JSON.parse(cart),
      ts: Date.now()
    }));
  }
})();
