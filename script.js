// ===== i18n (FR / EN) =====
const i18nEls = Array.from(document.querySelectorAll('[data-en]'));
// Cache the original French markup as the "fr" version.
i18nEls.forEach((el) => { el.dataset.fr = el.innerHTML; });

const fillYear = () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
};

const langButtons = Array.from(document.querySelectorAll('.lang-switch button'));

function setLang(lang) {
  const l = lang === 'en' ? 'en' : 'fr';
  i18nEls.forEach((el) => {
    const val = el.dataset[l];
    if (val != null) el.innerHTML = val;
  });
  document.documentElement.lang = l;
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

// Initial language: saved choice, else browser preference, else French.
let initial = 'fr';
try {
  const saved = localStorage.getItem('sgd-lang');
  if (saved === 'en' || saved === 'fr') initial = saved;
  else if ((navigator.language || '').toLowerCase().startsWith('en')) initial = 'en';
} catch (e) {}
setLang(initial);

// ===== Header background on scroll =====
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ===== Mobile nav toggle =====
const toggle = document.querySelector('.nav-toggle');
toggle.addEventListener('click', () => {
  const open = header.classList.toggle('nav-open');
  toggle.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav a').forEach((a) =>
  a.addEventListener('click', () => header.classList.remove('nav-open'))
);

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
