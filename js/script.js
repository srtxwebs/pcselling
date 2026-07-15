/* ==========================================================================
   REDGEAR — Shared Site Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Cart drawer (injected on every page) ---------- */
  const drawerHTML = `
    <div class="cart-backdrop" id="cartBackdrop"></div>
    <aside class="cart-drawer" id="cartDrawer">
      <div class="cart-drawer-head">
        <h3>Your Cart <span class="cart-item-count" id="cartItemCount">0 items</span></h3>
        <button class="cart-close" id="cartClose" aria-label="Close cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="cart-drawer-body" id="cartBody"></div>
      <div class="cart-drawer-foot" id="cartFoot">
        <div class="cart-summary-row"><span>Subtotal</span><span class="val" id="cartSubtotal">$0</span></div>
        <div class="cart-summary-row"><span>Estimated shipping</span><span class="val" id="cartShipping">Free</span></div>
        <div class="cart-total-row"><span>Total</span><span id="cartTotalAmount">$0</span></div>
        <button class="btn btn-primary" id="cartCheckout" style="width:100%;justify-content:center;">
          Checkout
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
        <div class="cart-secure-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Secure checkout · 30-day returns
        </div>
      </div>
    </aside>

    <div class="search-overlay" id="searchOverlay">
      <div class="search-overlay-inner">
        <button class="search-overlay-close" id="searchClose" aria-label="Close search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" id="searchInput" placeholder="Search builds, parts, GPUs, CPUs…" autocomplete="off">
        </div>
        <div class="search-suggest">
          <span>Try:</span>
          <button data-q="RTX 4090">RTX 4090</button>
          <button data-q="Gaming PC">Gaming PC</button>
          <button data-q="Ryzen 9">Ryzen 9</button>
          <button data-q="Creator PC">Creator PC</button>
          <button data-q="Custom Build">Custom Build</button>
        </div>
      </div>
    </div>

    <div class="account-backdrop" id="accountBackdrop"></div>
    <div class="account-panel" id="accountPanel">
      <div class="account-panel-head">
        <h3>Sign In</h3>
        <button class="cart-close" id="accountClose" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="account-panel-body">
        <label>Email<input type="email" placeholder="you@example.com"></label>
        <label>Password<input type="password" placeholder="••••••••"></label>
        <button class="btn btn-primary" id="accountSubmit" style="width:100%;justify-content:center;margin-top:4px;">Sign In</button>
        <div class="account-divider"><span>or</span></div>
        <button class="btn btn-outline" style="width:100%;justify-content:center;">Continue as Guest</button>
        <p class="account-footnote">No account yet? <a href="#">Create one</a></p>
      </div>
    </div>

    <div class="scroll-progress" id="scrollProgress"></div>
    <button class="back-to-top" id="backToTop" aria-label="Back to top">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
    </button>
  `;
  document.body.insertAdjacentHTML('beforeend', drawerHTML);

  const cartDrawer = document.getElementById('cartDrawer');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartBody = document.getElementById('cartBody');
  const cartTotalAmount = document.getElementById('cartTotalAmount');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartItemCount = document.getElementById('cartItemCount');
  const cartFoot = document.getElementById('cartFoot');

  function renderCartDrawer() {
    const cart = window.RedGearCart.get();
    cartItemCount.textContent = `${cart.length} item${cart.length === 1 ? '' : 's'}`;
    cartFoot.style.display = cart.length ? '' : 'none';

    if (!cart.length) {
      cartBody.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </div>
          <p>Your cart is empty</p>
          <span>Add a prebuilt PC or design your own from scratch</span>
          <a href="builder.html" class="btn btn-primary">Start a Custom Build
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>`;
    } else {
      cartBody.innerHTML = cart.map((item, i) => {
        const name = (item.name || '').toLowerCase();
        let filt = 'hue-rotate(0deg) saturate(1.1)';
        if (name.includes('creator') || name.includes('studio') || name.includes('render') || name.includes('motion') || name.includes('edit')) filt = 'hue-rotate(190deg) saturate(1.3)';
        else if (name.includes('office') || name.includes('work') || name.includes('desk') || name.includes('sff')) filt = 'saturate(0.15) brightness(1.05)';
        else if (name.includes('custom')) filt = 'hue-rotate(265deg) saturate(1.4)';
        return `
        <div class="cart-item">
          <div class="cart-item-icon">
            <img src="images/pc-cutout.png" alt="${item.name}" style="width:100%;height:100%;object-fit:contain;filter:${filt};">
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            ${item.parts ? `<div class="cart-item-parts">${Object.values(item.parts).slice(0,3).join(' · ')}${Object.values(item.parts).length > 3 ? '…' : ''}</div>` : ''}
            <div class="cart-item-bottom">
              <div class="cart-item-price">$${Number(item.price).toLocaleString()}</div>
              <button class="cart-item-remove" data-remove="${i}" aria-label="Remove">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;}).join('') + `
        <div class="cart-promo">
          <input type="text" placeholder="Promo code" id="cartPromoInput">
          <button id="cartPromoApply">Apply</button>
        </div>
      `;
    }
    const total = cart.reduce((sum, i) => sum + Number(i.price || 0), 0);
    cartSubtotal.textContent = `$${total.toLocaleString()}`;
    cartTotalAmount.textContent = `$${total.toLocaleString()}`;
  }

  window.openCart = () => {
    renderCartDrawer();
    cartDrawer.classList.add('open');
    cartBackdrop.classList.add('open');
    document.body.classList.add('nav-open');
  };
  window.closeCart = () => {
    cartDrawer.classList.remove('open');
    cartBackdrop.classList.remove('open');
    document.body.classList.remove('nav-open');
  };

  document.getElementById('cartClose').addEventListener('click', closeCart);
  cartBackdrop.addEventListener('click', closeCart);
  document.querySelectorAll('[aria-label="Cart"]').forEach(btn => btn.addEventListener('click', openCart));

  cartBody.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      window.RedGearCart.removeAt(parseInt(rm.dataset.remove, 10));
      renderCartDrawer();
      return;
    }
    if (e.target.id === 'cartPromoApply') {
      const input = document.getElementById('cartPromoInput');
      if (input && input.value.trim()) {
        showToast('Promo code applied — demo only, hook this up to real pricing logic');
      } else {
        showToast('Enter a promo code first');
      }
    }
  });

  document.getElementById('cartCheckout').addEventListener('click', () => {
    if (!window.RedGearCart.get().length) return;
    showToast('Demo checkout — hook this up to a real payment provider');
  });

  /* ---------- Search overlay ---------- */
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  window.openSearch = () => {
    searchOverlay.classList.add('open');
    document.body.classList.add('nav-open');
    setTimeout(() => searchInput.focus(), 200);
  };
  window.closeSearch = () => {
    searchOverlay.classList.remove('open');
    document.body.classList.remove('nav-open');
  };
  document.getElementById('searchClose').addEventListener('click', closeSearch);
  document.querySelectorAll('[aria-label="Search"]').forEach(btn => btn.addEventListener('click', openSearch));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSearch(); closeAccount(); closeCart(); }
  });
  function runSearch(q) {
    if (!q || !q.trim()) return;
    window.location.href = `builds.html?search=${encodeURIComponent(q.trim())}`;
  }
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(searchInput.value); });
  document.querySelectorAll('.search-suggest button').forEach(b => {
    b.addEventListener('click', () => runSearch(b.dataset.q));
  });

  /* ---------- Account panel ---------- */
  const accountPanel = document.getElementById('accountPanel');
  const accountBackdrop = document.getElementById('accountBackdrop');
  window.openAccount = () => {
    accountPanel.classList.add('open');
    accountBackdrop.classList.add('open');
    document.body.classList.add('nav-open');
  };
  window.closeAccount = () => {
    accountPanel.classList.remove('open');
    accountBackdrop.classList.remove('open');
    document.body.classList.remove('nav-open');
  };
  document.getElementById('accountClose').addEventListener('click', closeAccount);
  accountBackdrop.addEventListener('click', closeAccount);
  document.querySelectorAll('[aria-label="Account"]').forEach(btn => btn.addEventListener('click', openAccount));
  document.getElementById('accountSubmit').addEventListener('click', () => {
    closeAccount();
    showToast('Demo sign-in — hook this up to real auth');
  });

  /* ---------- Mega menu for "PC Builds" ---------- */
  const buildsLink = Array.from(document.querySelectorAll('.nav-links a')).find(a => a.getAttribute('href') === 'builds.html');
  if (buildsLink) {
    const wrap = document.createElement('div');
    wrap.className = 'mega-menu-wrap';
    buildsLink.parentNode.insertBefore(wrap, buildsLink);
    wrap.appendChild(buildsLink);
    wrap.insertAdjacentHTML('beforeend', `
      <div class="mega-menu">
        <a href="builds.html?cat=gaming" class="mega-item">
          <div class="mega-icon" style="color:#ff5b5b;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M8 10v4M15 11h.01M18 13h.01"/></svg></div>
          <div><div class="mega-item-title">Gaming PCs</div><div class="mega-item-sub">Dominate every game</div></div>
        </a>
        <a href="builds.html?cat=creator" class="mega-item">
          <div class="mega-icon" style="color:#4d9aff;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg></div>
          <div><div class="mega-item-title">Creator PCs</div><div class="mega-item-sub">Power your creativity</div></div>
        </a>
        <a href="builds.html?cat=office" class="mega-item">
          <div class="mega-icon" style="color:#9a9aa1;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
          <div><div class="mega-item-title">Office PCs</div><div class="mega-item-sub">Reliable & efficient</div></div>
        </a>
        <a href="builder.html" class="mega-item mega-item-cta">
          <div class="mega-icon" style="color:#ff2530;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg></div>
          <div><div class="mega-item-title">Build Your Own</div><div class="mega-item-sub">Pick every part yourself</div></div>
        </a>
      </div>
    `);
  }

  /* ---------- Scroll progress + back to top ---------- */
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    scrollProgress.style.width = pct + '%';
    backToTop.classList.toggle('show', h.scrollTop > 500);
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      mobileNav.classList.add('open');
      document.body.classList.add('nav-open');
    });
  }
  if (mobileNavClose && mobileNav) {
    mobileNavClose.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      document.body.classList.remove('nav-open');
    });
  }
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      document.body.classList.remove('nav-open');
    }));
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Stat count-up (elements with [data-count]) ---------- */
  const statEls = document.querySelectorAll('[data-count]');
  if (statEls.length && 'IntersectionObserver' in window) {
    const statIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = el.dataset.count.includes('.') ? 1 : 0;
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = target * eased;
          el.textContent = (decimals ? val.toFixed(1) : Math.round(val).toLocaleString()) + suffix;
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        statIO.unobserve(el);
      });
    }, { threshold: 0.4 });
    statEls.forEach(el => statIO.observe(el));
  }

  /* ---------- Cart badge (persisted via localStorage) ---------- */
  const cartCountEl = document.getElementById('cartCount');
  const getCart = () => {
    try { return JSON.parse(localStorage.getItem('redgear_cart') || '[]'); }
    catch (e) { return []; }
  };
  const setCartCount = () => {
    document.querySelectorAll('#cartCount, [id="cartCount"]').forEach(el => el.textContent = getCart().length);
  };
  setCartCount();
  window.RedGearCart = {
    add(item) {
      const cart = getCart();
      cart.push(item);
      localStorage.setItem('redgear_cart', JSON.stringify(cart));
      setCartCount();
      if (window.__renderCartDrawer) window.__renderCartDrawer();
    },
    removeAt(index) {
      const cart = getCart();
      cart.splice(index, 1);
      localStorage.setItem('redgear_cart', JSON.stringify(cart));
      setCartCount();
    },
    clear() {
      localStorage.removeItem('redgear_cart');
      setCartCount();
    },
    get: getCart
  };
  window.__renderCartDrawer = renderCartDrawer;

  /* ---------- Toast ---------- */
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  window.showToast = (msg) => {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  };

  /* ---------- "View Builds" quick add-to-cart demo buttons ---------- */
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.RedGearCart.add({ name: btn.dataset.addCart, price: btn.dataset.price || 0 });
      showToast(`${btn.dataset.addCart} added to cart`);
    });
  });

  /* ---------- Navbar shrink on scroll (subtle) ---------- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
      navbar.style.borderBottomColor = window.scrollY > 20 ? 'var(--red-dark)' : 'var(--border)';
      lastY = window.scrollY;
    });
  }

  /* ---------- Tilt effect on build cards ---------- */
  document.querySelectorAll('.build-card, .info-card').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-6px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  /* ---------- Hero visual parallax ---------- */
  const heroVisual = document.querySelector('.hero-photo');
  const heroSection = document.querySelector('.hero');
  if (heroVisual && heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const r = heroSection.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      heroVisual.style.transform = `translate(${px * 14}px, ${py * 14}px)`;
    });
    heroSection.addEventListener('mouseleave', () => { heroVisual.style.transform = ''; });
  }

  /* ---------- Cursor spotlight glow ---------- */
  const spotlight = document.createElement('div');
  spotlight.className = 'spotlight';
  document.body.appendChild(spotlight);
  let spotlightRAF = null;
  document.addEventListener('mousemove', (e) => {
    spotlight.classList.add('active');
    if (spotlightRAF) cancelAnimationFrame(spotlightRAF);
    spotlightRAF = requestAnimationFrame(() => {
      spotlight.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
  });
  document.addEventListener('mouseleave', () => spotlight.classList.remove('active'));

});
