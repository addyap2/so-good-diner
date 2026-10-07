// ===== i18n (FR / EN / IT / ES) =====
const supportedLanguages = ['fr', 'en', 'it', 'es'];
const i18nEls = Array.from(document.querySelectorAll('[data-en]'));
// Cache the original French markup as the "fr" version.
i18nEls.forEach((el) => { el.dataset.fr = el.innerHTML; });

const fillYear = () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
};

const langButtons = Array.from(document.querySelectorAll('.lang-switch button'));

function setLang(lang) {
  const l = supportedLanguages.includes(lang) ? lang : 'fr';
  i18nEls.forEach((el) => {
    const val = el.dataset[l];
    if (val != null) el.innerHTML = val;
  });
  document.documentElement.lang = l;
  const labels = {
    fr: { navigation: 'Navigation', footer: 'Pied de page', language: 'Langue', open: 'Ouvrir le menu', close: 'Fermer le menu', scroll: 'Défiler vers le contenu' },
    en: { navigation: 'Navigation', footer: 'Footer', language: 'Language', open: 'Open menu', close: 'Close menu', scroll: 'Scroll to content' },
    it: { navigation: 'Navigazione', footer: 'Piè di pagina', language: 'Lingua', open: 'Apri il menu', close: 'Chiudi il menu', scroll: 'Scorri al contenuto' },
    es: { navigation: 'Navegación', footer: 'Pie de página', language: 'Idioma', open: 'Abrir menú', close: 'Cerrar menú', scroll: 'Desplazar al contenido' }
  }[l];
  document.querySelector('.nav')?.setAttribute('aria-label', labels.navigation);
  document.querySelector('.footer-nav')?.setAttribute('aria-label', labels.footer);
  document.querySelector('.lang-switch')?.setAttribute('aria-label', labels.language);
  const menuToggle = document.querySelector('.nav-toggle');
  menuToggle?.setAttribute('aria-label', menuToggle.getAttribute('aria-expanded') === 'true' ? labels.close : labels.open);
  document.querySelector('.hero-scroll')?.setAttribute('aria-label', labels.scroll);
  const categories = { fr: 'Catégories', en: 'Categories', it: 'Categorie', es: 'Categorías' };
  document.querySelector('.menu-filters')?.setAttribute('aria-label', categories[l]);
  const titles = {
    fr: 'So Good Diner — Burgers, Kumpir & Snacking à Fréjus',
    en: 'So Good Diner — Burgers, Kumpir & Snacks in Fréjus',
    it: 'So Good Diner — Burger, Kumpir e Spuntini a Fréjus',
    es: 'So Good Diner — Hamburguesas, Kumpir y Aperitivos en Fréjus'
  };
  document.title = titles[l];
  const storefront = {
    fr: 'Devanture du So Good Diner', en: 'So Good Diner storefront',
    it: 'Facciata del So Good Diner', es: 'Fachada de So Good Diner'
  };
  document.querySelector('.contact-photo img')?.setAttribute('alt', storefront[l] + ' — 65 Rue du Général de Gaulle, Fréjus');
  langButtons.forEach((b) => {
    const active = b.dataset.lang === l;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  try { localStorage.setItem('sgd-lang', l); } catch (e) {}
  fillYear();
}

langButtons.forEach((b) =>
  b.addEventListener('click', () => setLang(b.dataset.lang))
);

// Use the first supported browser language, with French as the fallback.
// A visitor's own switch is remembered and takes precedence.
function browserLang() {
  const langs = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || navigator.userLanguage || 'fr'];
  return langs.map((l) => String(l).toLowerCase().split('-')[0])
    .find((l) => supportedLanguages.includes(l)) || 'fr';
}

let initial = browserLang();
try {
  const saved = localStorage.getItem('sgd-lang');
  if (supportedLanguages.includes(saved)) initial = saved;
} catch (e) {}
setLang(initial);

// ===== Header background on scroll =====
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ===== Mobile nav toggle =====
const toggle = document.querySelector('.nav-toggle');
const setMenu = (open) => {
  header.classList.toggle('nav-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  const labels = { fr: ['Ouvrir le menu', 'Fermer le menu'], en: ['Open menu', 'Close menu'], it: ['Apri il menu', 'Chiudi il menu'], es: ['Abrir menú', 'Cerrar menú'] };
  toggle.setAttribute('aria-label', labels[document.documentElement.lang][open ? 1 : 0]);
  document.body.style.overflow = open ? 'hidden' : '';
};
toggle.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
document.querySelectorAll('.nav a').forEach((a) =>
  a.addEventListener('click', () => setMenu(false))
);
// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && header.classList.contains('nav-open')) setMenu(false);
});

// ===== Menu category filters =====
const chips = document.querySelectorAll('.chip');
const groups = document.querySelectorAll('.menu-group');
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    const filter = chip.dataset.filter;
    groups.forEach((g) => {
      g.classList.toggle('is-hidden', filter !== 'all' && g.dataset.cat !== filter);
    });
  });
});

// ===== Gallery videos: autoplay when in view, pause when out =====
const galleryVideos = Array.from(document.querySelectorAll('.gallery-grid video'));
if (galleryVideos.length && 'IntersectionObserver' in window) {
  const playObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          v.pause();
        }
      });
    },
    { threshold: 0.25 }
  );
  galleryVideos.forEach((v) => playObserver.observe(v));
}

// ===== Reveal on scroll =====
const revealEls = document.querySelectorAll(
  '.quality-card, .menu-group, .review, .gallery-grid video, .contact-info, .contact-map'
);
revealEls.forEach((el) => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
  );
  revealEls.forEach((el) => io.observe(el));

  // Safety net: never leave content hidden if the observer misses
  // (e.g. landing directly on a #hash anchor or very tall viewports).
  window.setTimeout(() => {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }, 1400);
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}
