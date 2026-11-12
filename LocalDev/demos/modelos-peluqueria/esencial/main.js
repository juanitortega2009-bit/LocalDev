/* Nácar · Plan Esencial */
const WHATSAPP = '34600000000'; // ← número del cliente (prefijo país, sin + ni espacios)

const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

// Enlaces de WhatsApp
document.querySelectorAll('[data-wa]').forEach((a) => {
  a.href = waLink(a.dataset.wa);
  a.target = '_blank';
  a.rel = 'noopener';
});

// Año del pie
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

// Menú móvil
const toggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', open);
});
nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', false); }
});

// Aparición suave al hacer scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Formulario de contacto (demo: valida y responde; conectar a Formspree o similar en la web real)
const form = document.querySelector('[data-form]');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const status = form.querySelector('.form__status');
  const name = form.nombre.value.trim();
  const phone = form.telefono.value.replace(/[\s.-]/g, '');
  form.nombre.parentElement.classList.toggle('is-error', name.length < 2);
  form.telefono.parentElement.classList.toggle('is-error', !/^(\+?34)?[6789]\d{8}$/.test(phone));
  if (name.length < 2 || !/^(\+?34)?[6789]\d{8}$/.test(phone)) {
    status.textContent = 'Revisa tu nombre y un teléfono de 9 cifras.'; status.className = 'form__status err'; return;
  }
  if (!form.privacidad.checked) {
    status.textContent = 'Debes aceptar la política de privacidad.'; status.className = 'form__status err'; return;
  }
  // fetch('https://formspree.io/f/XXXX', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
  status.textContent = `¡Gracias, ${name}! Te escribimos hoy para darte cita.`;
  status.className = 'form__status ok';
  form.reset();
});
