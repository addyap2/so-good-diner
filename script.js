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

// Default to the visitor's browser language (EN if it's English, otherwise FR).
// A visitor's own switch is remembered and takes precedence.
function browserLang() {
  const langs = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || navigator.userLanguage || 'fr'];
  return langs.some((l) => String(l).toLowerCase().startsWith('en')) ? 'en' : 'fr';
}

let initial = browserLang();
try {
  const saved = localStorage.getItem('sgd-lang');
  if (saved === 'en' || saved === 'fr') initial = saved;
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
  toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Menu');
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

// ===== Hero: cursor light + parallax, magnetic CTA, scroll push-in =====
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const media = hero.querySelector('.hero-media');
  const inner = hero.querySelector('.hero-inner');
  const magnet = hero.querySelector('[data-magnetic]');

  // Hero footage: loop ONLY the segment where the camera has reached the
  // "So Good Diner" storefront sign (the rest of the clip renders poorly).
  // The sign sits at the top of the portrait frame (crop biased up in CSS).
  const heroVideo = hero.querySelector('.hero-video');
  if (heroVideo) {
    const SIGN_START = 15.8;  // camera has arrived at the sign (clean framing)
    const SIGN_END   = 16.95; // before the owner's head crops into frame
    const SIGN_RATE  = 0.4;   // slow, cinematic drift across the sign
    const MAX_PASSES = 3;     // play the sign loop 3 times, then hold on it

    let passes = 0;
    const clampToSign = () => {
      if (!heroVideo.duration) return;
      if (heroVideo.playbackRate !== SIGN_RATE) heroVideo.playbackRate = SIGN_RATE;
      const t = heroVideo.currentTime;
      if (t >= SIGN_END) {
        passes += 1;
        if (passes < MAX_PASSES) {
          try { heroVideo.currentTime = SIGN_START; } catch (e) {}
        } else {
          heroVideo.pause();  // freeze on the sign after the 3rd pass
        }
      } else if (t < SIGN_START - 0.05) {
        try { heroVideo.currentTime = SIGN_START; } catch (e) {}  // pre-window, not a pass
      }
    };

    const enterSign = () => {
      heroVideo.playbackRate = SIGN_RATE;
      if (heroVideo.duration) { try { heroVideo.currentTime = SIGN_START; } catch (e) {} }
    };
    if (heroVideo.readyState >= 1) enterSign();
    else heroVideo.addEventListener('loadedmetadata', enterSign, { once: true });

    heroVideo.addEventListener('timeupdate', clampToSign);
  }

  // Cursor-tracked key light + subtle parallax (desktop, motion-OK only).
  // media uses the individual `translate` property; scroll owns `scale` — they never clash.
  if (finePointer && !reduce) {
    let px = 0.72, py = 0.22, raf = 0;
    const apply = () => {
      raf = 0;
      hero.style.setProperty('--mx', (px * 100).toFixed(2) + '%');
      hero.style.setProperty('--my', (py * 100).toFixed(2) + '%');
      const dx = px - 0.5, dy = py - 0.5;
      if (media) media.style.translate = `${(-dx * 16).toFixed(2)}px ${(-dy * 16).toFixed(2)}px`;
    };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width;
      py = (e.clientY - r.top) / r.height;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    hero.addEventListener('pointerleave', () => { if (media) media.style.translate = '0 0'; });

    // Magnetic primary CTA
    if (magnet) {
      const strength = 0.35;
      magnet.addEventListener('pointermove', (e) => {
        const r = magnet.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        magnet.style.transform = `translate(${(mx * strength).toFixed(1)}px, ${(my * strength).toFixed(1)}px)`;
      });
      magnet.addEventListener('pointerleave', () => { magnet.style.transform = ''; });
    }
  }

  // Scroll: cinematic push-in + copy drift (individual scale/translate, rAF-throttled)
  if (!reduce) {
    let sraf = 0;
    const onHeroScroll = () => {
      sraf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
      if (media) media.style.scale = (1.06 + p * 0.12).toFixed(3);
      if (inner) {
        inner.style.translate = `0 ${(p * -60).toFixed(1)}px`;
        inner.style.opacity = (1 - p * 0.9).toFixed(2);
      }
    };
    onHeroScroll();
    window.addEventListener('scroll', () => { if (!sraf) sraf = requestAnimationFrame(onHeroScroll); }, { passive: true });
  }
})();

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
