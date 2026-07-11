document.addEventListener('DOMContentLoaded', () => {

  /* Mobile nav */
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

  /* Scroll reveal */
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

  /* Cart badge (persisted via localStorage) */
  const cartCountEl = document.getElementById('cartCount');
  const getCart = () => {
    try { return JSON.parse(localStorage.getItem('redgear_cart') || '[]'); }
    catch (e) { return []; }
  };
  const setCartCount = () => {
    if (cartCountEl) cartCountEl.textContent = getCart().length;
  };
  setCartCount();
  window.RedGearCart = {
    add(item) {
      const cart = getCart();
      cart.push(item);
      localStorage.setItem('redgear_cart', JSON.stringify(cart));
      setCartCount();
    },
    clear() {
      localStorage.removeItem('redgear_cart');
      setCartCount();
    },
    get: getCart
  };

  /* Toast */
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  window.showToast = (msg) => {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  };

  /* "View Builds" quick add-to-cart demo buttons */
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.RedGearCart.add({ name: btn.dataset.addCart, price: btn.dataset.price || 0 });
      showToast(`${btn.dataset.addCart} added to cart`);
    });
  });

  /* Navbar shrink on scroll (subtle) */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.borderBottomColor = window.scrollY > 20 ? 'var(--red-dark)' : 'var(--border)';
    });
  }

});
