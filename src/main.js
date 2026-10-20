import './style.css';

// Where "Map my expansion" submissions go. Set VITE_FORM_ENDPOINT to a form
// service URL (Formspree, Basin, etc.) to post the answers as JSON; without it
// the form opens the visitor's email client addressed to VITE_CONTACT_EMAIL.
const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || '';
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || '';

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

// "Map your expansion" form
const form = document.getElementById('expansion-form');
const status = form.querySelector('.mapform__status');

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

  if (FORM_ENDPOINT) {
    status.textContent = 'Sending…';
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(answers),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.textContent = 'Thank you. We’ll be in touch to map the first moves.';
    } catch {
      status.textContent = 'Something went wrong sending the form. Please try again.';
    }
    return;
  }

  const body = [
    `Concept: ${answers.concept || '-'}`,
    `Where it is today: ${answers.stage || '-'}`,
    `Side: ${answers.side || '-'}`,
    `Needs next: ${answers.needs.join(', ') || '-'}`,
    '',
    `${answers.name} <${answers.email}>`,
  ].join('\n');
  const subject = `Map my expansion: ${answers.name}`;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  status.textContent = 'Your email app should open with your answers ready to send.';
});

for (const field of [form.name, form.email]) {
  field.addEventListener('input', () => field.removeAttribute('aria-invalid'));
}
