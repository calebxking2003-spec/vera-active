(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal on scroll (slow drift in)
  const els = document.querySelectorAll('.reveal');
  if (!prefersReduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -12% 0px" });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add("in"));
  }

  // Subtle parallax (very gentle)
  const parallax = document.querySelectorAll('[data-parallax]');
  let raf = 0;
  const onScroll = () => {
    if (prefersReduced || parallax.length === 0) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      parallax.forEach(el => {
        const speed = parseFloat(el.dataset.parallax || "0.06");
        el.style.transform = `translate3d(0, ${Math.min(28, y * speed)}px, 0)`;
      });
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Fluid cursor (soft, low-gravity). Only on fine pointers.
  const fine = window.matchMedia("(pointer:fine)").matches;
  if (!prefersReduced && fine) {
    const c = document.createElement("div");
    c.className = "cursor-blob";
    c.innerHTML = `<div class="cursor-inner"></div>`;
    document.body.appendChild(c);

    const style = document.createElement("style");
    style.textContent = `
      .cursor-blob{ position:fixed; left:0; top:0; width:46px; height:46px; border-radius:999px; pointer-events:none; z-index:80; mix-blend-mode:multiply; filter: blur(.2px); }
      .cursor-inner{ width:100%; height:100%; border-radius:999px;
        background: radial-gradient(circle at 35% 35%, rgba(176,122,134,.32), rgba(73,106,134,.22) 60%, rgba(15,16,18,.06));
        box-shadow: 0 18px 60px rgba(73,106,134,.14), 0 18px 60px rgba(176,122,134,.12);
        opacity:.68;
        transform: scale(.82);
      }
    `;
    document.head.appendChild(style);

    let tx = window.innerWidth * 0.5, ty = window.innerHeight * 0.35;
    let x = tx, y = ty;
    const lerp = (a,b,t)=>a+(b-a)*t;

    window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive:true });

    const tick = () => {
      x = lerp(x, tx, 0.10);
      y = lerp(y, ty, 0.10);
      c.style.transform = `translate3d(${x-23}px, ${y-23}px, 0)`;
      requestAnimationFrame(tick);
    };
    tick();

    // micro diffusion on interactive hover
    document.addEventListener("pointerover", (e) => {
      const t = e.target;
      if (t.closest("button, a, .chip")) c.querySelector(".cursor-inner").style.transform = "scale(1.00)";
    });
    document.addEventListener("pointerout", (e) => {
      const t = e.target;
      if (t.closest("button, a, .chip")) c.querySelector(".cursor-inner").style.transform = "scale(.82)";
    });
  }

  // Product variant logic + Stripe checkout
  const gallery = document.querySelector("[data-gallery]");
  const PRODUCT = window.PRODUCT || {};
  const colorsMap = PRODUCT.colors || {};
  const state = {
    color: PRODUCT.defaultColor || Object.keys(colorsMap)[0] || "Black",
    size: PRODUCT.defaultSize || "M"
  };

  const setActive = (group, value) => {
    document.querySelectorAll(`[data-${group}] .chip`).forEach(ch => {
      ch.classList.toggle("active", ch.dataset.value === value);
    });
  };

  const updateGallery = (color) => {
    if (!gallery) return;
    const img = gallery.querySelector("img");
    if (!img) return;
    const nextSrc = colorsMap[color] || colorsMap[state.color];
    if (!nextSrc) return;
    img.classList.add("fade-out");
    setTimeout(() => {
      img.src = nextSrc;
      img.onload = () => {
        img.classList.remove("fade-out");
        img.classList.add("fade-in");
        setTimeout(() => img.classList.remove("fade-in"), 220);
      };
    }, 220);
  };

  // Init chips if present
  const colorWrap = document.querySelector("[data-color]");
  const sizeWrap = document.querySelector("[data-size]");
  if (colorWrap) {
    colorWrap.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      state.color = chip.dataset.value;
      setActive("color", state.color);
      updateGallery(state.color);
      // subtle panel pulse
      const p = chip.closest(".panel");
      if (p) { p.animate([{opacity:1},{opacity:.94},{opacity:1}], {duration: 900, easing:"cubic-bezier(.16,1,.3,1)"}); }
    });
  }
  if (sizeWrap) {
    sizeWrap.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      state.size = chip.dataset.value;
      setActive("size", state.size);
      const p = chip.closest(".panel");
      if (p) { p.animate([{opacity:1},{opacity:.94},{opacity:1}], {duration: 900, easing:"cubic-bezier(.16,1,.3,1)"}); }
    });
  }

  // Buy Now
  const buyBtns = Array.from(document.querySelectorAll("[data-buy]"));
  const toast = (msg) => {
    let t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      t.style.cssText = `
        position:fixed; left:50%; bottom:26px; transform:translateX(-50%);
        background: rgba(15,16,18,.92); color: rgba(246,243,239,.96);
        border: 1px solid rgba(255,255,255,.14); border-radius: 999px;
        padding: 12px 16px; font-size: 12px; letter-spacing:.12em; text-transform:uppercase;
        box-shadow: 0 22px 70px rgba(0,0,0,.22);
        z-index: 90; opacity:0; transition: opacity .5s ease;
      `;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(()=> t.style.opacity = "1");
    clearTimeout(t._tm);
    t._tm = setTimeout(()=> t.style.opacity = "0", 2100);
  };

  if (buyBtns.length) {
    buyBtns.forEach((btn) => {
      // Preserve original label per-button (so we can restore after errors)
      const originalLabel = btn.getAttribute("data-label") || btn.textContent.trim() || "Buy now";
      btn.setAttribute("data-label", originalLabel);

      btn.addEventListener("click", async (e) => {
        // Prevent any default navigation/submission (some buttons may be wrapped)
        e?.preventDefault?.();
        e?.stopPropagation?.();

        // Guard against double-clicks
        if (btn.disabled) return;

        btn.disabled = true;
        btn.style.opacity = "0.82";
        btn.textContent = "Opening checkout…";

        const endpoint = `${window.location.origin}/api/create-checkout-session`;
        const payload = { product: (PRODUCT.id || "flare"), color: state.color, size: state.size };

        // Fail-safe timeout so it never feels "dead"
        const controller = new AbortController();
        const tm = setTimeout(() => controller.abort(), 12000);

        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          // Try to parse JSON even on non-2xx (Stripe errors, missing envs, etc.)
          let data = null;
          try { data = await res.json(); } catch (_) { data = null; }

          if (!res.ok || !data?.url) {
            const msg = data?.error || `Checkout error (${res.status})`;
            throw new Error(msg);
          }

          // Redirect to Stripe Checkout
          window.location.assign(data.url);
        } catch (err) {
          const msg = (err?.name === "AbortError")
            ? "Checkout timed out. Try again."
            : (err?.message || "Checkout error");
          toast(msg);
          btn.disabled = false;
          btn.style.opacity = "1";
          btn.textContent = btn.getAttribute("data-label") || "Buy now";
        } finally {
          clearTimeout(tm);
        }
      });
    });
  }

  // Defaults on product page
  setActive("color", state.color);
  setActive("size", state.size);
  updateGallery(state.color);
})();
