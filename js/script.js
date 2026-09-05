/* ==========================================================================
   REDGEAR — Shared Site Script (v2 — full i18n + live currency + hashed pw)
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

/* ==========================================================================
   Currency — live rates (frankfurter.app, no API key required) with a
   static fallback table and a 1-hour local cache so we don't hammer the
   API on every page load or work offline.
   ========================================================================== */
window.CURRENCY_RATES = {
  // Fallback values only — overwritten by live rates when the fetch below
  // succeeds. Kept so the site still works if the network/API is down.
  USD: { rate: 1,     symbol: '$' },
  EUR: { rate: 0.92,  symbol: '€' },
  GBP: { rate: 0.79,  symbol: '£' },
  CAD: { rate: 1.36,  symbol: '$' },
  MXN: { rate: 18.5,  symbol: '$' },
};
const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', CAD: '$', MXN: '$' };
const CURRENCY_CACHE_KEY = 'redgear_fx_cache_v1';
const CURRENCY_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function refreshLiveRates() {
  try {
    const cached = JSON.parse(localStorage.getItem(CURRENCY_CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.fetchedAt < CURRENCY_CACHE_TTL) {
      applyRates(cached.rates);
      return;
    }
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,CAD,MXN');
    if (!res.ok) throw new Error('fx fetch failed');
    const data = await res.json();
    const rates = { USD: 1, ...data.rates };
    localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify({ rates, fetchedAt: Date.now() }));
    applyRates(rates);
  } catch (e) {
    // Network unavailable or API down — silently keep the static fallback
    // table above so pricing still renders correctly.
  }
}
function applyRates(rates) {
  Object.keys(rates).forEach(code => {
    if (window.CURRENCY_RATES[code]) window.CURRENCY_RATES[code].rate = rates[code];
  });
  window.dispatchEvent(new CustomEvent('redgear:settingschange'));
}
refreshLiveRates();

