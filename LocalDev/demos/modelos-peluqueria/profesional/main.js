/* Nácar · Plan Profesional */
const WHATSAPP = '34600000000'; // ← número del cliente

// Fotos: id de Unsplash o ruta local (../img/…)
const U = (id, w = 800) => (id.startsWith('../') ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`);
const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Datos (editar aquí) ---------- */
const CATS = { corte: 'Corte', color: 'Color', tratamientos: 'Tratamientos', barberia: 'Barbería', novias: 'Novias', unas: 'Uñas' };
const SERVICES = [
  { cat: 'corte', name: 'Corte y peinado', desc: 'Lavado, corte personalizado y peinado.', time: '45 min', price: 25, img: 'photo-1580618672591-eb180b1a973f' },
  { cat: 'corte', name: 'Peinado / brushing', desc: 'Lavado y secado con forma o ondas.', time: '30 min', price: 18, img: 'photo-1562322140-8baeececf3df' },
  { cat: 'corte', name: 'Corte infantil', desc: 'Hasta 10 años, con mucha paciencia.', time: '20 min', price: 12, img: 'photo-1595475884562-073c30d45670' },
  { cat: 'color', name: 'Tinte raíz', desc: 'Color sin amoniaco y matiz incluido.', time: '1 h', price: 35, img: 'photo-1560066984-138dadb4c035' },
  { cat: 'color', name: 'Mechas balayage', desc: 'Iluminación natural pintada a mano.', time: '2 h 30', price: 89, img: 'photo-1522337360788-8b13dee7a37e' },
  { cat: 'color', name: 'Color fantasía', desc: 'Lilas, rosas o cobres con decoloración previa.', time: '3 h', price: 110, img: 'photo-1492106087820-71f1a00d2b11' },
  { cat: 'tratamientos', name: 'Keratina', desc: 'Pelo liso y sin encrespamiento hasta 4 meses.', time: '2 h', price: 120, img: 'photo-1519699047748-de8e457a634e' },
  { cat: 'tratamientos', name: 'Hidratación profunda', desc: 'Ritual de lavado, mascarilla y masaje.', time: '40 min', price: 30, img: 'photo-1595476108010-b4d1f102b1b1' },
  { cat: 'barberia', name: 'Corte caballero', desc: 'Tijera o máquina, con degradado si quieres.', time: '30 min', price: 15, img: 'photo-1622286342621-4bd786c2447c' },
  { cat: 'barberia', name: 'Arreglo de barba', desc: 'Perfilado a navaja y toalla caliente.', time: '25 min', price: 12, img: 'photo-1503951914875-452162b0f3f1' },
  { cat: 'barberia', name: 'Corte + barba', desc: 'El combo completo para salir nuevo.', time: '50 min', price: 24, img: 'photo-1605497788044-5a32c7078486' },
  { cat: 'novias', name: 'Recogido de novia', desc: 'Con prueba previa y desplazamiento opcional.', time: '1 h 30', price: 120, img: 'photo-1626954079979-ec4f7b05e032' },
  { cat: 'novias', name: 'Maquillaje de evento', desc: 'Larga duración, ideal para fotos.', time: '1 h', price: 55, img: 'photo-1487412947147-5cebf100ffc2' },
  { cat: 'unas', name: 'Manicura semipermanente', desc: 'Hasta 3 semanas de brillo perfecto.', time: '45 min', price: 22, img: 'photo-1604654894610-df63bc536371' },
  { cat: 'unas', name: 'Manicura natural', desc: 'Limado, cutículas y esmalte clásico.', time: '30 min', price: 15, img: 'photo-1607779097040-26e80aa78e66' },
];
const PLANS = [
  { name: 'Bono Brillo', price: '69 €', per: '3 tratamientos', items: ['3 hidrataciones profundas', 'Válido 4 meses', 'Ahorras 21 €'] },
  { name: 'Bono Color', price: '99 €', per: '3 tintes de raíz', items: ['3 tintes de raíz con matiz', 'Peinado incluido', 'Ahorras 21 €'], featured: true },
  { name: 'Club Barbería', price: '29 €', per: 'al mes', items: ['2 cortes de caballero al mes', 'Arreglo de barba incluido', 'Sin permanencia'] },
];
const GALLERY = [
  ['photo-1522337360788-8b13dee7a37e', 'Balayage miel sobre castaño'],
  ['photo-1599351431202-1e0f0137899a', 'Degradado con dibujo'],
  ['photo-1492106087820-71f1a00d2b11', 'Color lila pastel'],
  ['photo-1626954079979-ec4f7b05e032', 'Recogido con adornos'],
  ['photo-1604654894610-df63bc536371', 'Manicura en tonos oscuros'],
  ['photo-1519699047748-de8e457a634e', 'Rizos definidos'],
  ['photo-1585747860715-2ba37e788b70', 'Nuestra zona de barbería'],
  ['photo-1600948836101-f9ffda59d250', 'El salón por dentro'],
  ['../img/gal-4.jpg', 'Sillón de barbería'],
  ['../img/gal-3.jpg', 'Rubio luminoso'],
  ['../img/gal-1.jpg', 'Corte en tijera'],
  ['../img/hero.jpg', 'Detalle de barbería'],
];
const TEAM = [
  { name: 'Lucía Romero', role: 'Directora · Color y balayage', img: 'photo-1562322140-8baeececf3df' },
  { name: 'Marta Gil', role: 'Novias y maquillaje', img: 'photo-1487412947147-5cebf100ffc2' },
  { name: 'Dani Ruiz', role: 'Barbería', img: 'photo-1605497788044-5a32c7078486' },
];
const REVIEWS = [
  ['Paula M.', 'hace 1 semana', 'Llevaba años buscando a alguien que entendiera mi pelo rizado. Lucía es una artista y el trato es de diez.'],
  ['Andrés L.', 'hace 3 semanas', 'El mejor degradado que me han hecho en Cádiz. Puntuales y con el WhatsApp te dan cita al momento.'],
  ['Rocío P.', 'hace 2 meses', 'Me hicieron el recogido de mi boda y aguantó perfecto todo el día. Hicimos prueba antes y fue genial.'],
];

/* ---------- WhatsApp, año y menú ---------- */
function bindWa(scope = document) {
  $$('[data-wa]', scope).forEach((a) => { a.href = waLink(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });
}
$$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
const toggle = $('[data-nav-toggle]'), nav = $('[data-nav]');
toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', nav.classList.toggle('is-open')));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', false); } });

/* ---------- Catálogo con filtros ---------- */
const filters = $('[data-filters]'), catalog = $('[data-catalog]');
filters.innerHTML = ['todo', ...Object.keys(CATS)].map((k, i) =>
  `<button type="button" aria-pressed="${i === 0}" data-filter="${k}">${k === 'todo' ? 'Todo' : CATS[k]}</button>`).join('');
function renderCatalog(cat = 'todo') {
  const list = SERVICES.filter((s) => cat === 'todo' || s.cat === cat);
  catalog.innerHTML = list.map((s, i) => `
    <article class="card" style="--i:${i}">
      <div class="card__img"><img src="${U(s.img, 600)}" alt="${esc(s.name)}" loading="lazy" /><span class="card__cat">${CATS[s.cat]}</span></div>
      <div class="card__body">
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.desc)}</p>
        <div class="card__meta"><span>${s.time}</span><strong>${s.price} €</strong></div>
        <a class="btn btn--dark btn--sm" href="#" data-wa="Hola, quiero pedir cita para: ${esc(s.name)} (${s.price} €).">Pedir cita</a>
      </div>
    </article>`).join('');
  bindWa(catalog);
}
filters.addEventListener('click', (e) => {
  const b = e.target.closest('[data-filter]'); if (!b) return;
  $$('[data-filter]', filters).forEach((x) => x.setAttribute('aria-pressed', x === b));
  catalog.classList.add('is-changing');
  setTimeout(() => { renderCatalog(b.dataset.filter); catalog.classList.remove('is-changing'); }, 180);
});
renderCatalog();

/* ---------- Bonos ---------- */
$('[data-plans]').innerHTML = PLANS.map((p) => `
  <article class="plan${p.featured ? ' plan--featured' : ''} reveal">
    ${p.featured ? '<span class="plan__badge">El más pedido</span>' : ''}
    <h3>${p.name}</h3>
    <p class="plan__price">${p.price} <small>${p.per}</small></p>
    <ul>${p.items.map((i) => `<li>${i}</li>`).join('')}</ul>
    <a class="btn ${p.featured ? 'btn--light' : 'btn--outline'}" href="#" data-wa="Hola, quiero contratar el ${p.name} (${p.price}).">Contratar por WhatsApp</a>
  </article>`).join('');

/* ---------- Galería + lightbox ---------- */
$('[data-gallery]').innerHTML = GALLERY.map(([id, cap], i) => `
  <button type="button" class="gallery__item reveal" data-index="${i}" style="--i:${i}">
    <img src="${U(id, 700)}" alt="${esc(cap)}" loading="lazy" /><span>${esc(cap)}</span>
  </button>`).join('');
const lb = $('[data-lightbox]'), lbImg = $('[data-lb-img]'), lbCap = $('[data-lb-cap]');
let lbIndex = 0;
const showLb = (i) => {
  lbIndex = (i + GALLERY.length) % GALLERY.length;
  lbImg.src = U(GALLERY[lbIndex][0], 1600); lbImg.alt = GALLERY[lbIndex][1]; lbCap.textContent = GALLERY[lbIndex][1];
};
$('[data-gallery]').addEventListener('click', (e) => { const b = e.target.closest('[data-index]'); if (b) { showLb(+b.dataset.index); lb.showModal(); } });
$('[data-lb-prev]').addEventListener('click', () => showLb(lbIndex - 1));
$('[data-lb-next]').addEventListener('click', () => showLb(lbIndex + 1));
$('[data-lb-close]').addEventListener('click', () => lb.close());
lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') showLb(lbIndex - 1); if (e.key === 'ArrowRight') showLb(lbIndex + 1); });
let touchX = null;
lb.addEventListener('touchstart', (e) => (touchX = e.touches[0].clientX), { passive: true });
lb.addEventListener('touchend', (e) => { if (touchX == null) return; const d = e.changedTouches[0].clientX - touchX; if (Math.abs(d) > 40) showLb(lbIndex + (d < 0 ? 1 : -1)); touchX = null; });

/* ---------- Equipo y reseñas ---------- */
$('[data-team]').innerHTML = TEAM.map((t) => `
  <article class="member reveal">
    <div class="member__img"><img src="${U(t.img, 600)}" alt="${esc(t.name)}" loading="lazy" /></div>
    <h3>${esc(t.name)}</h3><p>${esc(t.role)}</p>
  </article>`).join('');
$('[data-reviews]').innerHTML = REVIEWS.map(([n, t, r]) => `
  <article class="review reveal">
    <p class="review__stars">★★★★★</p>
    <p>“${esc(r)}”</p>
    <p class="review__who"><strong>${esc(n)}</strong> · ${esc(t)} · Google</p>
  </article>`).join('');

/* ---------- Antes / después ---------- */
const ba = $('[data-ba]');
const range = $('input', ba);
const setBa = (v) => { range.value = v; ba.style.setProperty('--pos', v + '%'); };
range.addEventListener('input', () => setBa(range.value));
ba.addEventListener('pointerdown', (e) => { const r = ba.getBoundingClientRect(); setBa(Math.round(((e.clientX - r.left) / r.width) * 100)); });

/* ---------- Formulario ---------- */
const select = $('[data-service-select]');
select.insertAdjacentHTML('beforeend', SERVICES.map((s) => `<option>${esc(s.name)}</option>`).join(''));
const form = $('[data-form]');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const status = $('.form__status', form);
  const name = form.nombre.value.trim(), phone = form.telefono.value.replace(/[\s.-]/g, '');
  const okPhone = /^(\+?34)?[6789]\d{8}$/.test(phone);
  form.nombre.parentElement.classList.toggle('is-error', name.length < 2);
  form.telefono.parentElement.classList.toggle('is-error', !okPhone);
  if (name.length < 2 || !okPhone) { status.textContent = 'Revisa tu nombre y un teléfono de 9 cifras.'; status.className = 'form__status err'; return; }
  if (!form.privacidad.checked) { status.textContent = 'Debes aceptar la política de privacidad.'; status.className = 'form__status err'; return; }
  // fetch('https://formspree.io/f/XXXX', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
  status.textContent = `¡Gracias, ${name}! Te escribimos hoy para confirmar tu cita.`;
  status.className = 'form__status ok';
  form.reset();
});

/* ---------- Animaciones ---------- */
bindWa();
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (!en.isIntersecting) return;
  en.target.classList.add('is-in'); io.unobserve(en.target);
}), { threshold: 0.12 });
$$('.reveal').forEach((el) => io.observe(el));

// Contadores
const countIo = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (!en.isIntersecting) return;
  const el = en.target, to = +el.dataset.count, t0 = performance.now();
  const step = (t) => { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString('es-ES'); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step); countIo.unobserve(el);
}));
$$('[data-count]').forEach((el) => countIo.observe(el));

// Parallax suave en el collage del hero
const imgA = $('.hero__img--a'), imgB = $('.hero__img--b');
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  addEventListener('scroll', () => {
    const y = Math.min(scrollY, 800);
    imgA.style.transform = `translateY(${y * -0.06}px)`;
    imgB.style.transform = `translateY(${y * 0.08}px)`;
  }, { passive: true });
}
