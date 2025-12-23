// VÉRA ACTIVE — minimal premium interactions

(function(){
  const $ = (q, r=document) => r.querySelector(q);
  const $$ = (q, r=document) => Array.from(r.querySelectorAll(q));

  // year
  document.addEventListener("DOMContentLoaded", () => {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  });

  // toast
  window.toast = function(text){
    let el = $(".toast");
    if (!el){
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(window.toast._t);
    window.toast._t = setTimeout(()=> el.classList.remove("show"), 2200);
  };

  // ripple
  function ripple(e){
    const btn = e.currentTarget;
    if (!btn || !btn.getBoundingClientRect) return;
    const r = btn.getBoundingClientRect();
    const s = document.createElement("span");
    s.className = "ripple";
    const d = Math.max(r.width, r.height);
    s.style.width = s.style.height = d + "px";
    s.style.left = (e.clientX - r.left - d/2) + "px";
    s.style.top  = (e.clientY - r.top  - d/2) + "px";
    btn.appendChild(s);
    setTimeout(()=> s.remove(), 800);
  }

  // sheen tracking on .btn
  function sheen(e){
    const btn = e.currentTarget;
    const r = btn.getBoundingClientRect();
    btn.style.setProperty("--rx", ((e.clientX - (r.left+r.width/2)) * 0.045) + "px");
    btn.style.setProperty("--ry", ((e.clientY - (r.top+r.height/2)) * 0.045) + "px");
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$(".btn, .btn-ghost").forEach(b=>{
      b.addEventListener("click", ripple);
      b.addEventListener("pointermove", sheen);
      b.addEventListener("pointerleave", ()=>{ b.style.setProperty("--rx","0px"); b.style.setProperty("--ry","0px"); });
    });
  });

  // float elements (slow low-gravity)
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce){
    let t = 0;
    const floatEls = () => {
      t += 0.004;
      $("[data-float]") && $("[data-float]"); // touch
      $$("[data-float]").forEach((el, i)=>{
        const a = 5 + (i%3)*1.5;
        const x = Math.sin(t + i*0.6) * a;
        const y = Math.cos(t + i*0.7) * (a*0.7);
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      requestAnimationFrame(floatEls);
    };
    requestAnimationFrame(floatEls);
  }

  // Product page logic
  function bindProduct(){
    const main = $("#mainImage");
    const selColor = $("#selColor");
    const selSize = $("#selSize");
    const summary = $("#checkoutSummary");

    if (!main) return; // not on product page

    // thumbs
    $$(".thumb").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        $$(".thumb").forEach(b=> b.classList.remove("active"));
        btn.classList.add("active");
        const img = btn.getAttribute("data-img");
        if (img) main.src = img;
      });
    });

    // swatches
    $$(".swatch").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        $$(".swatch").forEach(b=> b.classList.remove("active"));
        btn.classList.add("active");
        const color = btn.getAttribute("data-color") || "";
        const img = btn.getAttribute("data-img") || "";
        if (selColor) selColor.textContent = color;
        if (summary) summary.textContent = `${color} — ${selSize?.textContent || "Select"}`;
        if (img) main.src = img;
        // sync thumb active if matches
        const match = $(`.thumb[data-img="${img}"]`);
        if (match){
          $$(".thumb").forEach(b=> b.classList.remove("active"));
          match.classList.add("active");
        }
      });
    });

    // sizes
    $$(".size").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        $$(".size").forEach(b=> b.classList.remove("active"));
        btn.classList.add("active");
        const size = btn.getAttribute("data-size") || "Select";
        if (selSize) selSize.textContent = size;
        const c = selColor?.textContent || "Color";
        if (summary) summary.textContent = `${c} — ${size}`;
      });
    });

    // Buy now
    const buy = $("#buyNowBtn");
    if (buy){
      buy.addEventListener("click", async ()=>{
        const color = (selColor?.textContent || "").trim();
        const size = (selSize?.textContent || "").trim();
        if (!size || size === "Select") return window.toast("Pick a size (S, M, or L).");
        if (!color) return window.toast("Pick a color.");

        buy.disabled = true;
        buy.textContent = "Opening checkout…";

        try{
          const res = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ color, size })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Checkout failed");
          window.location.href = data.url;
        }catch(e){
          window.toast("Checkout error. Try again.");
          buy.disabled = false;
          buy.textContent = "Buy now";
        }
      });
    }
  }
  document.addEventListener("DOMContentLoaded", bindProduct);
})();