window.getCurrency = function() {
  try { return (JSON.parse(localStorage.getItem('redgear_settings') || '{}').currency) || 'USD'; }
  catch (e) { return 'USD'; }
};
window.formatPrice = function(usd) {
  const code = window.getCurrency();
  const info = window.CURRENCY_RATES[code] || window.CURRENCY_RATES.USD;
  const converted = usd * info.rate;
  const decimals = converted >= 100 ? 0 : 2;
  return info.symbol + converted.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

/* ==========================================================================
   Translations — every user-facing string in the site chrome lives here.
   applyTranslations() walks THREE kinds of markers:
     data-i18n            → element.textContent
     data-i18n-placeholder → input/textarea placeholder attribute
     data-i18n-title       → title / aria-label attribute
   This covers nav, footer, hero, feature/trust strips, cart, account,
   settings, search, toasts, review modal, and the builder chrome (labels,
   buttons, empty states) on every page. The PC parts catalog itself
   (hundreds of product names/specs in builder.js) is treated as product
   data rather than UI copy and is not translated — localizing a live
   parts catalog is a separate content project, not a UI string table.
   ========================================================================== */
window.TRANSLATIONS = {
  en: {
    home:'Home', builds:'PC Builds', services:'Services', about:'About Us', contact:'Contact',
    shop:'Shop', company:'Company', support:'Support', newsletter:'Newsletter', rights:'All rights reserved.',
    viewBuilds:'View Builds', customBuild:'Custom Build', addToCart:'Add To Cart', buildNow:'Build Now',
    signIn:'Sign In', continueGuest:'Continue as Guest', cartTitle:'Your Cart', cartEmpty:'Your cart is empty',
    checkout:'Checkout', subtotal:'Subtotal', total:'Total',
    heroEyebrow:'Performance • Quality • Reliability', heroTitle1:'Built', heroTitle2:'For', heroTitle3:'Victory',
    heroDesc:'Custom PC builds designed for gamers, creators, and professionals. Unleash the power.',
    chooseBuild:'Choose Your Build',
    tagline:'Built for Victory.', taglinePrefix:'High Performance. Premium Quality.',
    navSearch:'Search', navAccount:'Account', navCart:'Cart', navMenu:'Menu', navSettings:'Settings',
    reviewsSuffix:'Reviews',
    featQualityTitle:'Premium Quality', featQualityDesc:'Top-tier parts from trusted brands.',
    featPerfTitle:'Max Performance', featPerfDesc:'Optimized for gaming & productivity.',
    featSupportTitle:'Expert Support', featSupportDesc:"We're here to help you win.",
    featShipTitle:'Fast Delivery', featShipDesc:'Quick & secure shipping.',
    catGamingTitle:'Gaming PCs', catGamingDesc:'Dominate every game.', catGamingBadge:'Best Seller',
    catCreatorTitle:'Creator PCs', catCreatorDesc:'Power your creativity.', catCreatorBadge:'Trending',
    catOfficeTitle:'Office PCs', catOfficeDesc:'Reliable. Efficient. Built for work.', catOfficeBadge:'Reliable',
    catCustomTitle:'Custom PCs', catCustomDesc:'Built exactly how you want.', catCustomBadge:'Custom',
    trustWarrantyTitle:'1-3 Year Warranty', trustWarrantyDesc:'Peace of mind guaranteed.',
    trustReturnsTitle:'30-Day Returns', trustReturnsDesc:'Hassle-free returns.',
    trustPaymentsTitle:'Secure Payments', trustPaymentsDesc:'Safe & encrypted checkout.',
    trustSatisfactionTitle:'100% Satisfaction', trustSatisfactionDesc:'We build. You win.',
    footerBrandDesc:'Custom PC builds engineered for performance, quality, and reliability. Built for victory, built for you.',
    footerWarranty:'Warranty', footerNewsletterDesc:'Get build guides & drop alerts.', footerEmailPh:'Your email',
    footerRightsLine:'RedGear PC Builds. All rights reserved.', footerLegal:'Privacy Policy · Terms of Service',
    breadcrumbHome:'Home',
    // Cart drawer
    cartItems:'items', cartItem:'item', cartEmptyDesc:'Add a prebuilt PC or design your own from scratch',
    cartStartBuild:'Start a Custom Build', cartShipping:'Estimated shipping', cartFree:'Free',
    cartPromoPh:'Promo code', cartPromoApply:'Apply', cartSecure:'Secure checkout · 30-day returns',
    // Search overlay
    searchPh:'Search builds, parts, GPUs, CPUs…', searchTry:'Try:',
    // Account panel
    myProfile:'My Profile', signOut:'Sign Out', saveName:'Save Name', displayName:'Display Name',
    myReviews:'my reviews', noReviews:"You haven't written any reviews yet.", removeLink:'Remove',
    signInTab:'Sign In', createTab:'Create Account', emailLabel:'Email', passwordLabel:'Password',
    nameLabel:'Name', confirmPasswordLabel:'Confirm Password', or:'or',
    guestFootnote:'Guests can browse freely, but need to sign in to add items to cart or check out.',
    removePhoto:'Remove photo',
    // Settings panel
    settingsTitle:'Settings', languageLabel:'Language', currencyLabel:'Currency',
    notifications:'notifications', emailNotifs:'Email Notifications', marketingEmails:'Marketing Emails',
    rememberCart:'Remember My Cart', rgbAnim:'RGB Preview Animations',
    accountSection:'account', newPassword:'New Password', changePassword:'Change Password',
    deleteAccount:'Delete Account', googleManaged:'Signed in with Google — password is managed by your Google account.',
    saveSettings:'Save Settings', clearData:'Clear Local Data',
    // Toasts
    toastAdded:'Added to cart', toastSignedOut:'Signed out', toastNameUpdated:'Display name updated',
    toastPicUpdated:'Profile picture updated', toastPicRemoved:'Profile picture removed',
    toastSettingsSaved:'Settings saved', toastDataCleared:'Local data cleared',
    toastPromoNeeded:'Enter a promo code first',
    toastPickStar:'Pick a star rating first', toastReviewSubmitted:'Review submitted — thanks!',
    // Review modal
    writeReview:'Write a Review', reviewPlaceholder:'What did you think of this build?', submitReview:'Submit Review',
    // Builder page chrome
    yourRig:'Your Rig', noPartsYet:'No parts selected yet', yourBuild:'Your Build', notSelected:'Not selected yet',
    addBuildToCart:'Add Build To Cart', resetSelections:'Reset Selections', partsSelectedOf:'of', partsSelected:'parts selected',
    filterAll:'All', showingCompatible:'Showing', compatibleOnly:'-compatible only',
    advisorTitle:'Build Advisor', advisorSub:'Ask what to buy for your budget',
    advisorAsk:'Ask', advisorFillBtn:'Fill My Builder With This', advisorFilled:'Builder filled with recommended parts',
    // About page
    aboutPageTitle:'Built By Gamers', aboutPageDesc:'RedGear started in a garage with two friends, a soldering iron, and a stack of secondhand GPUs. Today we ship hundreds of rigs a month — without losing the obsession we started with.',
    aboutStoryHeading:'Our Story',
    aboutStoryP1:"We were tired of overpriced, underpowered \"gaming PCs\" padded with marketing fluff. So we started building rigs the way we'd want to buy them: real part numbers, real benchmarks, and a technician who actually games on the side.",
    aboutStoryP2:'Every build that leaves our shop gets a 48-hour burn-in test, a full cable dress, and a build sheet listing every component we used — no surprises, no substitutions.',
    aboutStatRigs:'Rigs Shipped', aboutStatRating:'Average Rating', aboutStatBurnin:'Burn-In Testing', aboutStatWarranty:'Warranty Standard',
    aboutValue1Title:'Quality First', aboutValue1Desc:"We only stock parts we'd put in our own machines — no filler, no bloatware, no shortcuts.",
    aboutValue2Title:'Honest Pricing', aboutValue2Desc:"Transparent build sheets and no hidden fees — you see exactly what's in your rig and what it costs.",
    aboutValue3Title:'Real Support', aboutValue3Desc:'Talk to an actual technician, not a ticket queue. We stand behind every build we ship.',
    // Services page
    servicesPageTitle:'What We Do', servicesPageDesc:'From custom builds to upgrades and repairs — our technicians treat every rig like their own.',
    servicesHowTitle:'How It Works',
    servicesStep1Title:'Consult', servicesStep1Desc:"Tell us your budget, use case, and must-haves. We'll spec the right parts for the job.",
    servicesStep2Title:'Build', servicesStep2Desc:'A dedicated technician assembles your rig by hand with meticulous cable management.',
    servicesStep3Title:'Test', servicesStep3Desc:"Every build gets a 48-hour burn-in stress test before it's cleared to ship.",
    servicesStep4Title:'Ship', servicesStep4Desc:'Securely packed and shipped with a full build sheet and multi-year warranty.',
    servicesCard1Title:'Custom Builds', servicesCard1Desc:"Tell us your budget and use case — we'll spec, build, and stress-test a rig made exactly for you.",
    servicesCard2Title:'Upgrades', servicesCard2Desc:'GPU, RAM, storage, or a full platform swap — we upgrade existing systems without the guesswork.',
    servicesCard3Title:'Diagnostics & Repair', servicesCard3Desc:'Boot loops, thermal issues, artifacting — our bench techs find the root cause and fix it fast.',
    servicesCard4Title:'Cable Management & Cleaning', servicesCard4Desc:'Full teardown, dust removal, thermal paste refresh, and a cable job that looks as good as it runs.',
    servicesCard5Title:'Data Migration', servicesCard5Desc:'Moving to a new rig? We clone your drive and get every file, save, and setting exactly where it was.',
    servicesCard6Title:'Overclocking & Tuning', servicesCard6Desc:'Safe, stability-tested overclocks on CPU, GPU, and memory to squeeze out every last frame.',
    // Contact page
    contactPageTitle:'Get In Touch', contactPageDesc:'Questions about a build, a repair, or a bulk order? Our team replies within one business day.',
    contactSubjectLabel:'Subject', contactSubjectOpt1:'Custom Build Inquiry', contactSubjectOpt2:'Repair / Diagnostics', contactSubjectOpt3:'Order Support', contactSubjectOpt4:'Other',
    contactMessageLabel:'Message', contactMessagePh:"Tell us what you're looking for...", contactSendBtn:'Send Message',
    contactCallTitle:'Call Us', contactCallDesc:'Mon–Fri, 9am–6pm EST',
    contactEmailTitle:'Email Us', contactEmailDesc:'We reply within 24 hours',
    contactVisitTitle:'Visit The Shop', contactVisitAddr:'128 Circuit Way, Austin, TX 78701',
    contactToastSuccess:"Thanks! We'll be in touch shortly.",
    // Builds listing page
    buildsPageTitle:'Prebuilt PCs', buildsPageDesc:'Hand-assembled, stress-tested, and ready to ship. Or start from scratch with our custom builder.',
    buildsNoMatch:'No builds match that search.', buildsResultsFor:'Results for', buildsFound:'builds found.',
    // Builder page
    builderPageTitle:'Build Your Own PC', builderPageDesc:'Pick every part yourself. Real-time pricing, compatibility-checked components, built by our experts and shipped to your door.',
  },
  es: {
    home:'Inicio', builds:'PCs Armadas', services:'Servicios', about:'Nosotros', contact:'Contacto',
    shop:'Tienda', company:'Empresa', support:'Soporte', newsletter:'Boletín', rights:'Todos los derechos reservados.',
    viewBuilds:'Ver Modelos', customBuild:'Armar PC', addToCart:'Añadir al Carrito', buildNow:'Armar Ahora',
    signIn:'Iniciar Sesión', continueGuest:'Continuar como Invitado', cartTitle:'Tu Carrito', cartEmpty:'Tu carrito está vacío',
    checkout:'Pagar', subtotal:'Subtotal', total:'Total',
    heroEyebrow:'Rendimiento • Calidad • Confiabilidad', heroTitle1:'Hecho', heroTitle2:'Para', heroTitle3:'Vencer',
    heroDesc:'PCs a medida diseñadas para gamers, creadores y profesionales. Libera el poder.',
    chooseBuild:'Elige Tu PC',
    tagline:'Hecho Para Vencer.', taglinePrefix:'Alto Rendimiento. Calidad Premium.',
    navSearch:'Buscar', navAccount:'Cuenta', navCart:'Carrito', navMenu:'Menú', navSettings:'Ajustes',
    reviewsSuffix:'Reseñas',
    featQualityTitle:'Calidad Premium', featQualityDesc:'Componentes de primer nivel de marcas confiables.',
    featPerfTitle:'Máximo Rendimiento', featPerfDesc:'Optimizado para gaming y productividad.',
    featSupportTitle:'Soporte Experto', featSupportDesc:'Estamos aquí para ayudarte a ganar.',
    featShipTitle:'Envío Rápido', featShipDesc:'Envío rápido y seguro.',
    catGamingTitle:'PCs Gaming', catGamingDesc:'Domina cada juego.', catGamingBadge:'Más Vendido',
    catCreatorTitle:'PCs Creador', catCreatorDesc:'Potencia tu creatividad.', catCreatorBadge:'Tendencia',
    catOfficeTitle:'PCs Oficina', catOfficeDesc:'Confiable. Eficiente. Hecho para trabajar.', catOfficeBadge:'Confiable',
    catCustomTitle:'PCs Personalizadas', catCustomDesc:'Hecha exactamente como la quieres.', catCustomBadge:'Personalizado',
    trustWarrantyTitle:'Garantía de 1-3 Años', trustWarrantyDesc:'Tranquilidad garantizada.',
    trustReturnsTitle:'Devoluciones en 30 Días', trustReturnsDesc:'Devoluciones sin complicaciones.',
    trustPaymentsTitle:'Pagos Seguros', trustPaymentsDesc:'Pago seguro y encriptado.',
    trustSatisfactionTitle:'100% Satisfacción', trustSatisfactionDesc:'Nosotros construimos. Tú ganas.',
    footerBrandDesc:'PCs a medida diseñadas para rendimiento, calidad y confiabilidad. Hechas para vencer, hechas para ti.',
    footerWarranty:'Garantía', footerNewsletterDesc:'Recibe guías de construcción y alertas.', footerEmailPh:'Tu correo',
    footerRightsLine:'RedGear PC Builds. Todos los derechos reservados.', footerLegal:'Política de Privacidad · Términos de Servicio',
    breadcrumbHome:'Inicio',
    cartItems:'artículos', cartItem:'artículo', cartEmptyDesc:'Añade una PC prearmada o diseña la tuya desde cero',
    cartStartBuild:'Iniciar Build Personalizado', cartShipping:'Envío estimado', cartFree:'Gratis',
    cartPromoPh:'Código promocional', cartPromoApply:'Aplicar', cartSecure:'Pago seguro · Devoluciones en 30 días',
    searchPh:'Buscar PCs, piezas, GPUs, CPUs…', searchTry:'Prueba:',
    myProfile:'Mi Perfil', signOut:'Cerrar Sesión', saveName:'Guardar Nombre', displayName:'Nombre para Mostrar',
    myReviews:'mis reseñas', noReviews:'Aún no has escrito ninguna reseña.', removeLink:'Eliminar',
    signInTab:'Iniciar Sesión', createTab:'Crear Cuenta', emailLabel:'Correo Electrónico', passwordLabel:'Contraseña',
    nameLabel:'Nombre', confirmPasswordLabel:'Confirmar Contraseña', or:'o',
    guestFootnote:'Los invitados pueden navegar libremente, pero deben iniciar sesión para añadir productos al carrito o pagar.',
    removePhoto:'Eliminar foto',
    settingsTitle:'Ajustes', languageLabel:'Idioma', currencyLabel:'Moneda',
    notifications:'notificaciones', emailNotifs:'Notificaciones por Correo', marketingEmails:'Correos de Marketing',
    rememberCart:'Recordar Mi Carrito', rgbAnim:'Animaciones RGB de Vista Previa',
    accountSection:'cuenta', newPassword:'Nueva Contraseña', changePassword:'Cambiar Contraseña',
    deleteAccount:'Eliminar Cuenta', googleManaged:'Sesión iniciada con Google — tu contraseña la administra tu cuenta de Google.',
    saveSettings:'Guardar Ajustes', clearData:'Borrar Datos Locales',
    toastAdded:'Añadido al carrito', toastSignedOut:'Sesión cerrada', toastNameUpdated:'Nombre actualizado',
    toastPicUpdated:'Foto de perfil actualizada', toastPicRemoved:'Foto de perfil eliminada',
    toastSettingsSaved:'Ajustes guardados', toastDataCleared:'Datos locales borrados',
    toastPromoNeeded:'Ingresa un código promocional primero',
    toastPickStar:'Elige una calificación primero', toastReviewSubmitted:'Reseña enviada — ¡gracias!',
    writeReview:'Escribir una Reseña', reviewPlaceholder:'¿Qué te pareció esta build?', submitReview:'Enviar Reseña',
    yourRig:'Tu Equipo', noPartsYet:'Aún no hay piezas seleccionadas', yourBuild:'Tu Build', notSelected:'Aún no seleccionado',
    addBuildToCart:'Añadir Build al Carrito', resetSelections:'Reiniciar Selecciones', partsSelectedOf:'de', partsSelected:'piezas seleccionadas',
    filterAll:'Todos', showingCompatible:'Mostrando solo compatibles con', compatibleOnly:'',
    advisorTitle:'Asesor de Builds', advisorSub:'Pregunta qué comprar según tu presupuesto',
    advisorAsk:'Preguntar', advisorFillBtn:'Rellenar Mi Build Con Esto', advisorFilled:'Build rellenado con las piezas recomendadas',
    aboutPageTitle:'Hecho Por Gamers', aboutPageDesc:'RedGear comenzó en un garaje con dos amigos, un cautín y una pila de GPUs de segunda mano. Hoy enviamos cientos de equipos al mes — sin perder la obsesión con la que empezamos.',
    aboutStoryHeading:'Nuestra Historia',
    aboutStoryP1:'Estábamos cansados de las "PCs gaming" sobrevaloradas y poco potentes, infladas con marketing. Así que empezamos a construir equipos como nos gustaría comprarlos: números de pieza reales, benchmarks reales y un técnico que realmente juega.',
    aboutStoryP2:'Cada build que sale de nuestro taller pasa una prueba de estrés de 48 horas, un cableado completo y una hoja de build con cada componente usado — sin sorpresas, sin sustituciones.',
    aboutStatRigs:'Equipos Enviados', aboutStatRating:'Calificación Promedio', aboutStatBurnin:'Prueba de Estrés', aboutStatWarranty:'Garantía Estándar',
    aboutValue1Title:'Calidad Primero', aboutValue1Desc:'Solo usamos piezas que pondríamos en nuestras propias máquinas — sin relleno, sin bloatware, sin atajos.',
    aboutValue2Title:'Precios Honestos', aboutValue2Desc:'Hojas de build transparentes y sin cargos ocultos — ves exactamente qué lleva tu equipo y cuánto cuesta.',
    aboutValue3Title:'Soporte Real', aboutValue3Desc:'Habla con un técnico real, no con una cola de tickets. Respaldamos cada build que enviamos.',
    servicesPageTitle:'Qué Hacemos', servicesPageDesc:'Desde builds personalizados hasta mejoras y reparaciones — nuestros técnicos tratan cada equipo como propio.',
    servicesHowTitle:'Cómo Funciona',
    servicesStep1Title:'Consulta', servicesStep1Desc:'Cuéntanos tu presupuesto, uso y requisitos. Especificaremos las piezas correctas.',
    servicesStep2Title:'Construcción', servicesStep2Desc:'Un técnico dedicado arma tu equipo a mano con un cableado meticuloso.',
    servicesStep3Title:'Prueba', servicesStep3Desc:'Cada build pasa una prueba de estrés de 48 horas antes de ser autorizado para envío.',
    servicesStep4Title:'Envío', servicesStep4Desc:'Empaquetado y enviado de forma segura con hoja de build completa y garantía multianual.',
    servicesCard1Title:'Builds Personalizados', servicesCard1Desc:'Cuéntanos tu presupuesto y uso — especificaremos, construiremos y probaremos un equipo hecho para ti.',
    servicesCard2Title:'Mejoras', servicesCard2Desc:'GPU, RAM, almacenamiento o un cambio de plataforma completo — mejoramos sistemas existentes sin conjeturas.',
    servicesCard3Title:'Diagnóstico y Reparación', servicesCard3Desc:'Bucles de arranque, problemas térmicos, artefactos — nuestros técnicos encuentran la causa raíz y la resuelven rápido.',
    servicesCard4Title:'Cableado y Limpieza', servicesCard4Desc:'Desmontaje completo, eliminación de polvo, renovación de pasta térmica y un cableado tan bueno como su rendimiento.',
    servicesCard5Title:'Migración de Datos', servicesCard5Desc:'¿Te cambias a un equipo nuevo? Clonamos tu disco y llevamos cada archivo, guardado y ajuste exactamente donde estaba.',
    servicesCard6Title:'Overclocking y Ajuste', servicesCard6Desc:'Overclocks seguros y probados en CPU, GPU y memoria para exprimir cada fotograma.',
    contactPageTitle:'Ponte En Contacto', contactPageDesc:'¿Preguntas sobre un build, una reparación o un pedido al mayor? Nuestro equipo responde en un día hábil.',
    contactSubjectLabel:'Asunto', contactSubjectOpt1:'Consulta de Build Personalizado', contactSubjectOpt2:'Reparación / Diagnóstico', contactSubjectOpt3:'Soporte de Pedido', contactSubjectOpt4:'Otro',
    contactMessageLabel:'Mensaje', contactMessagePh:'Cuéntanos qué estás buscando...', contactSendBtn:'Enviar Mensaje',
    contactCallTitle:'Llámanos', contactCallDesc:'Lun–Vie, 9am–6pm EST',
    contactEmailTitle:'Escríbenos', contactEmailDesc:'Respondemos en 24 horas',
    contactVisitTitle:'Visita la Tienda', contactVisitAddr:'128 Circuit Way, Austin, TX 78701',
    contactToastSuccess:'¡Gracias! Nos pondremos en contacto pronto.',
    buildsPageTitle:'PCs Prearmadas', buildsPageDesc:'Ensambladas a mano, probadas y listas para enviar. O empieza desde cero con nuestro configurador.',
    buildsNoMatch:'Ningún build coincide con esa búsqueda.', buildsResultsFor:'Resultados para', buildsFound:'builds encontrados.',
    builderPageTitle:'Arma Tu Propia PC', builderPageDesc:'Elige cada pieza tú mismo. Precios en tiempo real, componentes verificados por compatibilidad, construidos por expertos y enviados a tu puerta.',
  },
  fr: {
    home:'Accueil', builds:'PC Prêts', services:'Services', about:'À Propos', contact:'Contact',
    shop:'Boutique', company:'Entreprise', support:'Support', newsletter:'Newsletter', rights:'Tous droits réservés.',
    viewBuilds:'Voir les PC', customBuild:'PC Personnalisé', addToCart:'Ajouter au Panier', buildNow:'Créer Maintenant',
    signIn:'Se Connecter', continueGuest:'Continuer en Invité', cartTitle:'Votre Panier', cartEmpty:'Votre panier est vide',
    checkout:'Paiement', subtotal:'Sous-total', total:'Total',
    heroEyebrow:'Performance • Qualité • Fiabilité', heroTitle1:'Conçu', heroTitle2:'Pour', heroTitle3:'Vaincre',
    heroDesc:'PC sur mesure conçus pour les joueurs, créateurs et professionnels. Libérez la puissance.',
    chooseBuild:'Choisissez Votre PC',
    tagline:'Conçu Pour Vaincre.', taglinePrefix:'Haute Performance. Qualité Premium.',
    navSearch:'Recherche', navAccount:'Compte', navCart:'Panier', navMenu:'Menu', navSettings:'Paramètres',
    reviewsSuffix:'Avis',
    featQualityTitle:'Qualité Premium', featQualityDesc:'Composants haut de gamme de marques fiables.',
    featPerfTitle:'Performance Maximale', featPerfDesc:'Optimisé pour le gaming et la productivité.',
    featSupportTitle:'Support Expert', featSupportDesc:'Nous sommes là pour vous aider à gagner.',
    featShipTitle:'Livraison Rapide', featShipDesc:'Expédition rapide et sécurisée.',
    catGamingTitle:'PC Gaming', catGamingDesc:'Dominez chaque partie.', catGamingBadge:'Best-seller',
    catCreatorTitle:'PC Créateur', catCreatorDesc:'Boostez votre créativité.', catCreatorBadge:'Tendance',
    catOfficeTitle:'PC Bureautique', catOfficeDesc:'Fiable. Efficace. Conçu pour le travail.', catOfficeBadge:'Fiable',
    catCustomTitle:'PC Personnalisés', catCustomDesc:'Construit exactement comme vous le souhaitez.', catCustomBadge:'Sur mesure',
    trustWarrantyTitle:'Garantie 1-3 Ans', trustWarrantyDesc:'Tranquillité d\u2019esprit garantie.',
    trustReturnsTitle:'Retours sous 30 Jours', trustReturnsDesc:'Retours sans tracas.',
    trustPaymentsTitle:'Paiements Sécurisés', trustPaymentsDesc:'Paiement sûr et chiffré.',
    trustSatisfactionTitle:'100% Satisfaction', trustSatisfactionDesc:'Nous construisons. Vous gagnez.',
    footerBrandDesc:'PC sur mesure conçus pour la performance, la qualité et la fiabilité. Conçus pour vaincre, conçus pour vous.',
    footerWarranty:'Garantie', footerNewsletterDesc:'Recevez guides et alertes de sortie.', footerEmailPh:'Votre email',
    footerRightsLine:'RedGear PC Builds. Tous droits réservés.', footerLegal:'Politique de Confidentialité · Conditions d\u2019Utilisation',
    breadcrumbHome:'Accueil',
    cartItems:'articles', cartItem:'article', cartEmptyDesc:'Ajoutez un PC prêt ou concevez le vôtre de A à Z',
    cartStartBuild:'Démarrer un PC Personnalisé', cartShipping:'Livraison estimée', cartFree:'Gratuite',
    cartPromoPh:'Code promo', cartPromoApply:'Appliquer', cartSecure:'Paiement sécurisé · Retours sous 30 jours',
    searchPh:'Rechercher PC, pièces, GPU, CPU…', searchTry:'Essayez :',
    myProfile:'Mon Profil', signOut:'Se Déconnecter', saveName:'Enregistrer le Nom', displayName:'Nom Affiché',
    myReviews:'mes avis', noReviews:"Vous n'avez pas encore écrit d'avis.", removeLink:'Supprimer',
    signInTab:'Se Connecter', createTab:'Créer un Compte', emailLabel:'Email', passwordLabel:'Mot de Passe',
    nameLabel:'Nom', confirmPasswordLabel:'Confirmer le Mot de Passe', or:'ou',
    guestFootnote:'Les invités peuvent naviguer librement, mais doivent se connecter pour ajouter des articles au panier ou payer.',
    removePhoto:'Supprimer la photo',
    settingsTitle:'Paramètres', languageLabel:'Langue', currencyLabel:'Devise',
    notifications:'notifications', emailNotifs:'Notifications par Email', marketingEmails:'Emails Marketing',
    rememberCart:'Mémoriser Mon Panier', rgbAnim:'Animations RGB de l\u2019Aperçu',
    accountSection:'compte', newPassword:'Nouveau Mot de Passe', changePassword:'Changer le Mot de Passe',
    deleteAccount:'Supprimer le Compte', googleManaged:'Connecté avec Google — le mot de passe est géré par votre compte Google.',
    saveSettings:'Enregistrer', clearData:'Effacer les Données Locales',
    toastAdded:'Ajouté au panier', toastSignedOut:'Déconnecté', toastNameUpdated:'Nom mis à jour',
    toastPicUpdated:'Photo de profil mise à jour', toastPicRemoved:'Photo de profil supprimée',
    toastSettingsSaved:'Paramètres enregistrés', toastDataCleared:'Données locales effacées',
    toastPromoNeeded:"Entrez d'abord un code promo",
    toastPickStar:"Choisissez d'abord une note", toastReviewSubmitted:'Avis envoyé — merci !',
    writeReview:'Écrire un Avis', reviewPlaceholder:'Qu\u2019avez-vous pensé de ce PC ?', submitReview:'Envoyer l\u2019Avis',
    yourRig:'Votre PC', noPartsYet:'Aucune pièce sélectionnée', yourBuild:'Votre PC', notSelected:'Pas encore sélectionné',
    addBuildToCart:'Ajouter au Panier', resetSelections:'Réinitialiser', partsSelectedOf:'sur', partsSelected:'pièces sélectionnées',
    filterAll:'Tous', showingCompatible:'Affichage compatible', compatibleOnly:'uniquement',
    advisorTitle:'Conseiller de Build', advisorSub:'Demandez quoi acheter selon votre budget',
    advisorAsk:'Demander', advisorFillBtn:'Remplir Avec Cette Sélection', advisorFilled:'Configurateur rempli avec les pièces recommandées',
    aboutPageTitle:'Conçu Par Des Gamers', aboutPageDesc:'RedGear a débuté dans un garage avec deux amis, un fer à souder et une pile de GPU d\u2019occasion. Aujourd\u2019hui nous expédions des centaines de PC par mois — sans perdre l\u2019obsession du début.',
    aboutStoryHeading:'Notre Histoire',
    aboutStoryP1:'Nous en avions assez des "PC gaming" surfacturés et sous-performants, gonflés de marketing. Alors nous avons commencé à construire des PC comme nous voudrions les acheter : vraies références, vrais benchmarks, et un technicien qui joue vraiment.',
    aboutStoryP2:'Chaque PC qui sort de notre atelier passe un test de 48 heures, un câblage complet et une fiche listant chaque composant utilisé — sans surprise, sans substitution.',
    aboutStatRigs:'PC Expédiés', aboutStatRating:'Note Moyenne', aboutStatBurnin:'Test de Stabilité', aboutStatWarranty:'Garantie Standard',
    aboutValue1Title:'Qualité D\u2019Abord', aboutValue1Desc:'Nous ne stockons que des pièces que nous mettrions dans nos propres machines — pas de remplissage, pas de bloatware, pas de raccourcis.',
    aboutValue2Title:'Prix Honnêtes', aboutValue2Desc:'Fiches de build transparentes et aucun frais caché — vous voyez exactement ce qu\u2019il y a dans votre PC et son coût.',
    aboutValue3Title:'Vrai Support', aboutValue3Desc:'Parlez à un vrai technicien, pas à une file d\u2019attente. Nous soutenons chaque PC que nous livrons.',
    servicesPageTitle:'Ce Que Nous Faisons', servicesPageDesc:'Des builds sur mesure aux mises à niveau et réparations — nos techniciens traitent chaque PC comme le leur.',
    servicesHowTitle:'Comment Ça Marche',
    servicesStep1Title:'Consultation', servicesStep1Desc:'Indiquez-nous votre budget, votre usage et vos indispensables. Nous choisirons les bonnes pièces.',
    servicesStep2Title:'Construction', servicesStep2Desc:'Un technicien dédié assemble votre PC à la main avec un câblage méticuleux.',
    servicesStep3Title:'Test', servicesStep3Desc:'Chaque PC subit un test de stabilité de 48 heures avant d\u2019être validé pour l\u2019expédition.',
    servicesStep4Title:'Expédition', servicesStep4Desc:'Emballé et expédié en toute sécurité avec une fiche complète et une garantie pluriannuelle.',
    servicesCard1Title:'PC Sur Mesure', servicesCard1Desc:'Indiquez-nous votre budget et votre usage — nous spécifierons, construirons et testerons un PC fait pour vous.',
    servicesCard2Title:'Mises à Niveau', servicesCard2Desc:'GPU, RAM, stockage ou changement complet de plateforme — nous mettons à niveau vos systèmes existants sans tâtonnement.',
    servicesCard3Title:'Diagnostic et Réparation', servicesCard3Desc:'Boucles de démarrage, problèmes thermiques, artefacts — nos techniciens trouvent la cause et la corrigent vite.',
    servicesCard4Title:'Câblage et Nettoyage', servicesCard4Desc:'Démontage complet, dépoussiérage, pâte thermique renouvelée et un câblage aussi soigné que performant.',
    servicesCard5Title:'Migration de Données', servicesCard5Desc:'Vous changez de PC ? Nous clonons votre disque et retrouvons chaque fichier, sauvegarde et réglage à sa place.',
    servicesCard6Title:'Overclocking et Réglage', servicesCard6Desc:'Overclocks sûrs et testés sur CPU, GPU et mémoire pour gagner chaque image par seconde.',
    contactPageTitle:'Contactez-Nous', contactPageDesc:'Des questions sur un build, une réparation ou une commande en gros ? Notre équipe répond sous un jour ouvré.',
    contactSubjectLabel:'Sujet', contactSubjectOpt1:'Demande de Build Personnalisé', contactSubjectOpt2:'Réparation / Diagnostic', contactSubjectOpt3:'Support de Commande', contactSubjectOpt4:'Autre',
    contactMessageLabel:'Message', contactMessagePh:'Dites-nous ce que vous recherchez...', contactSendBtn:'Envoyer le Message',
    contactCallTitle:'Appelez-Nous', contactCallDesc:'Lun–Ven, 9h–18h EST',
    contactEmailTitle:'Écrivez-Nous', contactEmailDesc:'Nous répondons sous 24 heures',
    contactVisitTitle:'Visitez la Boutique', contactVisitAddr:'128 Circuit Way, Austin, TX 78701',
    contactToastSuccess:'Merci ! Nous vous recontacterons bientôt.',
    buildsPageTitle:'PC Prêts à l\u2019Emploi', buildsPageDesc:'Assemblés à la main, testés en stress, prêts à expédier. Ou partez de zéro avec notre configurateur.',
    buildsNoMatch:'Aucun PC ne correspond à cette recherche.', buildsResultsFor:'Résultats pour', buildsFound:'PC trouvés.',
    builderPageTitle:'Créez Votre Propre PC', builderPageDesc:'Choisissez chaque pièce vous-même. Prix en temps réel, composants vérifiés pour la compatibilité, construits par nos experts et livrés chez vous.',
  },
  de: {
    home:'Startseite', builds:'Fertig-PCs', services:'Dienstleistungen', about:'Über Uns', contact:'Kontakt',
    shop:'Shop', company:'Unternehmen', support:'Support', newsletter:'Newsletter', rights:'Alle Rechte vorbehalten.',
    viewBuilds:'PCs Ansehen', customBuild:'PC Konfigurieren', addToCart:'In den Warenkorb', buildNow:'Jetzt Bauen',
    signIn:'Anmelden', continueGuest:'Als Gast Fortfahren', cartTitle:'Dein Warenkorb', cartEmpty:'Dein Warenkorb ist leer',
    checkout:'Zur Kasse', subtotal:'Zwischensumme', total:'Gesamt',
    heroEyebrow:'Leistung • Qualität • Zuverlässigkeit', heroTitle1:'Gebaut', heroTitle2:'Für', heroTitle3:'Den Sieg',
    heroDesc:'Individuelle PCs für Gamer, Kreative und Profis. Entfessle die Power.',
    chooseBuild:'Wähle Deinen PC',
    tagline:'Gebaut Für Den Sieg.', taglinePrefix:'Hohe Leistung. Premium-Qualität.',
    navSearch:'Suche', navAccount:'Konto', navCart:'Warenkorb', navMenu:'Menü', navSettings:'Einstellungen',
    reviewsSuffix:'Bewertungen',
    featQualityTitle:'Premium-Qualität', featQualityDesc:'Hochwertige Teile von vertrauenswürdigen Marken.',
    featPerfTitle:'Maximale Leistung', featPerfDesc:'Optimiert für Gaming & Produktivität.',
    featSupportTitle:'Experten-Support', featSupportDesc:'Wir helfen dir zu gewinnen.',
    featShipTitle:'Schneller Versand', featShipDesc:'Schnell und sicher versendet.',
    catGamingTitle:'Gaming-PCs', catGamingDesc:'Dominiere jedes Spiel.', catGamingBadge:'Bestseller',
    catCreatorTitle:'Creator-PCs', catCreatorDesc:'Stärke deine Kreativität.', catCreatorBadge:'Im Trend',
    catOfficeTitle:'Büro-PCs', catOfficeDesc:'Zuverlässig. Effizient. Für die Arbeit gebaut.', catOfficeBadge:'Zuverlässig',
    catCustomTitle:'Individuelle PCs', catCustomDesc:'Genau so gebaut, wie du es willst.', catCustomBadge:'Individuell',
    trustWarrantyTitle:'1-3 Jahre Garantie', trustWarrantyDesc:'Garantierte Sorgenfreiheit.',
    trustReturnsTitle:'30 Tage Rückgabe', trustReturnsDesc:'Problemlose Rückgabe.',
    trustPaymentsTitle:'Sichere Zahlungen', trustPaymentsDesc:'Sicherer, verschlüsselter Checkout.',
    trustSatisfactionTitle:'100% Zufriedenheit', trustSatisfactionDesc:'Wir bauen. Du gewinnst.',
    footerBrandDesc:'Individuelle PCs für Leistung, Qualität und Zuverlässigkeit. Gebaut für den Sieg, gebaut für dich.',
    footerWarranty:'Garantie', footerNewsletterDesc:'Erhalte Build-Guides & Drop-Alarme.', footerEmailPh:'Deine E-Mail',
    footerRightsLine:'RedGear PC Builds. Alle Rechte vorbehalten.', footerLegal:'Datenschutz · Nutzungsbedingungen',
    breadcrumbHome:'Startseite',
    cartItems:'Artikel', cartItem:'Artikel', cartEmptyDesc:'Füge einen Fertig-PC hinzu oder gestalte deinen eigenen von Grund auf',
    cartStartBuild:'Individuellen PC Starten', cartShipping:'Geschätzter Versand', cartFree:'Kostenlos',
    cartPromoPh:'Aktionscode', cartPromoApply:'Anwenden', cartSecure:'Sicherer Checkout · 30 Tage Rückgabe',
    searchPh:'PCs, Teile, GPUs, CPUs suchen…', searchTry:'Versuche:',
    myProfile:'Mein Profil', signOut:'Abmelden', saveName:'Namen Speichern', displayName:'Anzeigename',
    myReviews:'meine bewertungen', noReviews:'Du hast noch keine Bewertungen geschrieben.', removeLink:'Entfernen',
    signInTab:'Anmelden', createTab:'Konto Erstellen', emailLabel:'E-Mail', passwordLabel:'Passwort',
    nameLabel:'Name', confirmPasswordLabel:'Passwort Bestätigen', or:'oder',
    guestFootnote:'Gäste können frei stöbern, müssen sich aber anmelden, um Artikel in den Warenkorb zu legen oder zur Kasse zu gehen.',
    removePhoto:'Foto entfernen',
    settingsTitle:'Einstellungen', languageLabel:'Sprache', currencyLabel:'Währung',
    notifications:'benachrichtigungen', emailNotifs:'E-Mail-Benachrichtigungen', marketingEmails:'Marketing-E-Mails',
    rememberCart:'Warenkorb Merken', rgbAnim:'RGB-Vorschau-Animationen',
    accountSection:'konto', newPassword:'Neues Passwort', changePassword:'Passwort Ändern',
    deleteAccount:'Konto Löschen', googleManaged:'Mit Google angemeldet — das Passwort wird von deinem Google-Konto verwaltet.',
    saveSettings:'Einstellungen Speichern', clearData:'Lokale Daten Löschen',
    toastAdded:'Zum Warenkorb hinzugefügt', toastSignedOut:'Abgemeldet', toastNameUpdated:'Anzeigename aktualisiert',
    toastPicUpdated:'Profilbild aktualisiert', toastPicRemoved:'Profilbild entfernt',
    toastSettingsSaved:'Einstellungen gespeichert', toastDataCleared:'Lokale Daten gelöscht',
    toastPromoNeeded:'Gib zuerst einen Aktionscode ein',
    toastPickStar:'Wähle zuerst eine Sternebewertung', toastReviewSubmitted:'Bewertung gesendet — danke!',
    writeReview:'Bewertung Schreiben', reviewPlaceholder:'Was hältst du von diesem PC?', submitReview:'Bewertung Absenden',
    yourRig:'Dein PC', noPartsYet:'Noch keine Teile ausgewählt', yourBuild:'Dein PC', notSelected:'Noch nicht ausgewählt',
    addBuildToCart:'PC In Den Warenkorb', resetSelections:'Auswahl Zurücksetzen', partsSelectedOf:'von', partsSelected:'Teilen ausgewählt',
    filterAll:'Alle', showingCompatible:'Zeige nur kompatibel mit', compatibleOnly:'',
    advisorTitle:'Build-Berater', advisorSub:'Frag, was du für dein Budget kaufen sollst',
    advisorAsk:'Fragen', advisorFillBtn:'Konfigurator Damit Füllen', advisorFilled:'Konfigurator mit empfohlenen Teilen gefüllt',
    aboutPageTitle:'Von Gamern Gebaut', aboutPageDesc:'RedGear begann in einer Garage mit zwei Freunden, einem Lötkolben und einem Stapel gebrauchter GPUs. Heute versenden wir Hunderte PCs im Monat — ohne die Leidenschaft von damals zu verlieren.',
    aboutStoryHeading:'Unsere Geschichte',
    aboutStoryP1:'Wir hatten genug von überteuerten, leistungsschwachen "Gaming-PCs" voller Marketing-Floskeln. Also bauten wir PCs so, wie wir sie selbst kaufen würden: echte Teilenummern, echte Benchmarks, und ein Techniker, der wirklich zockt.',
    aboutStoryP2:'Jeder PC, der unsere Werkstatt verlässt, durchläuft einen 48-Stunden-Belastungstest, sauberes Kabelmanagement und ein Datenblatt mit jeder verbauten Komponente — keine Überraschungen, keine Ersatzteile.',
    aboutStatRigs:'PCs Versendet', aboutStatRating:'Durchschnittsbewertung', aboutStatBurnin:'Belastungstest', aboutStatWarranty:'Standardgarantie',
    aboutValue1Title:'Qualität Zuerst', aboutValue1Desc:'Wir führen nur Teile, die wir selbst in unseren Rechnern verbauen würden — keine Füllmasse, keine Bloatware, keine Abkürzungen.',
    aboutValue2Title:'Ehrliche Preise', aboutValue2Desc:'Transparente Datenblätter und keine versteckten Gebühren — du siehst genau, was drinsteckt und was es kostet.',
    aboutValue3Title:'Echter Support', aboutValue3Desc:'Sprich mit einem echten Techniker, nicht mit einer Ticket-Warteschlange. Wir stehen hinter jedem PC, den wir liefern.',
    servicesPageTitle:'Was Wir Tun', servicesPageDesc:'Von individuellen PCs bis zu Upgrades und Reparaturen — unsere Techniker behandeln jeden Rechner wie ihren eigenen.',
    servicesHowTitle:'So Funktioniert Es',
    servicesStep1Title:'Beratung', servicesStep1Desc:'Nenne uns Budget, Einsatzzweck und Must-haves. Wir wählen die richtigen Teile aus.',
    servicesStep2Title:'Bau', servicesStep2Desc:'Ein fester Techniker baut deinen PC von Hand mit akribischem Kabelmanagement.',
    servicesStep3Title:'Test', servicesStep3Desc:'Jeder PC durchläuft einen 48-Stunden-Belastungstest, bevor er zum Versand freigegeben wird.',
    servicesStep4Title:'Versand', servicesStep4Desc:'Sicher verpackt und versendet mit vollständigem Datenblatt und mehrjähriger Garantie.',
    servicesCard1Title:'Individuelle PCs', servicesCard1Desc:'Nenne uns Budget und Einsatzzweck — wir planen, bauen und testen einen PC genau für dich.',
    servicesCard2Title:'Upgrades', servicesCard2Desc:'GPU, RAM, Speicher oder ein komplettes Plattform-Update — wir rüsten bestehende Systeme ohne Rätselraten auf.',
    servicesCard3Title:'Diagnose & Reparatur', servicesCard3Desc:'Bootschleifen, Wärmeprobleme, Bildfehler — unsere Techniker finden die Ursache und beheben sie schnell.',
    servicesCard4Title:'Kabelmanagement & Reinigung', servicesCard4Desc:'Komplette Zerlegung, Staubentfernung, neue Wärmeleitpaste und ein Kabeljob, der so gut aussieht wie er läuft.',
    servicesCard5Title:'Datenmigration', servicesCard5Desc:'Wechsel zu einem neuen PC? Wir klonen deine Festplatte und übertragen jede Datei, jeden Spielstand und jede Einstellung.',
    servicesCard6Title:'Übertaktung & Tuning', servicesCard6Desc:'Sichere, stabilitätsgetestete Übertaktung von CPU, GPU und Speicher für jedes letzte Bild pro Sekunde.',
    contactPageTitle:'Kontaktiere Uns', contactPageDesc:'Fragen zu einem Build, einer Reparatur oder einer Großbestellung? Unser Team antwortet innerhalb eines Werktags.',
    contactSubjectLabel:'Betreff', contactSubjectOpt1:'Anfrage für Individuellen PC', contactSubjectOpt2:'Reparatur / Diagnose', contactSubjectOpt3:'Bestell-Support', contactSubjectOpt4:'Sonstiges',
    contactMessageLabel:'Nachricht', contactMessagePh:'Sag uns, wonach du suchst...', contactSendBtn:'Nachricht Senden',
    contactCallTitle:'Ruf Uns An', contactCallDesc:'Mo–Fr, 9–18 Uhr EST',
    contactEmailTitle:'Schreib Uns', contactEmailDesc:'Wir antworten innerhalb von 24 Stunden',
    contactVisitTitle:'Besuch Den Laden', contactVisitAddr:'128 Circuit Way, Austin, TX 78701',
    contactToastSuccess:'Danke! Wir melden uns in Kürze.',
    buildsPageTitle:'Fertig-PCs', buildsPageDesc:'Handmontiert, stresstestet und versandbereit. Oder starte mit unserem Konfigurator von Grund auf.',
    buildsNoMatch:'Keine PCs entsprechen dieser Suche.', buildsResultsFor:'Ergebnisse für', buildsFound:'PCs gefunden.',
    builderPageTitle:'Baue Deinen Eigenen PC', builderPageDesc:'Wähle jedes Teil selbst. Echtzeitpreise, kompatibilitätsgeprüfte Komponenten, von unseren Experten gebaut und zu dir geliefert.',
  },
  pt: {
    home:'Início', builds:'PCs Prontos', services:'Serviços', about:'Sobre Nós', contact:'Contato',
    shop:'Loja', company:'Empresa', support:'Suporte', newsletter:'Newsletter', rights:'Todos os direitos reservados.',
    viewBuilds:'Ver PCs', customBuild:'PC Personalizado', addToCart:'Adicionar ao Carrinho', buildNow:'Montar Agora',
    signIn:'Entrar', continueGuest:'Continuar como Convidado', cartTitle:'Seu Carrinho', cartEmpty:'Seu carrinho está vazio',
    checkout:'Finalizar Compra', subtotal:'Subtotal', total:'Total',
    heroEyebrow:'Desempenho • Qualidade • Confiabilidade', heroTitle1:'Feito', heroTitle2:'Para', heroTitle3:'Vencer',
    heroDesc:'PCs personalizados para gamers, criadores e profissionais. Liberte o poder.',
    chooseBuild:'Escolha Seu PC',
    tagline:'Feito Para Vencer.', taglinePrefix:'Alto Desempenho. Qualidade Premium.',
    navSearch:'Buscar', navAccount:'Conta', navCart:'Carrinho', navMenu:'Menu', navSettings:'Configurações',
    reviewsSuffix:'Avaliações',
    featQualityTitle:'Qualidade Premium', featQualityDesc:'Peças de alto nível de marcas confiáveis.',
    featPerfTitle:'Desempenho Máximo', featPerfDesc:'Otimizado para jogos e produtividade.',
    featSupportTitle:'Suporte Especializado', featSupportDesc:'Estamos aqui para ajudar você a vencer.',
    featShipTitle:'Entrega Rápida', featShipDesc:'Envio rápido e seguro.',
    catGamingTitle:'PCs Gamer', catGamingDesc:'Domine todo jogo.', catGamingBadge:'Mais Vendido',
    catCreatorTitle:'PCs Criador', catCreatorDesc:'Potencialize sua criatividade.', catCreatorBadge:'Em Alta',
    catOfficeTitle:'PCs Escritório', catOfficeDesc:'Confiável. Eficiente. Feito para o trabalho.', catOfficeBadge:'Confiável',
    catCustomTitle:'PCs Personalizados', catCustomDesc:'Montado exatamente do seu jeito.', catCustomBadge:'Personalizado',
    trustWarrantyTitle:'Garantia de 1-3 Anos', trustWarrantyDesc:'Tranquilidade garantida.',
    trustReturnsTitle:'Devolução em 30 Dias', trustReturnsDesc:'Devoluções sem complicação.',
    trustPaymentsTitle:'Pagamentos Seguros', trustPaymentsDesc:'Checkout seguro e criptografado.',
    trustSatisfactionTitle:'100% Satisfação', trustSatisfactionDesc:'Nós montamos. Você vence.',
    footerBrandDesc:'PCs personalizados projetados para desempenho, qualidade e confiabilidade. Feitos para vencer, feitos para você.',
    footerWarranty:'Garantia', footerNewsletterDesc:'Receba guias de montagem e alertas.', footerEmailPh:'Seu email',
    footerRightsLine:'RedGear PC Builds. Todos os direitos reservados.', footerLegal:'Política de Privacidade · Termos de Serviço',
    breadcrumbHome:'Início',
    cartItems:'itens', cartItem:'item', cartEmptyDesc:'Adicione um PC pronto ou monte o seu do zero',
    cartStartBuild:'Iniciar Build Personalizada', cartShipping:'Frete estimado', cartFree:'Grátis',
    cartPromoPh:'Código promocional', cartPromoApply:'Aplicar', cartSecure:'Checkout seguro · Devoluções em 30 dias',
    searchPh:'Buscar PCs, peças, GPUs, CPUs…', searchTry:'Tente:',
    myProfile:'Meu Perfil', signOut:'Sair', saveName:'Salvar Nome', displayName:'Nome de Exibição',
    myReviews:'minhas avaliações', noReviews:'Você ainda não escreveu nenhuma avaliação.', removeLink:'Remover',
    signInTab:'Entrar', createTab:'Criar Conta', emailLabel:'Email', passwordLabel:'Senha',
    nameLabel:'Nome', confirmPasswordLabel:'Confirmar Senha', or:'ou',
    guestFootnote:'Convidados podem navegar livremente, mas precisam entrar para adicionar itens ao carrinho ou finalizar a compra.',
    removePhoto:'Remover foto',
    settingsTitle:'Configurações', languageLabel:'Idioma', currencyLabel:'Moeda',
    notifications:'notificações', emailNotifs:'Notificações por Email', marketingEmails:'Emails de Marketing',
    rememberCart:'Lembrar Meu Carrinho', rgbAnim:'Animações RGB de Prévia',
    accountSection:'conta', newPassword:'Nova Senha', changePassword:'Alterar Senha',
    deleteAccount:'Excluir Conta', googleManaged:'Conectado com Google — a senha é gerenciada pela sua conta Google.',
    saveSettings:'Salvar Configurações', clearData:'Limpar Dados Locais',
    toastAdded:'Adicionado ao carrinho', toastSignedOut:'Sessão encerrada', toastNameUpdated:'Nome atualizado',
    toastPicUpdated:'Foto de perfil atualizada', toastPicRemoved:'Foto de perfil removida',
    toastSettingsSaved:'Configurações salvas', toastDataCleared:'Dados locais apagados',
    toastPromoNeeded:'Digite um código promocional primeiro',
    toastPickStar:'Escolha uma classificação primeiro', toastReviewSubmitted:'Avaliação enviada — obrigado!',
    writeReview:'Escrever uma Avaliação', reviewPlaceholder:'O que você achou desta build?', submitReview:'Enviar Avaliação',
    yourRig:'Seu PC', noPartsYet:'Nenhuma peça selecionada ainda', yourBuild:'Sua Build', notSelected:'Ainda não selecionado',
    addBuildToCart:'Adicionar Build ao Carrinho', resetSelections:'Redefinir Seleções', partsSelectedOf:'de', partsSelected:'peças selecionadas',
    filterAll:'Todos', showingCompatible:'Mostrando compatíveis com', compatibleOnly:'',
    advisorTitle:'Consultor de Build', advisorSub:'Pergunte o que comprar com seu orçamento',
    advisorAsk:'Perguntar', advisorFillBtn:'Preencher Minha Build Com Isto', advisorFilled:'Builder preenchido com as peças recomendadas',
    aboutPageTitle:'Feito Por Gamers', aboutPageDesc:'A RedGear começou em uma garagem com dois amigos, um ferro de solda e uma pilha de GPUs usadas. Hoje enviamos centenas de PCs por mês — sem perder a obsessão com que começamos.',
    aboutStoryHeading:'Nossa História',
    aboutStoryP1:'Estávamos cansados de "PCs gamer" caros e fracos, inflados de marketing. Então começamos a montar PCs do jeito que gostaríamos de comprar: números de peça reais, benchmarks reais e um técnico que realmente joga.',
    aboutStoryP2:'Toda build que sai da nossa oficina passa por um teste de estresse de 48 horas, cabeamento completo e uma ficha listando cada componente usado — sem surpresas, sem substituições.',
    aboutStatRigs:'PCs Enviados', aboutStatRating:'Avaliação Média', aboutStatBurnin:'Teste de Estresse', aboutStatWarranty:'Garantia Padrão',
    aboutValue1Title:'Qualidade Primeiro', aboutValue1Desc:'Só usamos peças que colocaríamos em nossas próprias máquinas — sem enchimento, sem bloatware, sem atalhos.',
    aboutValue2Title:'Preços Honestos', aboutValue2Desc:'Fichas de build transparentes e sem taxas ocultas — você vê exatamente o que tem no seu PC e quanto custa.',
    aboutValue3Title:'Suporte Real', aboutValue3Desc:'Fale com um técnico de verdade, não com uma fila de tickets. Apoiamos toda build que enviamos.',
    servicesPageTitle:'O Que Fazemos', servicesPageDesc:'De builds personalizadas a upgrades e reparos — nossos técnicos tratam cada PC como se fosse seu.',
    servicesHowTitle:'Como Funciona',
    servicesStep1Title:'Consulta', servicesStep1Desc:'Diga seu orçamento, uso e requisitos essenciais. Vamos especificar as peças certas.',
    servicesStep2Title:'Montagem', servicesStep2Desc:'Um técnico dedicado monta seu PC à mão com cabeamento meticuloso.',
    servicesStep3Title:'Teste', servicesStep3Desc:'Toda build passa por um teste de estresse de 48 horas antes de ser liberada para envio.',
    servicesStep4Title:'Envio', servicesStep4Desc:'Embalado e enviado com segurança, com ficha completa e garantia de vários anos.',
    servicesCard1Title:'Builds Personalizadas', servicesCard1Desc:'Diga seu orçamento e uso — vamos especificar, montar e testar um PC feito exatamente para você.',
    servicesCard2Title:'Upgrades', servicesCard2Desc:'GPU, RAM, armazenamento ou troca completa de plataforma — atualizamos sistemas existentes sem chute.',
    servicesCard3Title:'Diagnóstico e Reparo', servicesCard3Desc:'Loops de boot, problemas térmicos, artefatos — nossos técnicos encontram a causa raiz e resolvem rápido.',
    servicesCard4Title:'Cabeamento e Limpeza', servicesCard4Desc:'Desmontagem completa, remoção de poeira, pasta térmica renovada e um cabeamento tão bom quanto seu desempenho.',
    servicesCard5Title:'Migração de Dados', servicesCard5Desc:'Trocando de PC? Clonamos seu disco e levamos cada arquivo, save e configuração exatamente para onde estavam.',
    servicesCard6Title:'Overclock e Ajuste', servicesCard6Desc:'Overclocks seguros e testados em CPU, GPU e memória para extrair cada quadro por segundo.',
    contactPageTitle:'Fale Conosco', contactPageDesc:'Dúvidas sobre uma build, um reparo ou um pedido em grande quantidade? Nossa equipe responde em um dia útil.',
    contactSubjectLabel:'Assunto', contactSubjectOpt1:'Consulta de Build Personalizada', contactSubjectOpt2:'Reparo / Diagnóstico', contactSubjectOpt3:'Suporte de Pedido', contactSubjectOpt4:'Outro',
    contactMessageLabel:'Mensagem', contactMessagePh:'Diga o que você está procurando...', contactSendBtn:'Enviar Mensagem',
    contactCallTitle:'Ligue Para Nós', contactCallDesc:'Seg–Sex, 9h–18h EST',
    contactEmailTitle:'Envie um Email', contactEmailDesc:'Respondemos em até 24 horas',
    contactVisitTitle:'Visite a Loja', contactVisitAddr:'128 Circuit Way, Austin, TX 78701',
    contactToastSuccess:'Obrigado! Entraremos em contato em breve.',
    buildsPageTitle:'PCs Prontos', buildsPageDesc:'Montados à mão, testados sob estresse e prontos para envio. Ou comece do zero com nosso configurador.',
    buildsNoMatch:'Nenhuma build corresponde a essa busca.', buildsResultsFor:'Resultados para', buildsFound:'builds encontradas.',
    builderPageTitle:'Monte Seu Próprio PC', builderPageDesc:'Escolha cada peça você mesmo. Preços em tempo real, componentes verificados por compatibilidade, montados por especialistas e entregues na sua porta.',
  },
  ja: {
    home:'ホーム', builds:'PCビルド', services:'サービス', about:'会社概要', contact:'お問い合わせ',
    shop:'ショップ', company:'会社', support:'サポート', newsletter:'ニュースレター', rights:'全著作権所有。',
    viewBuilds:'ビルドを見る', customBuild:'カスタムビルド', addToCart:'カートに追加', buildNow:'今すぐ作る',
    signIn:'サインイン', continueGuest:'ゲストとして続ける', cartTitle:'カート', cartEmpty:'カートは空です',
    checkout:'レジに進む', subtotal:'小計', total:'合計',
    heroEyebrow:'性能・品質・信頼性', heroTitle1:'勝利のために', heroTitle2:'造られた', heroTitle3:'マシン',
    heroDesc:'ゲーマー、クリエイター、プロフェッショナルのためのカスタムPC。力を解き放て。',
    chooseBuild:'あなたのPCを選ぶ',
    tagline:'勝利のために造られた。', taglinePrefix:'高性能。プレミアム品質。',
    navSearch:'検索', navAccount:'アカウント', navCart:'カート', navMenu:'メニュー', navSettings:'設定',
    reviewsSuffix:'件のレビュー',
    featQualityTitle:'プレミアム品質', featQualityDesc:'信頼できるブランドの最高級パーツ。',
    featPerfTitle:'最大パフォーマンス', featPerfDesc:'ゲームと生産性のために最適化。',
    featSupportTitle:'専門サポート', featSupportDesc:'あなたの勝利をサポートします。',
    featShipTitle:'迅速な配送', featShipDesc:'安全で迅速な配送。',
    catGamingTitle:'ゲーミングPC', catGamingDesc:'あらゆるゲームを制圧。', catGamingBadge:'ベストセラー',
    catCreatorTitle:'クリエイターPC', catCreatorDesc:'創造力を高める。', catCreatorBadge:'人気急上昇',
    catOfficeTitle:'オフィスPC', catOfficeDesc:'信頼性と効率性。仕事のために。', catOfficeBadge:'高信頼性',
    catCustomTitle:'カスタムPC', catCustomDesc:'思い通りに構築。', catCustomBadge:'カスタム',
    trustWarrantyTitle:'1〜3年保証', trustWarrantyDesc:'安心を保証。',
    trustReturnsTitle:'30日間返品', trustReturnsDesc:'手間のない返品。',
    trustPaymentsTitle:'安全な決済', trustPaymentsDesc:'安全で暗号化されたチェックアウト。',
    trustSatisfactionTitle:'満足度100%', trustSatisfactionDesc:'私たちが造り、あなたが勝つ。',
    footerBrandDesc:'性能、品質、信頼性のために設計されたカスタムPC。勝利のために、あなたのために。',
    footerWarranty:'保証', footerNewsletterDesc:'ビルドガイドと入荷通知を受け取る。', footerEmailPh:'メールアドレス',
    footerRightsLine:'RedGear PC Builds. 全著作権所有。', footerLegal:'プライバシーポリシー · 利用規約',
    breadcrumbHome:'ホーム',
    cartItems:'点', cartItem:'点', cartEmptyDesc:'完成品PCを追加するか、ゼロから自分のPCをデザインしましょう',
    cartStartBuild:'カスタムビルドを始める', cartShipping:'送料見積もり', cartFree:'無料',
    cartPromoPh:'プロモコード', cartPromoApply:'適用', cartSecure:'安全なチェックアウト · 30日間返品',
    searchPh:'PC、パーツ、GPU、CPUを検索…', searchTry:'例：',
    myProfile:'マイプロフィール', signOut:'サインアウト', saveName:'名前を保存', displayName:'表示名',
    myReviews:'マイレビュー', noReviews:'まだレビューを書いていません。', removeLink:'削除',
    signInTab:'サインイン', createTab:'アカウント作成', emailLabel:'メールアドレス', passwordLabel:'パスワード',
    nameLabel:'名前', confirmPasswordLabel:'パスワード確認', or:'または',
    guestFootnote:'ゲストは自由に閲覧できますが、カートに追加したり購入するにはサインインが必要です。',
    removePhoto:'写真を削除',
    settingsTitle:'設定', languageLabel:'言語', currencyLabel:'通貨',
    notifications:'通知', emailNotifs:'メール通知', marketingEmails:'マーケティングメール',
    rememberCart:'カートを記憶する', rgbAnim:'RGBプレビューアニメーション',
    accountSection:'アカウント', newPassword:'新しいパスワード', changePassword:'パスワードを変更',
    deleteAccount:'アカウントを削除', googleManaged:'Googleでサインイン中 — パスワードはGoogleアカウントで管理されています。',
    saveSettings:'設定を保存', clearData:'ローカルデータを消去',
    toastAdded:'カートに追加しました', toastSignedOut:'サインアウトしました', toastNameUpdated:'表示名を更新しました',
    toastPicUpdated:'プロフィール写真を更新しました', toastPicRemoved:'プロフィール写真を削除しました',
    toastSettingsSaved:'設定を保存しました', toastDataCleared:'ローカルデータを消去しました',
    toastPromoNeeded:'先にプロモコードを入力してください',
    toastPickStar:'先に星評価を選んでください', toastReviewSubmitted:'レビューを送信しました — ありがとうございます！',
    writeReview:'レビューを書く', reviewPlaceholder:'このビルドはいかがでしたか？', submitReview:'レビューを送信',
    yourRig:'あなたのPC', noPartsYet:'パーツはまだ選択されていません', yourBuild:'あなたのビルド', notSelected:'未選択',
    addBuildToCart:'ビルドをカートに追加', resetSelections:'選択をリセット', partsSelectedOf:'/', partsSelected:'パーツ選択済み',
    filterAll:'すべて', showingCompatible:'互換性のある項目のみ表示：', compatibleOnly:'',
    advisorTitle:'ビルドアドバイザー', advisorSub:'予算に合わせて何を買うべきか相談',
    advisorAsk:'相談する', advisorFillBtn:'この構成でビルダーを埋める', advisorFilled:'おすすめパーツでビルダーを埋めました',
    aboutPageTitle:'ゲーマーによって造られた', aboutPageDesc:'RedGearは、ガレージで2人の友人とはんだごて、中古GPUの山から始まりました。今では月に数百台のPCを出荷していますが、あの頃のこだわりは失っていません。',
    aboutStoryHeading:'私たちの物語',
    aboutStoryP1:'マーケティングで水増しされた、割高で非力な「ゲーミングPC」にはうんざりしていました。だから、自分たちが買いたいと思う方法でPCを作り始めました。実際の型番、実際のベンチマーク、そして実際にゲームをする技術者。',
    aboutStoryP2:'当社を出荷されるすべてのPCは48時間のバーンインテスト、完全なケーブル整理、使用した全部品を記載したビルドシートを経ています — 驚きも代替品もありません。',
    aboutStatRigs:'出荷台数', aboutStatRating:'平均評価', aboutStatBurnin:'バーンインテスト', aboutStatWarranty:'標準保証',
    aboutValue1Title:'品質第一', aboutValue1Desc:'自分たちのマシンに使いたいと思うパーツだけを扱います — 水増しなし、ブロートウェアなし、近道なし。',
    aboutValue2Title:'誠実な価格', aboutValue2Desc:'透明なビルドシートと隠れた手数料なし — PCの中身と費用を正確に確認できます。',
    aboutValue3Title:'本物のサポート', aboutValue3Desc:'チケットの列ではなく、実際の技術者と話せます。出荷するすべてのPCに責任を持ちます。',
    servicesPageTitle:'私たちの仕事', servicesPageDesc:'カスタムビルドからアップグレード、修理まで — 技術者は一台一台を自分のPCのように扱います。',
    servicesHowTitle:'仕組み',
    servicesStep1Title:'相談', servicesStep1Desc:'予算、用途、必須要件をお聞かせください。最適なパーツを選定します。',
    servicesStep2Title:'組み立て', servicesStep2Desc:'専任の技術者が丁寧なケーブル整理とともに手作業で組み立てます。',
    servicesStep3Title:'テスト', servicesStep3Desc:'すべてのPCは出荷前に48時間のバーンインストレステストを受けます。',
    servicesStep4Title:'発送', servicesStep4Desc:'完全なビルドシートと数年保証とともに、安全に梱包して発送します。',
    servicesCard1Title:'カスタムビルド', servicesCard1Desc:'予算と用途をお聞かせください — あなただけのPCを選定・組立・ストレステストします。',
    servicesCard2Title:'アップグレード', servicesCard2Desc:'GPU、RAM、ストレージ、またはプラットフォーム全体の交換 — 既存システムを的確にアップグレードします。',
    servicesCard3Title:'診断と修理', servicesCard3Desc:'起動ループ、熱の問題、映像の乱れ — 技術者が根本原因を見つけ、迅速に修理します。',
    servicesCard4Title:'ケーブル整理とクリーニング', servicesCard4Desc:'完全分解、埃除去、サーマルペースト塗り直し、性能同様に美しいケーブル整理。',
    servicesCard5Title:'データ移行', servicesCard5Desc:'新しいPCへの乗り換えですか？ドライブを複製し、すべてのファイル、セーブデータ、設定を正確に移行します。',
    servicesCard6Title:'オーバークロックとチューニング', servicesCard6Desc:'CPU、GPU、メモリの安全で安定性テスト済みのオーバークロックで、最後の1フレームまで引き出します。',
    contactPageTitle:'お問い合わせ', contactPageDesc:'ビルド、修理、大口注文についてのご質問は？チームが1営業日以内に返信します。',
    contactSubjectLabel:'件名', contactSubjectOpt1:'カスタムビルドのお問い合わせ', contactSubjectOpt2:'修理・診断', contactSubjectOpt3:'注文サポート', contactSubjectOpt4:'その他',
    contactMessageLabel:'メッセージ', contactMessagePh:'ご要望をお聞かせください...', contactSendBtn:'メッセージを送信',
    contactCallTitle:'お電話', contactCallDesc:'月〜金、午前9時〜午後6時（東部時間）',
    contactEmailTitle:'メール', contactEmailDesc:'24時間以内に返信します',
    contactVisitTitle:'ショップに訪問', contactVisitAddr:'128 Circuit Way, Austin, TX 78701',
    contactToastSuccess:'ありがとうございます！すぐにご連絡します。',
    buildsPageTitle:'完成品PC', buildsPageDesc:'手作業で組み立て、ストレステスト済みで発送準備完了。またはカスタムビルダーでゼロから作成。',
    buildsNoMatch:'その検索に一致するPCはありません。', buildsResultsFor:'検索結果：', buildsFound:'件のPCが見つかりました。',
    builderPageTitle:'自分だけのPCを作る', builderPageDesc:'すべてのパーツを自分で選択。リアルタイム価格、互換性チェック済みの部品、専門家による組み立てでご自宅までお届け。',
  },
};

window.getLanguage = function() {
  try { return (JSON.parse(localStorage.getItem('redgear_settings') || '{}').language) || 'en'; }
  catch (e) { return 'en'; }
};
window.t = function(key) {
  const dict = window.TRANSLATIONS[window.getLanguage()] || window.TRANSLATIONS.en;
  return dict[key] || window.TRANSLATIONS.en[key] || key;
};
window.applyTranslations = function(lang) {
  lang = lang || window.getLanguage();
  const dict = window.TRANSLATIONS[lang] || window.TRANSLATIONS.en;
  const fallback = window.TRANSLATIONS.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] || fallback[key]) el.textContent = dict[key] || fallback[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key] || fallback[key]) el.setAttribute('placeholder', dict[key] || fallback[key]);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    const val = dict[key] || fallback[key];
    if (val) { el.setAttribute('title', val); el.setAttribute('aria-label', val); }
  });
  document.documentElement.setAttribute('lang', lang);
  window.dispatchEvent(new CustomEvent('redgear:languagechange', { detail: { lang } }));
};

