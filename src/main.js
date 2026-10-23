import './style.css';
import './pages.css';

// Where "Map my expansion" submissions go. By default they are posted to
// Netlify Forms (the form is marked data-netlify in partials/contact-form.html).
// Set VITE_FORM_ENDPOINT to another form service URL to post JSON there instead.
const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || '';

// Mobile navigation
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('nav-menu');

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
}

toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

// Pinned navigation picks up a solid background once the page scrolls
const navbar = document.querySelector('.navbar');
const updateNavbar = () => navbar.classList.toggle('is-scrolled', window.scrollY > 24);
updateNavbar();
window.addEventListener('scroll', updateNavbar, { passive: true });

// Map: SVG paints in document order, so move the hovered state to the end of
// its group to keep it on top of its neighbours while it pops out.
const mapStates = document.querySelector('.map-states');
mapStates?.addEventListener('pointerover', (event) => {
  const state = event.target.closest('.map-state');
  if (state && state !== mapStates.lastElementChild) mapStates.append(state);
});

// Process carousel. On wide, tall-enough screens the section pins in place and
// vertical scrolling slides the cards sideways; elsewhere the track scrolls
// natively (touch, trackpad, keyboard). The arrows step one card either way,
// and whichever card is in view is marked active so its contents animate in.
const processSection = document.querySelector('.process');
const processTrack = document.getElementById('process-track');

if (processSection && processTrack) {
  const cards = [...processTrack.children];
  const [prevButton, nextButton] = processSection.querySelectorAll('.process__btn');
  const progressBar = processSection.querySelector('.process__progress');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pinned = false;
  let distance = 0;
  let active = -1;

  const setActive = (index) => {
    if (index === active) return;
    active = index;
    cards.forEach((card, i) => card.classList.toggle('is-active', i === index));
    prevButton.disabled = index === 0;
    nextButton.disabled = index === cards.length - 1;
  };

  // How far the track must travel for the last card to sit at the right gutter
  const measure = () => {
    processTrack.style.transform = '';
    const last = cards[cards.length - 1];
    const inset = parseFloat(getComputedStyle(processTrack).paddingRight);
    return Math.max(0, last.offsetLeft + last.offsetWidth + inset - processTrack.clientWidth);
  };

  const pinnedProgress = () => {
    const travelled = -processSection.getBoundingClientRect().top;
    return distance ? Math.min(1, Math.max(0, travelled / distance)) : 0;
  };

  const update = () => {
    if (pinned) {
      const progress = pinnedProgress();
      processTrack.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;
      progressBar.style.setProperty('--progress', progress.toFixed(4));
      setActive(Math.round(progress * (cards.length - 1)));
    } else {
      const max = processTrack.scrollWidth - processTrack.clientWidth;
      setActive(max > 0 ? Math.round((processTrack.scrollLeft / max) * (cards.length - 1)) : 0);
    }
  };

  const layout = () => {
    const wantPinned =
      !reducedMotion.matches && window.innerWidth > 1100 && window.innerHeight >= 760;
    pinned = wantPinned;
    processSection.classList.toggle('is-pinned', pinned);
    processSection.style.height = '';
    if (pinned) {
      distance = measure();
      processSection.style.height = `calc(100vh - 74px + ${distance}px)`;
    } else {
      processTrack.style.transform = '';
    }
    update();
  };

  const go = (dir) => {
    const target = Math.min(cards.length - 1, Math.max(0, active + dir));
    if (pinned) {
      const top = window.scrollY + processSection.getBoundingClientRect().top;
      window.scrollTo({ top: top + (distance * target) / (cards.length - 1), behavior: 'smooth' });
    } else {
      const inset = parseFloat(getComputedStyle(processTrack).paddingLeft);
      processTrack.scrollTo({ left: cards[target].offsetLeft - inset, behavior: 'smooth' });
    }
  };

  prevButton.addEventListener('click', () => go(-1));
  nextButton.addEventListener('click', () => go(1));
  processTrack.addEventListener('scroll', update, { passive: true });
  window.addEventListener('scroll', () => pinned && update(), { passive: true });
  window.addEventListener('resize', layout);
  layout();
}

