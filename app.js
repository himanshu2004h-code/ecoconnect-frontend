const toast = document.querySelector('#toast');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNavigation = document.querySelector('#primary-navigation');
const filterStatus = document.querySelector('#filter-status');
const registrationDialog = document.querySelector('#registration-dialog');
const registrationForm = document.querySelector('#volunteer-registration-form');
const registrationInitiative = document.querySelector('#registration-initiative');
const registrationFeedback = document.querySelector('#registration-feedback');
const volunteerName = document.querySelector('#volunteer-name');
let registrationTrigger = null;
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3600);
}

function closeNavigation() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  primaryNavigation.classList.remove('is-open');
}

function closeRegistration() {
  registrationDialog.close();
  registrationTrigger?.focus();
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  primaryNavigation.classList.toggle('is-open', isOpen);
});

primaryNavigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeNavigation);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (registrationDialog.open) {
    closeRegistration();
  } else if (menuToggle.getAttribute('aria-expanded') === 'true') {
    closeNavigation();
    menuToggle.focus();
  }
});

document.querySelectorAll('[data-jump]').forEach((button) => {
  button.addEventListener('click', () => document.querySelector(`#${button.dataset.jump}`).scrollIntoView({ behavior: 'smooth' }));
});

document.querySelectorAll('[data-prototype-action]').forEach((button) => {
  const initiativeCard = button.closest('.initiative-card');
  if (initiativeCard) {
    button.addEventListener('click', () => {
      registrationTrigger = button;
      registrationForm.reset();
      registrationForm.querySelectorAll('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'));
      registrationFeedback.textContent = '';
      registrationFeedback.removeAttribute('data-state');
      const initiativeName = initiativeCard.querySelector('h3').textContent.trim();
      const schedule = initiativeCard.querySelector('.tag-row span:last-child')?.textContent.trim();
      registrationInitiative.textContent = schedule ? `${initiativeName} · ${schedule}` : initiativeName;
      registrationDialog.showModal();
      volunteerName.focus();
    });
    return;
  }
  const message = 'This is a visual prototype. This action is not connected to Salesforce.';
  button.dataset.prototypeAction = message;
  button.addEventListener('click', () => showToast(message));
});

document.querySelectorAll('[data-close-registration]').forEach((button) => {
  button.addEventListener('click', closeRegistration);
});

registrationForm.addEventListener('input', (event) => {
  event.target.removeAttribute('aria-invalid');
  if (registrationFeedback.dataset.state) {
    registrationFeedback.textContent = '';
    registrationFeedback.removeAttribute('data-state');
  }
});

registrationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  registrationForm.querySelectorAll('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'));
  registrationFeedback.textContent = '';
  registrationFeedback.removeAttribute('data-state');

  if (!registrationForm.checkValidity()) {
    const invalidField = registrationForm.querySelector(':invalid');
    invalidField?.setAttribute('aria-invalid', 'true');
    registrationFeedback.dataset.state = 'error';
    registrationFeedback.textContent = 'Enter your name and a valid email address to check these details.';
    invalidField?.focus();
    return;
  }

  registrationFeedback.dataset.state = 'success';
  registrationFeedback.textContent = 'Your details are complete. No registration was submitted and no Salesforce record was created.';
});

document.querySelector('#issue-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  showToast('This is a visual prototype. Reports are not submitted to Salesforce.');
});

document.querySelectorAll('.filter').forEach((filter) => {
  filter.setAttribute('aria-pressed', String(filter.classList.contains('active')));
  filter.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((item) => {
      const isActive = item === filter;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
    const selected = filter.dataset.filter;
    const rows = [...document.querySelectorAll('#issue-rows tr')];
    let visible = 0;
    rows.forEach((row) => {
      const show = selected === 'all' || row.dataset.status === selected;
      row.hidden = !show;
      if (show) visible += 1;
    });
    document.querySelector('#empty-state').hidden = visible !== 0;
    filterStatus.textContent = `Showing ${visible} ${visible === 1 ? 'issue' : 'issues'} for ${filter.textContent.trim()}.`;
  });
});

const sections = [...document.querySelectorAll('main section[id]')];
const links = [...document.querySelectorAll('.nav-link')];
const observer = new IntersectionObserver((entries) => {
  const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!current) return;
  links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current.target.id}`));
}, { rootMargin: '-20% 0px -65% 0px', threshold: [0.1, 0.45] });
sections.forEach((section) => observer.observe(section));