/* Smart image loader — tries common filename/extension variants before
   falling back to the styled placeholder. Handles cases like a file saved
   as "name.jpg.png" or "name.png" when the code expects "name.jpg". */
window.smartImg = function(imgEl) {
  const original = imgEl.dataset.src || imgEl.getAttribute('src');
  if (!imgEl.dataset.src) imgEl.dataset.src = original;
  const dot = original.lastIndexOf('.');
  const base = dot > -1 ? original.slice(0, dot) : original;
  const candidates = [
    original,
    original + '.png',
    original + '.jpg',
    base + '.png',
    base + '.jpg',
    base + '.jpeg',
    base + '.webp',
    base + '.PNG',
    base + '.JPG',
  ];
  let idx = 0;
  imgEl.addEventListener('error', function retry() {
    idx++;
    if (idx < candidates.length) {
      imgEl.src = candidates[idx];
    } else {
      imgEl.removeEventListener('error', retry);
      const media = imgEl.closest('.build-card-media');
      if (media) media.classList.add('img-fallback');
    }
  });
  imgEl.src = candidates[0];
};

/* ==========================================================================
   Password hashing — SHA-256 + per-user random salt via the browser's
   built-in Web Crypto API, replacing the previous base64 "obfuscation".
   IMPORTANT HONEST NOTE: this is still a client-only demo account system.
   Hashing in the browser is a real improvement over base64 (the raw
   password is never stored, and rainbow-table attacks are defeated by the
   per-user salt), but because everything — including the verification
   logic — runs in JS the user's own browser controls, there is no secret
   a real attacker can't eventually see or bypass. Genuine account security
   requires a server that owns the database and does the verification,
   which is what backend/ (shipped alongside this site) is for. Treat this
   as "safe for a demo", not "safe for real customer passwords".
   ========================================================================== */