// Scroll reveal: sections fade up as they enter the viewport, list items in a
// short stagger. Skipped entirely for visitors who prefer reduced motion.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const singles = document.querySelectorAll(
    'main .split-head, main .kicker, main h2, .whatwedo__intro, .problem__intro, .problem__stat, ' +
      '.problem__list, .process__intro, .band__strip, .network__copy, .network__badge, .network__map, ' +
      '.network__statement, .how__row > *, .mapform__head, .mapform__form, .closing__left, .closing__right, ' +
      '.team__notes, .svc__body, .profile, .guide__lead, .note, .office > *, [data-reveal]',
  );
  const groups = document.querySelectorAll(
    '.brands__row, .stages, .sides__cards, .service-list, .stats, .team__grid, .legend, .ways, ' +
      '.jump__row, .profiles__tabs, .why__grid, .link-cards, .contact-ways, .faq, .svc__list, [data-reveal-group]',
  );

  const targets = new Set(singles);
  for (const group of groups) {
    [...group.children].forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 90}ms`);
      targets.add(item);
    });
  }
  // Animate the outermost element only, so nested targets don't double up
  const outermost = [...targets].filter((el) => {
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
      if (targets.has(parent)) return false;
    }
    return true;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  for (const el of outermost) {
    el.classList.add('reveal');
    observer.observe(el);
  }
}

if (!prefersReducedMotion) document.documentElement.classList.add('motion');

// Profile tabs (For Franchisors / For Franchisees). Arrow keys move between
// tabs, and a link to a panel's id (franchisors.html#international) opens it.
for (const tabs of document.querySelectorAll('[data-tabs]')) {
  const buttons = [...tabs.querySelectorAll('[role="tab"]')];

  const select = (button, { focus = false, animate = true } = {}) => {
    for (const other of buttons) {
      const selected = other === button;
      other.setAttribute('aria-selected', String(selected));
      other.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(other.getAttribute('aria-controls'));
      panel.hidden = !selected;
      panel.classList.remove('is-entering');
      if (selected && animate) {
        void panel.offsetWidth;
        panel.classList.add('is-entering', 'is-visible');
      }
    }
    if (focus) button.focus();
  };

  tabs.addEventListener('click', (event) => {
    const button = event.target.closest('[role="tab"]');
    if (button) select(button);
  });

  tabs.addEventListener('keydown', (event) => {
    const index = buttons.indexOf(event.target);
    if (index < 0) return;
    const moves = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next = null;
    if (event.key in moves) next = buttons[(index + moves[event.key] + buttons.length) % buttons.length];
    if (event.key === 'Home') next = buttons[0];
    if (event.key === 'End') next = buttons[buttons.length - 1];
    if (!next) return;
    event.preventDefault();
    select(next, { focus: true });
  });

  const openFromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const button = buttons.find((b) => b.getAttribute('aria-controls') === id);
    if (!button) return;
    select(button, { animate: false });
    tabs.scrollIntoView({ block: 'start' });
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
}

// Field guide contents: highlight the guide currently on screen
const tocLinks = [...document.querySelectorAll('.toc a')];
if (tocLinks.length && 'IntersectionObserver' in window) {
  const tocObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of tocLinks) {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
        }
      }
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  for (const link of tocLinks) {
    const guide = document.querySelector(link.getAttribute('href'));
    if (guide) tocObserver.observe(guide);
  }
}

// "Map your expansion" form
const form = document.getElementById('expansion-form');
if (form) setUpForm(form);

function setUpForm(form) {
  const status = form.querySelector('.mapform__status');

  // Links from the profile pages pre-select answers, e.g.
  // contact.html?side=Franchisor&stage=Franchising&need=Sites#contact
  const params = new URLSearchParams(location.search);
  const pick = (name, values) => {
    const inputs = [...form.querySelectorAll(`input[name="${name}"]`)];
    if (!values.length || !inputs.some((input) => values.includes(input.value))) return;
    for (const input of inputs) input.checked = values.includes(input.value);
  };
  pick('side', params.getAll('side'));
  pick('stage', params.getAll('stage'));
  pick('needs', params.getAll('need'));

  function collect() {
    const data = new FormData(form);
    return {
      concept: data.get('concept')?.trim() || '',
      stage: data.get('stage') || '',
      side: data.get('side') || '',
      needs: data.getAll('needs'),
      name: data.get('name')?.trim() || '',
      email: data.get('email')?.trim() || '',
    };
  }

  function validate() {
    let firstInvalid = null;
    for (const field of [form.name, form.email]) {
      const valid = field.checkValidity();
      field.setAttribute('aria-invalid', String(!valid));
      if (!valid && !firstInvalid) firstInvalid = field;
    }
    return firstInvalid;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const invalid = validate();
    if (invalid) {
      status.textContent = 'Please add your name and a valid email so we can reply.';
      invalid.focus();
      return;
    }

    const answers = collect();

    status.textContent = 'Sending…';
    try {
      let res;
      if (FORM_ENDPOINT) {
        res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(answers),
        });
      } else {
        // Netlify Forms keeps one value per field, so the chosen needs are
        // sent as a single comma-separated entry.
        const body = new URLSearchParams({
          'form-name': form.getAttribute('name'),
          'company-website': form.elements['company-website'].value,
          ...answers,
          needs: answers.needs.join(', '),
        });
        res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });
      }
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.textContent = 'Thank you. We’ll be in touch to map the first moves.';
    } catch {
      status.textContent = 'Something went wrong sending the form. Please try again.';
    }
  });

  for (const field of [form.name, form.email]) {
    field.addEventListener('input', () => field.removeAttribute('aria-invalid'));
  }
}
