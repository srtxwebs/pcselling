/* ==========================================================================
   REDGEAR — Shared Site Script
   ========================================================================== */

/* Star rating helper — top-level so it's available to inline page scripts
   that run before DOMContentLoaded fires */
window.renderStars = function(rating, size) {
  size = size || 13;
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const fillPct = Math.max(0, Math.min(1, rating - (i - 1))) * 100;
    html += `<span class="star-wrap" style="width:${size}px;height:${size}px;">
      <svg class="star-bg" viewBox="0 0 24 24" fill="currentColor" style="width:${size}px;height:${size}px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
      <span class="star-fill" style="width:${fillPct}%;"><svg viewBox="0 0 24 24" fill="currentColor" style="width:${size}px;height:${size}px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg></span>
    </span>`;
  }
  return `<span class="star-row">${html}</span>`;
};

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
        <h3 id="accountHeadTitle">Sign In</h3>
        <button class="cart-close" id="accountClose" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="account-panel-body" id="accountPanelBody">
        <p class="account-gate-msg" id="accountGateMsg" style="display:none;"></p>
        <div id="googleSignInBtn" class="google-btn-mount"></div>
        <div class="account-divider"><span>or</span></div>
        <button class="btn btn-outline" id="guestBtn" style="width:100%;justify-content:center;">Continue as Guest</button>
        <p class="account-footnote" id="guestFootnote">Guests can browse freely, but need to sign in to add items to cart or check out.</p>
      </div>
    </div>

    <div class="scroll-progress" id="scrollProgress"></div>
    <button class="back-to-top" id="backToTop" aria-label="Back to top">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
    </button>

    <div class="account-backdrop" id="settingsBackdrop"></div>
    <div class="account-panel settings-panel" id="settingsPanel">
      <div class="account-panel-head">
        <h3>Settings</h3>
        <button class="cart-close" id="settingsClose" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
      </div>
      <div class="account-panel-body">
        <label class="profile-field-label">Language
          <select id="settingLanguage">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="pt">Português</option>
            <option value="ja">日本語</option>
          </select>
        </label>
        <label class="profile-field-label">Currency
          <select id="settingCurrency">
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD ($)</option>
            <option value="MXN">MXN ($)</option>
          </select>
        </label>
        <div class="settings-toggle-row">
          <div>
            <div class="settings-toggle-label">Email Notifications</div>
            <div class="settings-toggle-sub">Order updates &amp; drop alerts</div>
          </div>
          <button class="toggle-switch" id="toggleEmail" role="switch" aria-checked="true"><span class="toggle-knob"></span></button>
        </div>
        <div class="settings-toggle-row">
          <div>
            <div class="settings-toggle-label">RGB Preview Animations</div>
            <div class="settings-toggle-sub">Fan glow &amp; sweep effects</div>
          </div>
          <button class="toggle-switch active" id="toggleAnim" role="switch" aria-checked="true"><span class="toggle-knob"></span></button>
        </div>
        <button class="btn btn-primary" id="saveSettingsBtn" style="width:100%;justify-content:center;margin-top:6px;">Save Settings</button>
        <button class="btn btn-outline" id="clearDataBtn" style="width:100%;justify-content:center;">Clear Local Data</button>
        <p class="account-footnote">Language & currency preferences are saved to this browser. Full site translation isn't wired up yet — this stores your preference for when it is.</p>
      </div>
    </div>
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

  /* ---------- Settings: inject two-gear icon into every navbar ---------- */
  document.querySelectorAll('.nav-icons').forEach(navIcons => {
    const settingsBtn = document.createElement('button');
    settingsBtn.setAttribute('aria-label', 'Settings');
    settingsBtn.className = 'settings-gear-btn';
    settingsBtn.innerHTML = `
      <svg viewBox="0 0 40 40" fill="none">
        <g class="gear gear-back">
          <path fill="currentColor" d="M23 8.5l1.2 3a9 9 0 0 1 2.6 1.5l3.1-.9 2 3.5-2.4 2.2a9 9 0 0 1 0 3l2.4 2.2-2 3.5-3.1-.9a9 9 0 0 1-2.6 1.5l-1.2 3h-4l-1.2-3a9 9 0 0 1-2.6-1.5l-3.1.9-2-3.5 2.4-2.2a9 9 0 0 1 0-3L10.1 15l2-3.5 3.1.9a9 9 0 0 1 2.6-1.5l1.2-3z"/>
          <circle cx="21" cy="20" r="3.6" fill="var(--near-black)"/>
        </g>
        <g class="gear gear-front">
          <path fill="currentColor" d="M13 21.5l-.9 2.3a7 7 0 0 1-2 1.2l-2.4-.7-1.6 2.7 1.9 1.7a7 7 0 0 1 0 2.3l-1.9 1.7 1.6 2.7 2.4-.7a7 7 0 0 1 2 1.2l.9 2.3h3.1l.9-2.3a7 7 0 0 1 2-1.2l2.4.7 1.6-2.7-1.9-1.7a7 7 0 0 1 0-2.3l1.9-1.7-1.6-2.7-2.4.7a7 7 0 0 1-2-1.2l-.9-2.3z" opacity="0"/>
        </g>
        <g class="gear gear-small">
          <path fill="currentColor" d="M11.5 22.3l.7 1.8a5.5 5.5 0 0 1 1.6 1l1.9-.6 1.3 2.2-1.5 1.4a5.5 5.5 0 0 1 0 1.8l1.5 1.4-1.3 2.2-1.9-.6a5.5 5.5 0 0 1-1.6 1l-.7 1.8H9.9l-.7-1.8a5.5 5.5 0 0 1-1.6-1l-1.9.6-1.3-2.2 1.5-1.4a5.5 5.5 0 0 1 0-1.8L4.4 27l1.3-2.2 1.9.6a5.5 5.5 0 0 1 1.6-1l.7-1.8z"/>
          <circle cx="10.75" cy="27.2" r="2.2" fill="var(--near-black)"/>
        </g>
      </svg>
    `;
    const cartBtnRef = navIcons.querySelector('[aria-label="Cart"]');
    if (cartBtnRef) navIcons.insertBefore(settingsBtn, cartBtnRef);
    else navIcons.appendChild(settingsBtn);
  });

  const settingsPanel = document.getElementById('settingsPanel');
  const settingsBackdrop = document.getElementById('settingsBackdrop');
  function openSettings() {
    loadSettingsIntoForm();
    settingsPanel.classList.add('open');
    settingsBackdrop.classList.add('open');
    document.body.classList.add('nav-open');
  }
  function closeSettings() {
    settingsPanel.classList.remove('open');
    settingsBackdrop.classList.remove('open');
    document.body.classList.remove('nav-open');
  }
  document.querySelectorAll('[aria-label="Settings"]').forEach(btn => btn.addEventListener('click', openSettings));
  document.getElementById('settingsClose').addEventListener('click', closeSettings);
  settingsBackdrop.addEventListener('click', closeSettings);

  function getSettings() {
    try { return JSON.parse(localStorage.getItem('redgear_settings') || '{}'); }
    catch (e) { return {}; }
  }
  function loadSettingsIntoForm() {
    const s = getSettings();
    document.getElementById('settingLanguage').value = s.language || 'en';
    document.getElementById('settingCurrency').value = s.currency || 'USD';
    document.getElementById('toggleEmail').classList.toggle('active', s.emailNotifs !== false);
    document.getElementById('toggleAnim').classList.toggle('active', s.animations !== false);
  }
  document.querySelectorAll('.toggle-switch').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('active'));
  });
  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    const settings = {
      language: document.getElementById('settingLanguage').value,
      currency: document.getElementById('settingCurrency').value,
      emailNotifs: document.getElementById('toggleEmail').classList.contains('active'),
      animations: document.getElementById('toggleAnim').classList.contains('active'),
    };
    localStorage.setItem('redgear_settings', JSON.stringify(settings));
    document.body.classList.toggle('anims-off', !settings.animations);
    closeSettings();
    showToast('Settings saved');
  });
  document.getElementById('clearDataBtn').addEventListener('click', () => {
    localStorage.removeItem('redgear_cart');
    localStorage.removeItem('redgear_reviews');
    localStorage.removeItem('redgear_settings');
    setCartCount();
    closeSettings();
    showToast('Local data cleared');
  });
  // Apply saved animation preference on load
  if (getSettings().animations === false) document.body.classList.add('anims-off');

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
    if (!(window.RedGearAuth && window.RedGearAuth.isSignedIn())) {
      closeCart();
      window.openAccount('Sign in with Google to complete checkout.');
      return;
    }
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

  /* ---------- Auth: Google Sign-In + Guest mode ---------- */
  // NOTE: Replace with your own OAuth Client ID from https://console.cloud.google.com/apis/credentials
  // (create an OAuth 2.0 Client ID, type "Web application", add your domain under
  // "Authorized JavaScript origins"). Sign-in will not work until this is set.
  const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  function getAuth() {
    try { return JSON.parse(localStorage.getItem('redgear_auth') || 'null'); }
    catch (e) { return null; }
  }
  function setAuth(data) { localStorage.setItem('redgear_auth', JSON.stringify(data)); }
  function clearAuth() { localStorage.removeItem('redgear_auth'); }

  function decodeJwt(token) {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
    } catch (e) { return null; }
  }

  function handleGoogleSignIn(response) {
    const payload = decodeJwt(response.credential);
    if (!payload) { showToast('Sign-in failed — try again'); return; }
    setAuth({ signedIn: true, guest: false, name: payload.name, email: payload.email, picture: payload.picture });
    updateAccountUI();
    closeAccount();
    showToast(`Welcome, ${payload.given_name || payload.name}!`);
  }
  window.handleGoogleSignIn = handleGoogleSignIn;

  function updateAccountUI() {
    const auth = getAuth();
    const title = document.getElementById('accountHeadTitle');
    const body = document.getElementById('accountPanelBody');
    if (auth && auth.signedIn) {
      title.textContent = 'My Profile';
      const displayName = auth.displayName || auth.name;
      const myReviews = (window.RedGearReviews ? window.RedGearReviews.forUser(auth.email) : []);
      body.innerHTML = `
        <div class="account-profile">
          <img src="${auth.picture || ''}" alt="${displayName}" onerror="this.style.display='none'">
          <div><div class="account-profile-name">${displayName}</div><div class="account-profile-email">${auth.email}</div></div>
        </div>

        <label class="profile-field-label">Display Name
          <input type="text" id="displayNameInput" value="${displayName}" maxlength="40">
        </label>
        <button class="btn btn-outline" id="saveNameBtn" style="width:100%;justify-content:center;margin-bottom:6px;">Save Name</button>

        <div class="account-divider"><span>my reviews</span></div>
        <div id="myReviewsList">
          ${myReviews.length ? myReviews.map((r, i) => `
            <div class="my-review-item">
              <div class="my-review-head">
                <span class="my-review-build">${r.build}</span>
                ${window.renderStars(r.rating, 11)}
              </div>
              ${r.comment ? `<div class="my-review-comment">"${r.comment}"</div>` : ''}
              <div class="my-review-date">${new Date(r.date).toLocaleDateString()}</div>
              <a href="#" class="my-review-remove" data-remove-review="${r.date}">Remove</a>
            </div>
          `).join('') : '<p class="account-footnote">You haven&#39;t written any reviews yet.</p>'}
        </div>

        <div class="account-divider"><span>or</span></div>
        <button class="btn btn-outline" id="signOutBtn" style="width:100%;justify-content:center;">Sign Out</button>
      `;
      document.getElementById('signOutBtn').addEventListener('click', () => {
        clearAuth();
        updateAccountUI();
        showToast('Signed out');
      });
      document.getElementById('saveNameBtn').addEventListener('click', () => {
        const val = document.getElementById('displayNameInput').value.trim();
        if (!val) { showToast('Name cannot be empty'); return; }
        const a = getAuth();
        a.displayName = val;
        setAuth(a);
        updateAccountUI();
        showToast('Display name updated');
      });
      body.querySelectorAll('[data-remove-review]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const list = window.RedGearReviews.getAll();
          const idx = list.findIndex(r => r.date === link.dataset.removeReview);
          if (idx > -1) window.RedGearReviews.removeAt(idx);
          updateAccountUI();
        });
      });
    } else {
      title.textContent = 'Sign In';
      body.innerHTML = `
        <p class="account-gate-msg" id="accountGateMsg" style="display:none;"></p>
        <div id="googleSignInBtn" class="google-btn-mount"></div>
        <div class="account-divider"><span>or</span></div>
        <button class="btn btn-outline" id="guestBtn" style="width:100%;justify-content:center;">Continue as Guest</button>
        <p class="account-footnote" id="guestFootnote">Guests can browse freely, but need to sign in to add items to cart or check out.</p>
      `;
      document.getElementById('guestBtn').addEventListener('click', () => {
        setAuth({ signedIn: false, guest: true });
        closeAccount();
        showToast('Browsing as guest — sign in anytime to shop');
      });
      renderGoogleButton();
    }
  }

  function renderGoogleButton() {
    const mount = document.getElementById('googleSignInBtn');
    if (!mount || typeof google === 'undefined' || !google.accounts) return;
    try {
      google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleSignIn });
      google.accounts.id.renderButton(mount, { theme: 'filled_black', size: 'large', shape: 'pill', width: 300 });
    } catch (e) { /* GSI not ready yet */ }
  }

  // Load Google Identity Services script once
  if (!document.getElementById('gsiScript')) {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true; s.id = 'gsiScript';
    s.onload = () => { if (!getAuth() || !getAuth().signedIn) renderGoogleButton(); };
    document.head.appendChild(s);
  }

  window.RedGearAuth = {
    isSignedIn: () => { const a = getAuth(); return !!(a && a.signedIn); },
    get: getAuth,
  };

  /* ---------- Account panel ---------- */
  const accountPanel = document.getElementById('accountPanel');
  const accountBackdrop = document.getElementById('accountBackdrop');
  window.openAccount = (gateMsg) => {
    updateAccountUI();
    const msg = document.getElementById('accountGateMsg');
    if (msg) {
      if (gateMsg) { msg.textContent = gateMsg; msg.style.display = 'block'; }
      else { msg.style.display = 'none'; }
    }
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
  document.querySelectorAll('[aria-label="Account"]').forEach(btn => btn.addEventListener('click', () => openAccount()));
  updateAccountUI();

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
      if (!(window.RedGearAuth && window.RedGearAuth.isSignedIn())) {
        if (window.openAccount) window.openAccount('Sign in with Google to add items to your cart.');
        else showToast('Sign in to add items to your cart');
        return false;
      }
      const cart = getCart();
      cart.push(item);
      localStorage.setItem('redgear_cart', JSON.stringify(cart));
      setCartCount();
      if (window.__renderCartDrawer) window.__renderCartDrawer();
      return true;
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

  /* ---------- Reviews system ---------- */
  function getReviews() {
    try { return JSON.parse(localStorage.getItem('redgear_reviews') || '[]'); }
    catch (e) { return []; }
  }
  function saveReviews(list) { localStorage.setItem('redgear_reviews', JSON.stringify(list)); }

  window.RedGearReviews = {
    getAll: getReviews,
    forBuild(name) { return getReviews().filter(r => r.build === name); },
    forUser(email) { return getReviews().filter(r => r.userEmail === email); },
    add(build, rating, comment) {
      if (!(window.RedGearAuth && window.RedGearAuth.isSignedIn())) {
        window.openAccount && window.openAccount('Sign in with Google to write a review.');
        return false;
      }
      const auth = window.RedGearAuth.get();
      const list = getReviews();
      list.unshift({
        build, rating, comment,
        userEmail: auth.email,
        userName: auth.displayName || auth.name,
        date: new Date().toISOString()
      });
      saveReviews(list);
      return true;
    },
    removeAt(idx) {
      const list = getReviews();
      list.splice(idx, 1);
      saveReviews(list);
    }
  };

  // Review modal (shared across pages)
  const reviewModalHTML = `
    <div class="account-backdrop" id="reviewBackdrop"></div>
    <div class="account-panel" id="reviewPanel">
      <div class="account-panel-head">
        <h3>Write a Review</h3>
        <button class="cart-close" id="reviewClose" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
      </div>
      <div class="account-panel-body">
        <p class="review-target-name" id="reviewTargetName"></p>
        <div class="star-picker" id="starPicker">
          ${[1,2,3,4,5].map(n => `<button type="button" class="star-pick-btn" data-star="${n}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg></button>`).join('')}
        </div>
        <textarea id="reviewComment" placeholder="What did you think of this build?" rows="4"></textarea>
        <button class="btn btn-primary" id="reviewSubmit" style="width:100%;justify-content:center;">Submit Review</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', reviewModalHTML);
  let currentReviewTarget = null;
  let currentStarValue = 0;
  const reviewPanel = document.getElementById('reviewPanel');
  const reviewBackdrop = document.getElementById('reviewBackdrop');
  const starPicker = document.getElementById('starPicker');

  window.openReviewModal = (buildName) => {
    currentReviewTarget = buildName;
    currentStarValue = 0;
    document.getElementById('reviewTargetName').textContent = buildName;
    document.getElementById('reviewComment').value = '';
    starPicker.querySelectorAll('.star-pick-btn').forEach(b => b.classList.remove('active'));
    reviewPanel.classList.add('open');
    reviewBackdrop.classList.add('open');
    document.body.classList.add('nav-open');
  };
  function closeReviewModal() {
    reviewPanel.classList.remove('open');
    reviewBackdrop.classList.remove('open');
    document.body.classList.remove('nav-open');
  }
  document.getElementById('reviewClose').addEventListener('click', closeReviewModal);
  reviewBackdrop.addEventListener('click', closeReviewModal);
  starPicker.addEventListener('click', (e) => {
    const btn = e.target.closest('.star-pick-btn');
    if (!btn) return;
    currentStarValue = parseInt(btn.dataset.star, 10);
    starPicker.querySelectorAll('.star-pick-btn').forEach(b =>
      b.classList.toggle('active', parseInt(b.dataset.star, 10) <= currentStarValue));
  });
  document.getElementById('reviewSubmit').addEventListener('click', () => {
    if (!currentStarValue) { showToast('Pick a star rating first'); return; }
    if (!(window.RedGearAuth && window.RedGearAuth.isSignedIn())) {
      closeReviewModal();
      window.openAccount('Sign in with Google to write a review.');
      return;
    }
    const comment = document.getElementById('reviewComment').value.trim();
    const ok = window.RedGearReviews.add(currentReviewTarget, currentStarValue, comment);
    if (ok) {
      closeReviewModal();
      showToast('Review submitted — thanks!');
    }
  });
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-write-review]');
    if (trigger) { e.preventDefault(); window.openReviewModal(trigger.dataset.writeReview); }
  });

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
      const added = window.RedGearCart.add({ name: btn.dataset.addCart, price: btn.dataset.price || 0 });
      if (added) showToast(`${btn.dataset.addCart} added to cart`);
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