function bufToHex(buf) { return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''); }
function randomSaltHex(len = 16) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return bufToHex(arr.buffer);
}
async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const data = enc.encode(saltHex + ':' + password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bufToHex(digest);
}

document.addEventListener('DOMContentLoaded', () => {

  window.applyTranslations();
  document.querySelectorAll('.js-smart-img:not([src])').forEach(img => window.smartImg(img));

  /* ---------- Cart drawer (injected on every page) ---------- */
  const drawerHTML = `
    <div class="cart-backdrop" id="cartBackdrop"></div>
    <aside class="cart-drawer" id="cartDrawer">
      <div class="cart-drawer-head">
        <h3><span data-i18n="cartTitle">Your Cart</span> <span class="cart-item-count" id="cartItemCount">0 items</span></h3>
        <button class="cart-close" id="cartClose" data-i18n-title="navMenu" aria-label="Close cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="cart-drawer-body" id="cartBody"></div>
      <div class="cart-drawer-foot" id="cartFoot">
        <div class="cart-summary-row"><span data-i18n="subtotal">Subtotal</span><span class="val" id="cartSubtotal">$0</span></div>
        <div class="cart-summary-row"><span data-i18n="cartShipping">Estimated shipping</span><span class="val" id="cartShipping" data-i18n="cartFree">Free</span></div>
        <div class="cart-total-row"><span data-i18n="total">Total</span><span id="cartTotalAmount">$0</span></div>
        <button class="btn btn-primary" id="cartCheckout" style="width:100%;justify-content:center;">
          <span data-i18n="checkout">Checkout</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
        <div class="cart-secure-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span data-i18n="cartSecure">Secure checkout · 30-day returns</span>
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
          <input type="text" id="searchInput" data-i18n-placeholder="searchPh" placeholder="Search builds, parts, GPUs, CPUs…" autocomplete="off">
        </div>
        <div class="search-suggest">
          <span data-i18n="searchTry">Try:</span>
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
        <div class="account-divider"><span data-i18n="or">or</span></div>
        <button class="btn btn-outline" id="guestBtn" style="width:100%;justify-content:center;"><span data-i18n="continueGuest">Continue as Guest</span></button>
        <p class="account-footnote" id="guestFootnote" data-i18n="guestFootnote">Guests can browse freely, but need to sign in to add items to cart or check out.</p>
      </div>
    </div>

    <div class="scroll-progress" id="scrollProgress"></div>
    <button class="back-to-top" id="backToTop" aria-label="Back to top">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
    </button>

    <div class="account-backdrop" id="settingsBackdrop"></div>
    <div class="account-panel settings-panel" id="settingsPanel">
      <div class="account-panel-head">
        <h3 data-i18n="settingsTitle">Settings</h3>
        <button class="cart-close" id="settingsClose" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
      </div>
      <div class="account-panel-body settings-scroll" id="settingsPanelBody">
        <div class="settings-field-row-2col">
          <label class="profile-field-label" data-i18n="languageLabel">Language
            <select id="settingLanguage">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
              <option value="ja">日本語</option>
            </select>
          </label>
          <label class="profile-field-label" data-i18n="currencyLabel">Currency
            <select id="settingCurrency">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
              <option value="MXN">MXN ($)</option>
            </select>
          </label>
        </div>

        <div class="account-divider"><span data-i18n="notifications">notifications</span></div>

        <div class="settings-toggle-row compact">
          <div class="settings-toggle-text">
            <div class="settings-toggle-label" data-i18n="emailNotifs">Email Notifications</div>
          </div>
          <button class="toggle-switch active" id="toggleEmail" role="switch" aria-checked="true"><span class="toggle-knob"></span></button>
        </div>
        <div class="settings-toggle-row compact">
          <div class="settings-toggle-text">
            <div class="settings-toggle-label" data-i18n="marketingEmails">Marketing Emails</div>
          </div>
          <button class="toggle-switch" id="toggleMarketing" role="switch" aria-checked="false"><span class="toggle-knob"></span></button>
        </div>
        <div class="settings-toggle-row compact">
          <div class="settings-toggle-text">
            <div class="settings-toggle-label" data-i18n="rememberCart">Remember My Cart</div>
          </div>
          <button class="toggle-switch active" id="toggleRememberCart" role="switch" aria-checked="true"><span class="toggle-knob"></span></button>
        </div>
        <div class="settings-toggle-row compact">
          <div class="settings-toggle-text">
            <div class="settings-toggle-label" data-i18n="rgbAnim">RGB Preview Animations</div>
          </div>
          <button class="toggle-switch active" id="toggleAnim" role="switch" aria-checked="true"><span class="toggle-knob"></span></button>
        </div>

        <div id="accountManageSection"></div>

        <button class="btn btn-primary" id="saveSettingsBtn" style="width:100%;justify-content:center;margin-top:14px;"><span data-i18n="saveSettings">Save Settings</span></button>
        <button class="btn btn-outline" id="clearDataBtn" style="width:100%;justify-content:center;"><span data-i18n="clearData">Clear Local Data</span></button>
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
    const itemWord = cart.length === 1 ? window.t('cartItem') : window.t('cartItems');
    cartItemCount.textContent = `${cart.length} ${itemWord}`;
    cartFoot.style.display = cart.length ? '' : 'none';

    if (!cart.length) {
      cartBody.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </div>
          <p data-i18n="cartEmpty">Your cart is empty</p>
          <span data-i18n="cartEmptyDesc">Add a prebuilt PC or design your own from scratch</span>
          <a href="builder.html" class="btn btn-primary"><span data-i18n="cartStartBuild">Start a Custom Build</span>
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
              <div class="cart-item-price">${window.formatPrice(Number(item.price))}</div>
              <button class="cart-item-remove" data-remove="${i}" aria-label="Remove">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;}).join('') + `
        <div class="cart-promo">
          <input type="text" data-i18n-placeholder="cartPromoPh" placeholder="Promo code" id="cartPromoInput">
          <button id="cartPromoApply" data-i18n="cartPromoApply">Apply</button>
        </div>
      `;
    }
    const total = cart.reduce((sum, i) => sum + Number(i.price || 0), 0);
    cartSubtotal.textContent = window.formatPrice(total);
    cartTotalAmount.textContent = window.formatPrice(total);
    window.applyTranslations();
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
    settingsBtn.dataset.i18nTitle = 'navSettings';
    settingsBtn.className = 'settings-gear-btn';
    settingsBtn.innerHTML = `
      <svg viewBox="0 0 40 40" fill="none">
        <g class="gear gear-back">
          <path fill="currentColor" d="M18.1 8.58 L19.71 5.2 L24.29 5.2 L25.9 8.58 L25.9 8.58 L29.43 7.33 L32.67 10.57 L31.42 14.1 L31.42 14.1 L34.8 15.71 L34.8 20.29 L31.42 21.9 L31.42 21.9 L32.67 25.43 L29.43 28.67 L25.9 27.42 L25.9 27.42 L24.29 30.8 L19.71 30.8 L18.1 27.42 L18.1 27.42 L14.57 28.67 L11.33 25.43 L12.58 21.9 L12.58 21.9 L9.2 20.29 L9.2 15.71 L12.58 14.1 L12.58 14.1 L11.33 10.57 L14.57 7.33 L18.1 8.58 Z"/>
          <circle cx="22" cy="18" r="4.2" fill="var(--near-black)"/>
        </g>
        <g class="gear gear-small">
          <path fill="currentColor" d="M8.9 23.59 L9.9 21.16 L13.1 21.16 L14.1 23.59 L14.1 23.59 L16.63 22.86 L18.63 25.37 L17.35 27.66 L17.35 27.66 L19.5 29.18 L18.78 32.31 L16.19 32.74 L16.19 32.74 L16.35 35.36 L13.45 36.76 L11.5 35.0 L11.5 35.0 L9.55 36.76 L6.65 35.36 L6.81 32.74 L6.81 32.74 L4.22 32.31 L3.5 29.18 L5.65 27.66 L5.65 27.66 L4.37 25.37 L6.37 22.86 L8.9 23.59 Z"/>
          <circle cx="11.5" cy="29" r="2.6" fill="var(--near-black)"/>
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
    renderAccountManageSection();
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
    document.getElementById('toggleMarketing').classList.toggle('active', !!s.marketing);
    document.getElementById('toggleRememberCart').classList.toggle('active', s.rememberCart !== false);
    document.getElementById('toggleAnim').classList.toggle('active', s.animations !== false);
  }
  document.querySelectorAll('.toggle-switch').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('active'));
  });

  function renderAccountManageSection() {
    const mount = document.getElementById('accountManageSection');
    const auth = getAuth();
    const isLocalAccount = auth && auth.signedIn && !auth.picture; // Google accounts have a picture URL; local ones don't
    if (!auth || !auth.signedIn) {
      mount.innerHTML = '';
      return;
    }
    mount.innerHTML = `
      <div class="account-divider"><span data-i18n="accountSection">account</span></div>
      ${isLocalAccount ? `
        <label class="profile-field-label" data-i18n="newPassword">New Password
          <input type="password" id="newPasswordInput" placeholder="At least 6 characters">
        </label>
        <button class="btn btn-outline" id="changePasswordBtn" style="width:100%;justify-content:center;margin-bottom:10px;" data-i18n="changePassword">Change Password</button>
      ` : `
        <p class="account-footnote" style="margin-bottom:10px;" data-i18n="googleManaged">Signed in with Google — password is managed by your Google account.</p>
      `}
      <button class="btn btn-outline" id="deleteAccountBtn" style="width:100%;justify-content:center;color:var(--red-bright);border-color:var(--red-dark);" data-i18n="deleteAccount">Delete Account</button>
    `;
    window.applyTranslations();
    if (isLocalAccount) {
      document.getElementById('changePasswordBtn').addEventListener('click', async () => {
        const pw = document.getElementById('newPasswordInput').value;
        if (!pw || pw.length < 6) { showToast('Password must be at least 6 characters'); return; }
        const result = await window.RedGearLocalAuth.changePassword(auth.email, pw);
        showToast(result.ok ? 'Password updated' : result.error);
      });
    }
    document.getElementById('deleteAccountBtn').addEventListener('click', () => {
      if (!confirm('Delete your account? This cannot be undone.')) return;
      if (isLocalAccount) window.RedGearLocalAuth.deleteAccount(auth.email);
      clearAuth();
      closeSettings();
      if (window.updateAccountUIExternal) window.updateAccountUIExternal();
      showToast('Account deleted');
    });
  }

  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    const settings = {
      language: document.getElementById('settingLanguage').value,
      currency: document.getElementById('settingCurrency').value,
      emailNotifs: document.getElementById('toggleEmail').classList.contains('active'),
      marketing: document.getElementById('toggleMarketing').classList.contains('active'),
      rememberCart: document.getElementById('toggleRememberCart').classList.contains('active'),
      animations: document.getElementById('toggleAnim').classList.contains('active'),
    };
    localStorage.setItem('redgear_settings', JSON.stringify(settings));
    document.body.classList.toggle('anims-off', !settings.animations);
    if (!settings.rememberCart) { window.RedGearCart.clear(); }
    window.applyTranslations(settings.language);
    window.dispatchEvent(new CustomEvent('redgear:settingschange', { detail: settings }));
    closeSettings();
    showToast(window.t('toastSettingsSaved'));
  });
  document.getElementById('clearDataBtn').addEventListener('click', () => {
    localStorage.removeItem('redgear_cart');
    localStorage.removeItem('redgear_reviews');
    const lang = getSettings().language; // keep language choice even after clearing
    localStorage.removeItem('redgear_settings');
    if (lang) localStorage.setItem('redgear_settings', JSON.stringify({ language: lang }));
    setCartCount();
    closeSettings();
    showToast(window.t('toastDataCleared'));
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
        showToast(window.t('toastPromoNeeded'));
      }
    }
  });

  document.getElementById('cartCheckout').addEventListener('click', () => {
    const cart = window.RedGearCart.get();
    if (!cart.length) return;
    if (!(window.RedGearAuth && window.RedGearAuth.isSignedIn())) {
      closeCart();
      window.openAccount('Sign in with Google to complete checkout.');
      return;
    }
    const auth = window.RedGearAuth.get();
    const itemNames = cart.map(i => i.name);
    window.RedGearOrders.recordPurchase(auth.email, itemNames);
    window.RedGearCart.clear();
    closeCart();
    showToast(`Order placed! You can now review: ${itemNames.join(', ')}`);
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

  /* ---------- Local email/password accounts ---------- */
  /* NOTE: front-end-only demo account system. Passwords are now hashed
     with SHA-256 + a per-user random salt (see hashPassword() above)
     rather than base64 "obfuscation" — a real improvement, but still not
     a substitute for server-side auth. See backend/ for the real fix. */
  function getUsers() {
    try { return JSON.parse(localStorage.getItem('redgear_users') || '[]'); }
    catch (e) { return []; }
  }
  function saveUsers(list) { localStorage.setItem('redgear_users', JSON.stringify(list)); }
  function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  window.RedGearLocalAuth = {
    async createAccount(name, email, password) {
      name = (name || '').trim();
      email = (email || '').trim();
      if (!name) return { ok: false, error: 'Enter your name.' };
      if (!isValidEmail(email)) return { ok: false, error: 'Enter a valid email address.' };
      if (!password || password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
      const users = getUsers();
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, error: 'An account with this email already exists.' };
      }
      const salt = randomSaltHex();
      const hash = await hashPassword(password, salt);
      users.push({ name, email, salt, hash, createdAt: new Date().toISOString() });
      saveUsers(users);
      return { ok: true, user: { name, email } };
    },
    async login(email, password) {
      email = (email || '').trim();
      if (!isValidEmail(email)) return { ok: false, error: 'Enter a valid email address.' };
      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) return { ok: false, error: 'No account found with that email.' };
      const candidateHash = await hashPassword(password || '', user.salt);
      if (candidateHash !== user.hash) return { ok: false, error: 'Incorrect password.' };
      return { ok: true, user: { name: user.name, email: user.email } };
    },
    async changePassword(email, newPassword) {
      if (!newPassword || newPassword.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) return { ok: false, error: 'Account not found.' };
      const salt = randomSaltHex();
      user.salt = salt;
      user.hash = await hashPassword(newPassword, salt);
      saveUsers(users);
      return { ok: true };
    },
    deleteAccount(email) {
      const users = getUsers().filter(u => u.email.toLowerCase() !== email.toLowerCase());
      saveUsers(users);
      return { ok: true };
    }
  };

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
      title.textContent = window.t('myProfile');
      const displayName = auth.displayName || auth.name;
      const customPic = auth.customPicture || auth.picture || '';
      const initials = displayName.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
      const myReviews = (window.RedGearReviews ? window.RedGearReviews.forUser(auth.email) : []);
      body.innerHTML = `
        <div class="account-profile account-profile-editable">
          <div class="avatar-upload-wrap" id="avatarUploadWrap">
            ${customPic
              ? `<img src="${customPic}" alt="${displayName}" class="avatar-img" id="avatarImg">`
              : `<div class="avatar-initials" id="avatarImg">${initials}</div>`}
            <div class="avatar-upload-overlay">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <input type="file" id="avatarFileInput" accept="image/*" style="display:none;">
          </div>
          <div><div class="account-profile-name">${displayName}</div><div class="account-profile-email">${auth.email}</div></div>
        </div>
        ${customPic ? `<button class="avatar-remove-btn" id="removeAvatarBtn">${window.t('removePhoto')}</button>` : ''}

        <label class="profile-field-label" data-i18n="displayName">Display Name
          <input type="text" id="displayNameInput" value="${displayName}" maxlength="40">
        </label>
        <button class="btn btn-outline" id="saveNameBtn" style="width:100%;justify-content:center;margin-bottom:6px;" data-i18n="saveName">Save Name</button>

        <div class="account-divider"><span data-i18n="myReviews">my reviews</span></div>
        <div id="myReviewsList">
          ${myReviews.length ? myReviews.map((r, i) => `
            <div class="my-review-item">
              <div class="my-review-head">
                <span class="my-review-build">${r.build}</span>
                ${window.renderStars(r.rating, 11)}
              </div>
              ${r.comment ? `<div class="my-review-comment">"${r.comment}"</div>` : ''}
              <div class="my-review-date">${new Date(r.date).toLocaleDateString()}</div>
              <a href="#" class="my-review-remove" data-remove-review="${r.date}">${window.t('removeLink')}</a>
            </div>
          `).join('') : `<p class="account-footnote">${window.t('noReviews')}</p>`}
        </div>

        <div class="account-divider"><span data-i18n="or">or</span></div>
        <button class="btn btn-outline" id="signOutBtn" style="width:100%;justify-content:center;" data-i18n="signOut">Sign Out</button>
      `;
      window.applyTranslations();
      document.getElementById('signOutBtn').addEventListener('click', () => {
        clearAuth();
        updateAccountUI();
        showToast(window.t('toastSignedOut'));
      });
      document.getElementById('saveNameBtn').addEventListener('click', () => {
        const val = document.getElementById('displayNameInput').value.trim();
        if (!val) { showToast('Name cannot be empty'); return; }
        const a = getAuth();
        a.displayName = val;
        setAuth(a);
        updateAccountUI();
        showToast(window.t('toastNameUpdated'));
      });

      /* Profile picture upload */
      const avatarWrap = document.getElementById('avatarUploadWrap');
      const avatarFileInput = document.getElementById('avatarFileInput');
      avatarWrap.addEventListener('click', () => avatarFileInput.click());
      avatarFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { showToast('Please choose an image file'); return; }
        if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
          const a = getAuth();
          a.customPicture = ev.target.result;
          setAuth(a);
          updateAccountUI();
          showToast(window.t('toastPicUpdated'));
        };
        reader.readAsDataURL(file);
      });
      const removeAvatarBtn = document.getElementById('removeAvatarBtn');
      if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', () => {
          const a = getAuth();
          delete a.customPicture;
          setAuth(a);
          updateAccountUI();
          showToast(window.t('toastPicRemoved'));
        });
      }

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
      title.textContent = window.t('signIn');
      body.innerHTML = `
        <p class="account-gate-msg" id="accountGateMsg" style="display:none;"></p>

        <div class="auth-tabs">
          <button class="auth-tab active" id="tabSignIn" type="button" data-i18n="signInTab">Sign In</button>
          <button class="auth-tab" id="tabCreate" type="button" data-i18n="createTab">Create Account</button>
        </div>

        <form class="auth-form" id="signInForm">
          <label class="profile-field-label" data-i18n="emailLabel">Email
            <input type="email" id="siEmail" placeholder="you@example.com" autocomplete="email">
          </label>
          <label class="profile-field-label" data-i18n="passwordLabel">Password
            <input type="password" id="siPassword" placeholder="••••••••" autocomplete="current-password">
          </label>
          <p class="auth-error" id="signInError" style="display:none;"></p>
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;" data-i18n="signIn">Sign In</button>
        </form>

        <form class="auth-form" id="createForm" style="display:none;">
          <label class="profile-field-label" data-i18n="nameLabel">Name
            <input type="text" id="caName" placeholder="Jane Doe" autocomplete="name">
          </label>
          <label class="profile-field-label" data-i18n="emailLabel">Email
            <input type="email" id="caEmail" placeholder="you@example.com" autocomplete="email">
          </label>
          <label class="profile-field-label" data-i18n="passwordLabel">Password
            <input type="password" id="caPassword" placeholder="At least 6 characters" autocomplete="new-password">
          </label>
          <label class="profile-field-label" data-i18n="confirmPasswordLabel">Confirm Password
            <input type="password" id="caPassword2" placeholder="••••••••" autocomplete="new-password">
          </label>
          <p class="auth-error" id="createError" style="display:none;"></p>
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;" data-i18n="createTab">Create Account</button>
        </form>

        <div class="account-divider"><span data-i18n="or">or</span></div>
        <div id="googleSignInBtn" class="google-btn-mount"></div>
        <div class="account-divider"><span data-i18n="or">or</span></div>
        <button class="btn btn-outline" id="guestBtn" style="width:100%;justify-content:center;"><span data-i18n="continueGuest">Continue as Guest</span></button>
        <p class="account-footnote" id="guestFootnote" data-i18n="guestFootnote">Guests can browse freely, but need to sign in to add items to cart or check out.</p>
      `;
      window.applyTranslations();

      const tabSignIn = document.getElementById('tabSignIn');
      const tabCreate = document.getElementById('tabCreate');
      const signInForm = document.getElementById('signInForm');
      const createForm = document.getElementById('createForm');
      tabSignIn.addEventListener('click', () => {
        tabSignIn.classList.add('active'); tabCreate.classList.remove('active');
        signInForm.style.display = ''; createForm.style.display = 'none';
      });
      tabCreate.addEventListener('click', () => {
        tabCreate.classList.add('active'); tabSignIn.classList.remove('active');
        createForm.style.display = ''; signInForm.style.display = 'none';
      });

      signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('signInError');
        const result = await window.RedGearLocalAuth.login(
          document.getElementById('siEmail').value,
          document.getElementById('siPassword').value
        );
        if (!result.ok) { errEl.textContent = result.error; errEl.style.display = 'block'; return; }
        setAuth({ signedIn: true, guest: false, name: result.user.name, email: result.user.email, picture: '' });
        updateAccountUI();
        closeAccount();
        showToast(`Welcome back, ${result.user.name.split(' ')[0]}!`);
      });

      createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('createError');
        const pw = document.getElementById('caPassword').value;
        const pw2 = document.getElementById('caPassword2').value;
        if (pw !== pw2) { errEl.textContent = 'Passwords do not match.'; errEl.style.display = 'block'; return; }
        const result = await window.RedGearLocalAuth.createAccount(
          document.getElementById('caName').value,
          document.getElementById('caEmail').value,
          pw
        );
        if (!result.ok) { errEl.textContent = result.error; errEl.style.display = 'block'; return; }
        setAuth({ signedIn: true, guest: false, name: result.user.name, email: result.user.email, picture: '' });
        updateAccountUI();
        closeAccount();
        showToast(`Account created — welcome, ${result.user.name.split(' ')[0]}!`);
      });

      document.getElementById('guestBtn').addEventListener('click', () => {
        setAuth({ signedIn: false, guest: true });
        closeAccount();
        showToast('Browsing as guest — sign in anytime to shop');
      });
      renderGoogleButton();
    }
    window.applyTranslations();
  }
  window.updateAccountUIExternal = updateAccountUI;

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
          <div><div class="mega-item-title" data-i18n="catGamingTitle">Gaming PCs</div><div class="mega-item-sub" data-i18n="catGamingDesc">Dominate every game</div></div>
        </a>
        <a href="builds.html?cat=creator" class="mega-item">
          <div class="mega-icon" style="color:#4d9aff;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg></div>
          <div><div class="mega-item-title" data-i18n="catCreatorTitle">Creator PCs</div><div class="mega-item-sub" data-i18n="catCreatorDesc">Power your creativity</div></div>
        </a>
        <a href="builds.html?cat=office" class="mega-item">
          <div class="mega-icon" style="color:#9a9aa1;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
          <div><div class="mega-item-title" data-i18n="catOfficeTitle">Office PCs</div><div class="mega-item-sub" data-i18n="catOfficeDesc">Reliable & efficient</div></div>
        </a>
        <a href="builder.html" class="mega-item mega-item-cta">
          <div class="mega-icon" style="color:#ff2530;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg></div>
          <div><div class="mega-item-title" data-i18n="customBuild">Build Your Own</div><div class="mega-item-sub" data-i18n="catCustomDesc">Pick every part yourself</div></div>
        </a>
      </div>
    `);
    window.applyTranslations();
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
  window.addEventListener('redgear:settingschange', () => renderCartDrawer());

  /* ---------- Orders / purchase history ---------- */
  function getOrders() {
    try { return JSON.parse(localStorage.getItem('redgear_orders') || '[]'); }
    catch (e) { return []; }
  }
  function saveOrders(list) { localStorage.setItem('redgear_orders', JSON.stringify(list)); }

  window.RedGearOrders = {
    getAll: getOrders,
    forUser(email) { return getOrders().filter(o => o.userEmail === email); },
    hasPurchased(email, buildName) {
      return getOrders().some(o => o.userEmail === email && o.items.includes(buildName));
    },
    recordPurchase(email, itemNames) {
      const list = getOrders();
      list.unshift({ userEmail: email, items: itemNames, date: new Date().toISOString() });
      saveOrders(list);
    }
  };

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
    canReview(build) {
      if (!(window.RedGearAuth && window.RedGearAuth.isSignedIn())) return { ok: false, reason: 'signin' };
      const auth = window.RedGearAuth.get();
      if (!window.RedGearOrders.hasPurchased(auth.email, build)) return { ok: false, reason: 'unpurchased' };
      return { ok: true };
    },
    add(build, rating, comment) {
      if (!(window.RedGearAuth && window.RedGearAuth.isSignedIn())) {
        window.openAccount && window.openAccount('Sign in with Google to write a review.');
        return false;
      }
      const auth = window.RedGearAuth.get();
      if (!window.RedGearOrders.hasPurchased(auth.email, build)) {
        showToast(`Only verified buyers can review "${build}" — purchase it first`);
        return false;
      }
      const list = getReviews();
      list.unshift({
        build, rating, comment,
        userEmail: auth.email,
        userName: auth.displayName || auth.name,
        date: new Date().toISOString(),
        verified: true
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
        <h3 data-i18n="writeReview">Write a Review</h3>
        <button class="cart-close" id="reviewClose" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
      </div>
      <div class="account-panel-body">
        <p class="review-target-name" id="reviewTargetName"></p>
        <div class="star-picker" id="starPicker">
          ${[1,2,3,4,5].map(n => `<button type="button" class="star-pick-btn" data-star="${n}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg></button>`).join('')}
        </div>
        <textarea id="reviewComment" data-i18n-placeholder="reviewPlaceholder" placeholder="What did you think of this build?" rows="4"></textarea>
        <button class="btn btn-primary" id="reviewSubmit" style="width:100%;justify-content:center;" data-i18n="submitReview">Submit Review</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', reviewModalHTML);
  window.applyTranslations();
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
    if (!currentStarValue) { showToast(window.t('toastPickStar')); return; }
    const check = window.RedGearReviews.canReview(currentReviewTarget);
    if (!check.ok) {
      closeReviewModal();
      if (check.reason === 'signin') {
        window.openAccount('Sign in with Google to write a review.');
      } else {
        showToast(`Only verified buyers can review "${currentReviewTarget}" — purchase it first`);
      }
      return;
    }
    const comment = document.getElementById('reviewComment').value.trim();
    const ok = window.RedGearReviews.add(currentReviewTarget, currentStarValue, comment);
    if (ok) {
      closeReviewModal();
      showToast(window.t('toastReviewSubmitted'));
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
      if (added) showToast(`${btn.dataset.addCart} ${window.t('toastAdded')}`);
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
