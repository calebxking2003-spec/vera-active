
const mobileToggle = document.querySelector('.mobile-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  reveals.forEach((el) => revealObserver.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('visible'));
}

let quantity = 1;
const qtyValue = document.getElementById('qtyValue');
const increaseQty = document.getElementById('increaseQty');
const decreaseQty = document.getElementById('decreaseQty');

function updateQty() {
  if (qtyValue) qtyValue.textContent = quantity;
}

if (increaseQty) {
  increaseQty.addEventListener('click', () => {
    quantity += 1;
    updateQty();
  });
}
if (decreaseQty) {
  decreaseQty.addEventListener('click', () => {
    quantity = Math.max(1, quantity - 1);
    updateQty();
  });
}

const activeProductImage = document.getElementById('activeProductImage');
document.querySelectorAll('.thumb').forEach((thumb) => {
  thumb.addEventListener('click', () => {
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    if (activeProductImage) activeProductImage.src = thumb.dataset.image;
  });
});

const galleryMainImage = document.getElementById('galleryMainImage');
document.querySelectorAll('.gallery-thumb').forEach((thumb) => {
  thumb.addEventListener('click', () => {
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    if (galleryMainImage) galleryMainImage.src = thumb.dataset.galleryImage;
  });
});

const reviews = [
  {
    text: '“I wanted something separate from the kitchen that looked clean on a shelf. This actually feels made for the job.”',
    name: 'Marcus T.',
    role: 'Peptide user'
  },
  {
    text: '“The best part is honestly how tidy it makes the whole routine feel. It looks way better than storing everything beside food.”',
    name: 'Elena R.',
    role: 'Wellness customer'
  },
  {
    text: '“Small, simple, and easy to leave on a counter. It gives my setup a more premium feel without taking up much space.”',
    name: 'Jordan K.',
    role: 'Fitness user'
  },
  {
    text: '“I like products that feel thought through. Coolbox looks clean, works for my use case, and does not scream medical device.”',
    name: 'Noah S.',
    role: 'Longevity enthusiast'
  }
];

let reviewIndex = 0;
const reviewCard = document.getElementById('reviewCard');
const prevReview = document.getElementById('prevReview');
const nextReview = document.getElementById('nextReview');

function renderReview() {
  if (!reviewCard) return;
  const item = reviews[reviewIndex];
  reviewCard.innerHTML = `
    <p class="review-text">${item.text}</p>
    <div class="review-meta">
      <strong>${item.name}</strong>
      <span>${item.role}</span>
    </div>
  `;
}

if (prevReview && nextReview) {
  prevReview.addEventListener('click', () => {
    reviewIndex = (reviewIndex - 1 + reviews.length) % reviews.length;
    renderReview();
  });
  nextReview.addEventListener('click', () => {
    reviewIndex = (reviewIndex + 1) % reviews.length;
    renderReview();
  });
}
renderReview();

const popupBackdrop = document.getElementById('popupBackdrop');
const closePopup = document.getElementById('closePopup');
const popupForm = document.getElementById('popupForm');
const emailForm = document.getElementById('emailForm');

function hidePopup() {
  if (!popupBackdrop) return;
  popupBackdrop.classList.remove('show');
  sessionStorage.setItem('coolboxPopupDismissed', 'true');
}

if (popupBackdrop) {
  setTimeout(() => {
    if (sessionStorage.getItem('coolboxPopupDismissed') !== 'true') {
      popupBackdrop.classList.add('show');
    }
  }, 1400);

  popupBackdrop.addEventListener('click', (e) => {
    if (e.target === popupBackdrop) hidePopup();
  });
}
if (closePopup) closePopup.addEventListener('click', hidePopup);

