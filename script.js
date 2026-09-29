// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Header background on scroll
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
toggle.addEventListener('click', () => {
  const open = header.classList.toggle('nav-open');
  toggle.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav a').forEach((a) =>
  a.addEventListener('click', () => header.classList.remove('nav-open'))
);

// Menu category filters
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

// Reveal on scroll
const revealEls = document.querySelectorAll(
  '.quality-card, .menu-group, .review, .gallery-grid video, .contact-info, .contact-map, .menu-cards'
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