if (popupForm) {
  popupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!popupBackdrop) return;
    popupBackdrop.classList.add('show');
    popupBackdrop.innerHTML = `
      <div class="popup popup-success">
        <button class="popup-close" id="closePopupSuccess" aria-label="Close">×</button>
        <div class="eyebrow">You're in 🎉</div>
        <h3>Your 10% code is ready</h3>
        <p class="popup-success-copy">Use this code at checkout:</p>
        <div class="coupon-code">COOLBOX10</div>
        <p class="popup-success-copy">Enter it in Stripe checkout under promotion code.</p>
        <div class="popup-success-actions">
          <button class="button button-dark" id="copyCouponBtn" type="button">Copy Code</button>
          <button class="button button-light" id="continueBtn" type="button">Continue</button>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('closePopupSuccess');
    const continueBtn = document.getElementById('continueBtn');
    const copyBtn = document.getElementById('copyCouponBtn');

    const closeSuccess = () => {
      popupBackdrop.classList.remove('show');
      sessionStorage.setItem('coolboxPopupDismissed', 'true');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeSuccess);
    if (continueBtn) continueBtn.addEventListener('click', closeSuccess);
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText('COOLBOX10');
          copyBtn.textContent = 'Copied';
        } catch (err) {
          copyBtn.textContent = 'Code: COOLBOX10';
        }
      });
    }
  });
}
if (emailForm) {
  emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('emailInput');
    if (input) input.value = '';
    alert('Thanks. You are on the list.');
  });
}

const CURRENCY_RATES = { USD: 1, CAD: 1.35, EUR: 0.93, GBP: 0.79, AUD: 1.52 };
const CURRENCY_SYMBOLS = { USD: '$', CAD: 'CA$', EUR: '€', GBP: '£', AUD: 'A$' };
const BASE_PRICE = 139.99;
const BASE_COMPARE = 209.99;

function getCurrency() {
  return localStorage.getItem('coolboxCurrency') || 'USD';
}

function formatMoney(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || '';
  return `${symbol}${amount.toFixed(2)}`;
}

function convertPrice(amount, currency) {
  return amount * (CURRENCY_RATES[currency] || 1);
}

function updateDisplayedPrices() {
  const currency = getCurrency();
  document.querySelectorAll('[data-base-price]').forEach((node) => {
    const value = Number(node.getAttribute('data-base-price'));
    const compareNode = node.querySelector('[data-base-compare]');
    const firstTextNode = Array.from(node.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if (firstTextNode) {
      firstTextNode.textContent = formatMoney(convertPrice(value, currency), currency) + ' ';
    } else {
      node.prepend(document.createTextNode(formatMoney(convertPrice(value, currency), currency) + ' '));
    }
    if (compareNode) {
      const compare = Number(compareNode.getAttribute('data-base-compare'));
      compareNode.textContent = formatMoney(convertPrice(compare, currency), currency);
    }
  });
  const saveBadge = document.querySelector('.save-badge');
  if (saveBadge) {
    const savings = convertPrice(BASE_COMPARE - BASE_PRICE, currency);
    saveBadge.textContent = `Save ${formatMoney(savings, currency)}`;
  }
}

function syncCurrencySelectors() {
  const currency = getCurrency();
  [document.getElementById('currencySelect'), document.getElementById('currencySelectMobile')].filter(Boolean).forEach(sel => {
    sel.value = currency;
  });
  updateDisplayedPrices();
}

['currencySelect', 'currencySelectMobile'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', (e) => {
      localStorage.setItem('coolboxCurrency', e.target.value);
      syncCurrencySelectors();
      renderCartPage();
    });
  }
});

function getCart() {
  return JSON.parse(localStorage.getItem('coolboxCart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('coolboxCart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  ['navCartCount', 'navCartCountMobile'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(count);
  });
}

const addToCart = document.getElementById('addToCart');
const cartNote = document.getElementById('cartNote');
const subscribeSave = document.getElementById('subscribeSave');

if (addToCart) {
  addToCart.addEventListener('click', () => {
    const cart = getCart();
    const existing = cart.find(item => item.id === 'coolbox-mini');
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: 'coolbox-mini',
        name: 'Coolbox Mini',
        price: BASE_PRICE,
        comparePrice: BASE_COMPARE,
        image: 'assets/product-1.png',
        quantity: quantity
      });
    }
    saveCart(cart);
    const extra = subscribeSave && subscribeSave.checked ? ' Subscription preference saved too.' : '';
    if (cartNote) {
      cartNote.textContent = `${quantity} Coolbox item${quantity > 1 ? 's' : ''} added to cart.${extra}`;
    }
  });
}

function renderCartPage() {
  const cartList = document.getElementById('cartList');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryTotal = document.getElementById('summaryTotal');
  const summaryCurrency = getCurrency();

  if (!cartList || !summarySubtotal || !summaryTotal) return;

  const cart = getCart();
  if (!cart.length) {
    cartList.innerHTML = `<div class="empty-cart">Your cart is empty.<br><br><a class="button button-dark" href="index.html#purchase">Shop Coolbox</a></div>`;
    summarySubtotal.textContent = formatMoney(0, summaryCurrency);
    summaryTotal.textContent = formatMoney(0, summaryCurrency);
    return;
  }

  cartList.innerHTML = cart.map(item => {
    const itemPrice = convertPrice(item.price, summaryCurrency);
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>${formatMoney(itemPrice, summaryCurrency)} each</p>
          <p class="cart-muted">Free worldwide shipping · 15–30 business days</p>
          <div class="cart-qty">
            <button onclick="changeCartQty('${item.id}', -1)">−</button>
            <span>${item.quantity}</span>
            <button onclick="changeCartQty('${item.id}', 1)">+</button>
            <button class="remove-btn" onclick="removeCartItem('${item.id}')">Remove</button>
          </div>
        </div>
        <strong>${formatMoney(itemPrice * item.quantity, summaryCurrency)}</strong>
      </div>
    `;
  }).join('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  summarySubtotal.textContent = formatMoney(convertPrice(subtotal, summaryCurrency), summaryCurrency);
  summaryTotal.textContent = formatMoney(convertPrice(subtotal, summaryCurrency), summaryCurrency);
}

window.changeCartQty = function(id, delta) {
  const cart = getCart();
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    saveCart(cart.filter(x => x.id !== id));
  } else {
    saveCart(cart);
  }
  renderCartPage();
}

window.removeCartItem = function(id) {
  saveCart(getCart().filter(x => x.id !== id));
  renderCartPage();
}

document.addEventListener('DOMContentLoaded', () => {
  updateQty();
  syncCurrencySelectors();
  updateCartCount();
  renderCartPage();

  const discountForm = document.getElementById('discountForm');
  if (discountForm) {
    discountForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Apply your coupon in Stripe checkout after clicking checkout.');
    });
  }
});


const openDiscountPopup = document.getElementById('openDiscountPopup');
if (openDiscountPopup && popupBackdrop) {
  openDiscountPopup.addEventListener('click', () => {
    popupBackdrop.classList.add('show');
  });
}
