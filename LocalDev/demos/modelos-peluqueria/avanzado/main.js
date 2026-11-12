/* =======================================================================
   Nácar Studio · Plan Avanzado
   Salón 3D navegable + páginas ocultas por zona + reservas, pagos, tienda,
   eventos, ofertas programadas y diagnóstico capilar.
   ======================================================================= */
(async () => {

/* =======================================================================
   1. CONFIGURACIÓN Y DATOS (editar aquí)
   ======================================================================= */
const CONFIG = {
  empresa: 'Nácar Studio',
  whatsapp: '34600000000',                               // prefijo país + número
  recursos: 'https://dl.polyhaven.org/file/ph-assets',   // texturas, cielo y muebles 3D (CC0)
  senal: 5,                                              // señal de reserva online (€)
};
const U = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

const STAFF = {
  any:   { name: 'Cualquiera', role: 'La primera disponible', skills: ['corte', 'color', 'tratamientos', 'barberia', 'novias', 'unas'] },
  lucia: { name: 'Lucía', role: 'Color y corte', skills: ['corte', 'color', 'tratamientos'] },
  marta: { name: 'Marta', role: 'Novias, maquillaje y uñas', skills: ['corte', 'novias', 'unas', 'tratamientos'] },
  dani:  { name: 'Dani', role: 'Barbería', skills: ['barberia', 'corte'] },
};

const SERVICES = [
  { id: 'corte', cat: 'corte', name: 'Corte y peinado', time: 45, price: 25 },
  { id: 'brushing', cat: 'corte', name: 'Peinado / brushing', time: 30, price: 18 },
  { id: 'infantil', cat: 'corte', name: 'Corte infantil', time: 20, price: 12 },
  { id: 'raiz', cat: 'color', name: 'Tinte raíz', time: 60, price: 35 },
  { id: 'balayage', cat: 'color', name: 'Mechas balayage', time: 150, price: 89 },
  { id: 'gloss', cat: 'color', name: 'Matiz y gloss de brillo', time: 30, price: 28 },
  { id: 'fantasia', cat: 'color', name: 'Color fantasía', time: 180, price: 110 },
  { id: 'keratina', cat: 'tratamientos', name: 'Keratina', time: 120, price: 120 },
  { id: 'hidratacion', cat: 'tratamientos', name: 'Hidratación profunda', time: 40, price: 30 },
  { id: 'anticaida', cat: 'tratamientos', name: 'Tratamiento anticaída', time: 45, price: 35 },
  { id: 'caballero', cat: 'barberia', name: 'Corte caballero', time: 30, price: 15 },
  { id: 'barba', cat: 'barberia', name: 'Arreglo de barba', time: 25, price: 12 },
  { id: 'combo', cat: 'barberia', name: 'Corte + barba', time: 50, price: 24 },
  { id: 'recogido', cat: 'novias', name: 'Recogido de novia (con prueba)', time: 90, price: 120 },
  { id: 'maquillaje', cat: 'novias', name: 'Maquillaje de evento', time: 60, price: 55 },
  { id: 'invitada', cat: 'novias', name: 'Peinado de invitada', time: 45, price: 40 },
  { id: 'semi', cat: 'unas', name: 'Manicura semipermanente', time: 45, price: 22 },
  { id: 'manicura', cat: 'unas', name: 'Manicura natural', time: 30, price: 15 },
  { id: 'pedicura', cat: 'unas', name: 'Pedicura spa', time: 50, price: 30 },
];
const svc = (id) => SERVICES.find((s) => s.id === id);

/* Páginas ocultas: una por zona del salón */
const ZONES = {
  corte: {
    nombre: 'Corte y peinado', cat: 'corte', icono: '✂️',
    titulo: 'Cortes que se peinan solos',
    intro: 'Estudiamos tu tipo de pelo, tu cara y tu día a día antes de cortar. Sales con un corte que sabes llevar en casa, sin plancha ni secador eterno.',
    hero: 'photo-1580618672591-eb180b1a973f', ba: 'photo-1562322140-8baeececf3df',
    galeria: [['photo-1580618672591-eb180b1a973f', 'Ondas suaves con secador'], ['photo-1562322140-8baeececf3df', 'Brushing con volumen'], ['photo-1519699047748-de8e457a634e', 'Corte para rizo'], ['photo-1560066984-138dadb4c035', 'Nuestros tocadores']],
    faq: [['¿Cada cuánto debo cortarme?', 'Para mantener la forma, cada 6–8 semanas. Si te dejas crecer el pelo, cada 10–12 para sanear puntas.'], ['¿El lavado está incluido?', 'Sí: lavado con masaje, corte y peinado van siempre incluidos.'], ['¿Trabajáis el pelo rizado?', 'Sí, cortamos en seco y con técnicas específicas para rizo.']],
    review: ['Paula M.', 'Llevaba años buscando a alguien que entendiera mi pelo. Salgo y me lo puedo peinar igual en casa.'],
  },
  color: {
    nombre: 'Color y mechas', cat: 'color', icono: '🎨',
    titulo: 'Color que brilla semanas',
    intro: 'Balayage, mechas, tintes sin amoniaco y colores fantasía. Hacemos prueba de mecha y protegemos la fibra con tratamiento de enlaces en cada sesión.',
    hero: 'photo-1522337360788-8b13dee7a37e', ba: 'photo-1522337360788-8b13dee7a37e',
    galeria: [['photo-1522337360788-8b13dee7a37e', 'Balayage miel'], ['photo-1492106087820-71f1a00d2b11', 'Lila pastel'], ['photo-1560066984-138dadb4c035', 'Zona de color'], ['photo-1595475884562-073c30d45670', 'Preparando la mezcla']],
    faq: [['¿El balayage estropea el pelo?', 'Usamos protector de enlaces durante la decoloración, así el pelo sale igual de fuerte que entró.'], ['¿Cuánto dura el color?', 'Un tinte de raíz, 5–6 semanas. Un balayage bien hecho, 3–4 meses sin retocar.'], ['¿Hacéis prueba de alergia?', 'Sí, 48 h antes si es tu primera vez con nosotras.']],
    review: ['Laura S.', 'Mi balayage es exactamente lo que le enseñé en Instagram. Y el pelo, suave como nunca.'],
  },
  tratamientos: {
    nombre: 'Lavacabezas y tratamientos', cat: 'tratamientos', icono: '💧',
    titulo: 'Un ritual para tu pelo',
    intro: 'Hidratación, keratina, anticaída y masaje capilar en nuestros lavacabezas reclinables. Diagnosticamos tu cuero cabelludo antes de elegir el tratamiento.',
    hero: 'photo-1595476108010-b4d1f102b1b1', ba: 'photo-1519699047748-de8e457a634e',
    galeria: [['photo-1595476108010-b4d1f102b1b1', 'Lavacabezas con masaje'], ['photo-1519699047748-de8e457a634e', 'Rizo nutrido'], ['photo-1527799820374-dcf8d9d4a388', 'Herramientas profesionales'], ['photo-1633681926022-84c23e8cb2d6', 'El salón']],
    faq: [['¿La keratina lleva formol?', 'No. Usamos alisados sin formol, aptos incluso para pelo teñido.'], ['¿Cuánto dura una keratina?', 'Entre 3 y 4 meses, según tu lavado y el champú que uses.'], ['¿Notaré la hidratación desde el primer día?', 'Sí, y con el bono de 3 sesiones el efecto se mantiene semanas.']],
    review: ['Carmen R.', 'El masaje del lavacabezas ya merece la visita. La keratina me ha cambiado la vida.'],
  },
  barberia: {
    nombre: 'Barbería', cat: 'barberia', icono: '💈',
    titulo: 'Barbería con toalla caliente',
    intro: 'Degradados, cortes clásicos y arreglo de barba a navaja. Con Dani, toalla caliente y una cerveza si te apetece.',
    hero: 'photo-1585747860715-2ba37e788b70', ba: 'photo-1622286342621-4bd786c2447c',
    galeria: [['photo-1599351431202-1e0f0137899a', 'Degradado con dibujo'], ['photo-1605497788044-5a32c7078486', 'Secado y fijación'], ['photo-1503951914875-452162b0f3f1', 'Afeitado clásico'], ['photo-1621605815971-fbc98d665033', 'Nuestro equipo de barbería']],
    faq: [['¿Tengo que reservar?', 'Te recomendamos reservar online, pero si hay hueco te atendemos al momento.'], ['¿Hacéis dibujos en el degradado?', 'Sí, dinos el diseño al reservar y te dejamos el tiempo justo.'], ['¿Qué incluye el Club Barbería?', 'Dos cortes al mes con arreglo de barba por 29 €, sin permanencia.']],
    review: ['Andrés L.', 'El mejor degradado que me han hecho en Cádiz. Reservo online en 10 segundos.'],
  },
  novias: {
    nombre: 'Novias y maquillaje', cat: 'novias', icono: '💍',
    titulo: 'El día más importante, perfecto',
    intro: 'Recogidos, semirrecogidos y maquillaje de larga duración. Hacemos una prueba previa sin prisas y nos desplazamos el día de la boda.',
    hero: 'photo-1626954079979-ec4f7b05e032', ba: 'photo-1487412947147-5cebf100ffc2',
    galeria: [['photo-1626954079979-ec4f7b05e032', 'Recogido con adornos'], ['photo-1487412947147-5cebf100ffc2', 'Maquillaje de evento'], ['photo-1516975080664-ed2fc6a32937', 'Nuestro kit de maquillaje'], ['photo-1559599101-f09722fb4948', 'El equipo']],
    faq: [['¿Cuándo hago la prueba?', 'Entre 3 y 6 semanas antes de la boda, con tus adornos y una foto del vestido.'], ['¿Os desplazáis?', 'Sí, a toda la provincia. El desplazamiento se presupuesta según distancia.'], ['¿Peináis también a las invitadas?', 'Claro: madrinas, damas e invitadas, en el salón o en casa.']],
    review: ['Rocío P.', 'El recogido aguantó perfecto toda la boda y las fotos son preciosas.'],
  },
  unas: {
    nombre: 'Uñas y estética', cat: 'unas', icono: '💅',
    titulo: 'Manos y pies impecables',
    intro: 'Manicura semipermanente, natural, nail art y pedicura spa. Esterilizamos todo el material y usamos esmaltes veganos.',
    hero: 'photo-1604654894610-df63bc536371', ba: 'photo-1607779097040-26e80aa78e66',
    galeria: [['photo-1604654894610-df63bc536371', 'Semipermanente en tonos oscuros'], ['photo-1607779097040-26e80aa78e66', 'Nude natural'], ['photo-1595475884562-073c30d45670', 'Herramientas'], ['photo-1521590832167-7bcbfaa6381f', 'Zona de estética']],
    faq: [['¿Cuánto dura el semipermanente?', 'Entre 2 y 3 semanas sin levantarse ni perder brillo.'], ['¿Retiráis el esmalte de otro centro?', 'Sí, la retirada está incluida en el servicio.'], ['¿Hacéis diseños?', 'Sí, trae una foto y te decimos el tiempo y el precio.']],
    review: ['Elena T.', 'Me duran las tres semanas perfectas. Y el trato, encantador.'],
  },
};
const ZONE_ORDER = ['corte', 'color', 'tratamientos', 'barberia', 'novias', 'unas'];

const BONOS = [
  { id: 'bono-brillo', name: 'Bono Brillo', price: 69, per: '3 hidrataciones', items: ['3 hidrataciones profundas', 'Masaje capilar incluido', 'Válido 4 meses'] },
  { id: 'bono-color', name: 'Bono Color', price: 99, per: '3 tintes de raíz', items: ['3 tintes de raíz con matiz', 'Peinado incluido', 'Ahorras 21 €'], featured: true },
  { id: 'club-barberia', name: 'Club Barbería', price: 29, per: 'al mes', items: ['2 cortes de caballero al mes', 'Arreglo de barba incluido', 'Sin permanencia'] },
];

const PRODUCTS = [
  { id: 'champu', cat: 'cuidado', name: 'Champú nutritivo', size: '300 ml', price: 18.9, shape: 'bottle', c1: '#E8CFC0', bg: '#4A3429' },
  { id: 'mascarilla', cat: 'cuidado', name: 'Mascarilla reparadora', size: '250 ml', price: 24.5, shape: 'jar', c1: '#F3E7DC', bg: '#3E2E25', badge: 'Top ventas' },
  { id: 'serum', cat: 'cuidado', name: 'Sérum anti-frizz', size: '50 ml', price: 21, shape: 'dropper', c1: '#D9A07C', bg: '#2F2622' },
  { id: 'champu-color', cat: 'cuidado', name: 'Champú protector del color', size: '300 ml', price: 19.9, shape: 'bottle', c1: '#C9A0C8', bg: '#3B2B3A' },
  { id: 'tonico', cat: 'cuidado', name: 'Tónico anticaída', size: '100 ml', price: 27, shape: 'spray', c1: '#BFD0C0', bg: '#26332B' },
  { id: 'laca', cat: 'styling', name: 'Laca fijación flexible', size: '400 ml', price: 14.5, shape: 'spray', c1: '#E9E1D6', bg: '#433730' },
  { id: 'cera', cat: 'barberia', name: 'Cera mate', size: '100 ml', price: 13.9, shape: 'jar', c1: '#2B2B2B', bg: '#5A4636' },
  { id: 'aceite-barba', cat: 'barberia', name: 'Aceite para barba', size: '30 ml', price: 16, shape: 'dropper', c1: '#B07A45', bg: '#2E241D' },
];
const SHOP_CATS = { todo: 'Todo', cuidado: 'Cuidado', styling: 'Styling', barberia: 'Barbería' };

/* Eventos: se colocan a partir de hoy para que el calendario siempre tenga actividad */
const EVENTS = [
  { in: 3, title: 'Taller de recogidos fáciles', time: '18:00–20:00', price: '25 €', desc: 'Aprende 3 recogidos para el día a día. Plazas limitadas a 8.' },
  { in: 9, title: 'Noche de chicas', time: '19:00–22:00', price: 'Gratis', desc: '-20 % en servicios, cóctel y asesoría de color con Lucía.' },
  { in: 16, title: 'Masterclass de rizo', time: '17:00–19:00', price: '30 €', desc: 'Método curly paso a paso: lavado, definición y secado.' },
  { in: 23, title: 'Barber Saturday', time: '10:00–14:00', price: 'Gratis', desc: 'Degradados exprés, DJ y producto de regalo con cada corte.' },
  { in: 37, title: 'Pasarela de novias 2027', time: '18:30', price: 'Gratis', desc: 'Presentamos las tendencias de recogidos y maquillaje nupcial.' },
];

/* Ofertas programadas: se activan y desactivan solas según la fecha (mes-día) */
const OFFERS = [
  { from: '10-15', to: '11-22', label: 'Otoño: -15 % en productos de cuidado', shop: 15, shopCat: 'cuidado' },
  { from: '11-23', to: '11-30', label: 'BLACK WEEK: -25 % en tienda y -20 % en bonos', shop: 25, bonos: 20 },
  { from: '12-01', to: '12-24', label: 'Navidad: regala belleza, -15 % en bonos', bonos: 15 },
  { from: '01-07', to: '01-31', label: 'Rebajas: -20 % en toda la tienda', shop: 20 },
  { from: '02-07', to: '02-14', label: 'San Valentín: -10 % en bonos para regalar', bonos: 10 },
  { from: '04-24', to: '05-03', label: 'Día de la Madre: -15 % en bonos', bonos: 15 },
  { from: '07-01', to: '08-31', label: 'Verano: -10 % en productos (protección solar capilar)', shop: 10 },
];

const REVIEWS = [
  ['Paula M.', 'hace 1 semana', 'Reservé desde el móvil en un minuto y me llegó el recordatorio por WhatsApp. El corte, perfecto.'],
  ['Andrés L.', 'hace 3 semanas', 'El mejor degradado de Cádiz. Y el salón por dentro es igual de bonito que en la web.'],
  ['Rocío P.', 'hace 2 meses', 'Me hicieron el recogido de la boda. Hicimos prueba antes y aguantó todo el día.'],
];

/* =======================================================================
   2. UTILIDADES
   ======================================================================= */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wa = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
const eur = (n) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: n % 1 ? 2 : 0 });
const dur = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) : ''}` : `${m} min`);
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const imgErr = `onerror="this.onerror=null;this.classList.add('is-broken');this.removeAttribute('src')"`;
const WA_SVG = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .3-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>';
function bindWa(scope = document) {
  $$('[data-wa]', scope).forEach((a) => { a.href = wa(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });
}
let toastTimer;
function toast(msg) {
  const t = $('[data-toast]'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
$$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

/* =======================================================================
   3. OFERTAS PROGRAMADAS (fecha real o simulada)
   ======================================================================= */
let simDate = new Date();
const md = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const activeOffer = () => { const k = md(simDate); return OFFERS.find((o) => k >= o.from && k <= o.to) || null; };
const shopPct = (p) => { const o = activeOffer(); return o && o.shop && (!o.shopCat || o.shopCat === p.cat) ? o.shop : 0; };
const bonoPct = () => activeOffer()?.bonos || 0;
const withPct = (price, pct) => Math.round(price * (1 - pct / 100) * 100) / 100;

function renderOffers() {
  const o = activeOffer(), bar = $('[data-offer-bar]');
  bar.hidden = !o; if (o) bar.textContent = `✦ ${o.label} · Ver tienda →`;
  const fmt = (s) => { const [m, d] = s.split('-'); return `${+d} ${new Date(2000, m - 1, 1).toLocaleDateString('es-ES', { month: 'short' })}`; };
  $('[data-offer-list]').innerHTML = OFFERS.map((x) => `
    <li class="rounded-2xl border p-4 ${x === o ? 'border-rose bg-rose/10' : 'border-white/10 bg-bark/60'}">
      <p class="text-xs uppercase tracking-widest ${x === o ? 'text-rose-light' : 'text-muted'}">${fmt(x.from)} – ${fmt(x.to)} ${x === o ? '· ACTIVA' : ''}</p>
      <p class="mt-1 font-semibold">${esc(x.label)}</p>
    </li>`).join('');
  renderShop(); renderBonos(); renderCart();
}
$('[data-sim-date]').value = ymd(simDate);
$('[data-sim-date]').addEventListener('change', (e) => { if (e.target.value) { simDate = new Date(e.target.value + 'T12:00'); renderOffers(); toast('Web mostrada como el ' + simDate.toLocaleDateString('es-ES')); } });
$('[data-sim-today]').addEventListener('click', () => { simDate = new Date(); $('[data-sim-date]').value = ymd(simDate); renderOffers(); });

/* =======================================================================
   4. PAGO ONLINE (simulado, como Stripe)
   ======================================================================= */
const co = $('[data-checkout]');
let coDone = null;
function checkout({ title, amount, lines = [], onDone, extra = '' }) {
  $('[data-co-name]').textContent = title;
  $('[data-co-amount]').textContent = eur(amount);
  $('[data-co-lines]').innerHTML = lines.map((l) => `<li>${esc(l)}</li>`).join('');
  $('[data-co-pay]').classList.remove('hidden'); $('[data-co-done]').classList.add('hidden');
  const btn = $('[data-co-confirm]'); btn.disabled = false; btn.textContent = `Pagar ${eur(amount)}`;
  $('[data-co-extra]').innerHTML = extra;
  coDone = onDone; co.showModal();
}
$('[data-co-confirm]').addEventListener('click', () => {
  const btn = $('[data-co-confirm]'); btn.disabled = true; btn.textContent = 'Procesando…';
  setTimeout(() => {
    const metodo = $('input[name=metodo]:checked', co).value;
    $('[data-co-receipt]').textContent = `Pagado con ${metodo}. Te hemos enviado el recibo por email y WhatsApp. Referencia NC-${Math.random().toString(36).slice(2, 8).toUpperCase()}.`;
    $('[data-co-pay]').classList.add('hidden'); $('[data-co-done]').classList.remove('hidden');
    bindWa($('[data-co-done]'));
    coDone && coDone();
  }, 1200);
});

/* =======================================================================
   5. RESERVAS ONLINE
   ======================================================================= */
const bk = { service: 'corte', staff: 'any', day: null, slot: null };
const booked = new Set();                         // huecos reservados en esta visita
const hash = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const bkDays = (() => {
  const out = []; const d = new Date(); d.setHours(12, 0, 0, 0);
  while (out.length < 14) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) out.push(new Date(d)); }
  return out;
})();
const slotsFor = (day) => {
  const end = day.getDay() === 6 ? 13.5 : 19.5, out = [];
  for (let t = 9.5; t <= end; t += 0.5) out.push(`${Math.floor(t)}:${t % 1 ? '30' : '00'}`);
  return out;
};
const isTaken = (day, slot) => booked.has(`${ymd(day)} ${slot}`) || hash(ymd(day) + bk.staff + slot) % 3 === 0;

const selService = $('[data-bk-service]');
selService.innerHTML = ZONE_ORDER.map((z) => `<optgroup label="${esc(ZONES[z].nombre)}">${SERVICES.filter((s) => s.cat === ZONES[z].cat).map((s) => `<option value="${s.id}">${esc(s.name)} · ${eur(s.price)}</option>`).join('')}</optgroup>`).join('');
selService.addEventListener('change', () => { bk.service = selService.value; if (!STAFF[bk.staff].skills.includes(svc(bk.service).cat)) bk.staff = 'any'; bk.slot = null; renderBooking(); });

function renderBooking() {
  selService.value = bk.service;
  const cat = svc(bk.service).cat;
  $('[data-bk-staff]').innerHTML = Object.entries(STAFF).filter(([, s]) => s.skills.includes(cat)).map(([k, s]) =>
    `<button type="button" class="chip text-left" aria-pressed="${bk.staff === k}" data-staff="${k}"><strong class="block">${s.name}</strong><span class="text-xs opacity-75">${s.role}</span></button>`).join('');
  $('[data-bk-days]').innerHTML = bkDays.map((d, i) =>
    `<button type="button" class="chip day-chip" aria-pressed="${bk.day && ymd(bk.day) === ymd(d)}" data-day="${i}"><small>${d.toLocaleDateString('es-ES', { weekday: 'short' })}</small><strong>${d.getDate()}</strong><small>${d.toLocaleDateString('es-ES', { month: 'short' })}</small></button>`).join('');
  $('[data-bk-slots]').innerHTML = bk.day
    ? slotsFor(bk.day).map((s) => `<button type="button" class="chip text-center" aria-pressed="${bk.slot === s}" data-slot="${s}" ${isTaken(bk.day, s) ? 'disabled' : ''}>${s}</button>`).join('')
    : '<p class="col-span-full text-sm text-muted">Elige primero un día.</p>';
  const s = svc(bk.service);
  const lines = [['Servicio', s.name], ['Profesional', STAFF[bk.staff].name], ['Día', bk.day ? bk.day.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'], ['Hora', bk.slot || '—'], ['Duración', dur(s.time)], ['Precio', eur(s.price)]];
  $('[data-bk-lines]').innerHTML = lines.map(([k, v]) => `<div class="flex justify-between gap-4"><dt class="text-muted">${k}</dt><dd class="text-right font-medium capitalize-first">${esc(v)}</dd></div>`).join('');
  const ready = bk.day && bk.slot;
  $('[data-bk-pay]').disabled = !ready; $('[data-bk-later]').disabled = !ready;
}
$('[data-booking]').addEventListener('click', (e) => {
  const st = e.target.closest('[data-staff]'), dy = e.target.closest('[data-day]'), sl = e.target.closest('[data-slot]');
  if (st) { bk.staff = st.dataset.staff; bk.slot = null; }
  else if (dy) { bk.day = bkDays[+dy.dataset.day]; bk.slot = null; }
  else if (sl && !sl.disabled) bk.slot = sl.dataset.slot;
  else return;
  renderBooking();
});

function confirmBooking(paid) {
  const f = $('[data-bk-form]'), s = svc(bk.service);
  booked.add(`${ymd(bk.day)} ${bk.slot}`);
  const when = `${bk.day.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${bk.slot}`;
  const [h, m] = bk.slot.split(':').map(Number);
  const start = new Date(bk.day); start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + s.time * 60000);
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `DTSTART:${start.toISOString().replace(/[-:]|\.\d+/g, '')}`, `DTEND:${end.toISOString().replace(/[-:]|\.\d+/g, '')}`, `SUMMARY:${s.name} · ${CONFIG.empresa}`, 'LOCATION:Calle del Ejemplo 8, Cádiz', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const icsUrl = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const msg = `Hola, soy ${f.nombre.value.trim()}. Confirmo mi cita: ${s.name} con ${STAFF[bk.staff].name}, el ${when}.${paid ? ' Señal pagada online.' : ''}`;
  $('[data-bk-summary]').innerHTML = `
    <div class="text-center py-4">
      <p class="mx-auto w-14 h-14 grid place-items-center rounded-full bg-green-500/15 text-green-400 text-2xl">✓</p>
      <h3 class="mt-4 font-display text-3xl font-semibold">¡Cita reservada!</h3>
      <p class="mt-2 text-sm text-muted">${esc(s.name)} con ${esc(STAFF[bk.staff].name)}<br>${esc(when)}</p>
      <p class="mt-2 text-xs text-muted">${paid ? `Señal de ${eur(CONFIG.senal)} pagada. Se descuenta del total.` : 'Pagas en el salón.'}</p>
      <div class="mt-5 grid gap-2">
        <a class="btn-primary" href="${icsUrl}" download="cita-nacar.ics">Añadir a mi calendario</a>
        <a class="btn-ghost" href="${wa(msg)}" target="_blank" rel="noopener">${WA_SVG} Recibir recordatorio por WhatsApp</a>
        <button type="button" class="text-sm text-muted underline mt-2" data-bk-new>Hacer otra reserva</button>
      </div>
    </div>`;
  toast('Cita reservada ✓');
}
const summaryHTML = $('[data-bk-summary]').innerHTML;
$('[data-bk-summary]').addEventListener('click', (e) => {
  if (!e.target.closest('[data-bk-new]')) return;
  $('[data-bk-summary]').innerHTML = summaryHTML; bk.day = null; bk.slot = null; bindBkForm(); renderBooking();
});
function bindBkForm() {
  const f = $('[data-bk-form]');
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = f.nombre.value.trim(), phone = f.telefono.value.replace(/[\s.-]/g, '');
    const err = $('[data-bk-error]');
    if (name.length < 2 || !/^(\+?34)?[6789]\d{8}$/.test(phone)) { err.textContent = 'Escribe tu nombre y un teléfono de 9 cifras.'; err.classList.remove('hidden'); return; }
    err.classList.add('hidden');
    if (e.submitter && e.submitter.hasAttribute('data-bk-pay')) {
      const s = svc(bk.service);
      checkout({ title: 'Señal de reserva', amount: CONFIG.senal, lines: [s.name, `${bk.day.toLocaleDateString('es-ES')} · ${bk.slot}`, `Resto a pagar en el salón: ${eur(s.price - CONFIG.senal)}`], onDone: () => confirmBooking(true) });
    } else confirmBooking(false);
  });
}
bindBkForm();
renderBooking();
function bookService(id) {
  bk.service = id; if (!STAFF[bk.staff].skills.includes(svc(id).cat)) bk.staff = 'any'; bk.slot = null;
  renderBooking();
  go('#reservas');
}

/* =======================================================================
   6. BONOS, TIENDA Y CARRITO
   ======================================================================= */
function renderBonos() {
  const pct = bonoPct();
  $('[data-bonos]').innerHTML = BONOS.map((b) => {
    const p = withPct(b.price, pct);
    return `
    <article class="relative rounded-3xl p-7 flex flex-col gap-4 border ${b.featured ? 'bg-bark border-rose' : 'border-white/10'}">
      ${b.featured ? '<span class="absolute -top-3 left-7 bg-rose text-ink text-xs font-bold px-3 py-1 rounded-full">El más regalado</span>' : ''}
      <h3 class="text-xl font-semibold">${b.name}</h3>
      <p class="font-display text-5xl font-semibold leading-none">${eur(p)} <small class="font-sans text-sm text-muted">${b.per}</small></p>
      ${pct ? `<p class="text-sm text-rose-light">Antes ${eur(b.price)} · -${pct} % hoy</p>` : ''}
      <ul class="space-y-2 text-sm text-muted flex-1">${b.items.map((i) => `<li><span class="text-rose mr-2">✓</span>${i}</li>`).join('')}</ul>
      <button type="button" class="${b.featured ? 'btn-primary' : 'btn-ghost'}" data-buy-bono="${b.id}">Comprar online</button>
    </article>`;
  }).join('');
}
$('[data-bonos]').addEventListener('click', (e) => {
  const b = BONOS.find((x) => x.id === e.target.closest('[data-buy-bono]')?.dataset.buyBono); if (!b) return;
  const p = withPct(b.price, bonoPct());
  checkout({ title: b.name, amount: p, lines: [b.per, ...b.items], onDone: () => toast(`${b.name} comprado ✓`),
    extra: `<a class="btn-ghost" href="#" data-wa="Hola, he comprado el ${b.name} online y quiero reservar mi primera sesión.">${WA_SVG} Reservar la primera sesión</a>` });
});

function productSVG(p) {
  const c = p.c1, cap = '#1F1A17';
  const shapes = {
    bottle: `<rect x="34" y="8" width="32" height="18" rx="4" fill="${cap}"/><rect x="18" y="24" width="64" height="104" rx="16" fill="${c}"/><rect x="28" y="62" width="44" height="34" rx="4" fill="rgba(0,0,0,.12)"/>`,
    jar: `<rect x="16" y="50" width="68" height="14" rx="5" fill="${cap}"/><rect x="14" y="62" width="72" height="66" rx="14" fill="${c}"/><rect x="26" y="82" width="48" height="26" rx="4" fill="rgba(0,0,0,.12)"/>`,
    dropper: `<rect x="44" y="4" width="12" height="22" rx="6" fill="${cap}"/><rect x="38" y="24" width="24" height="12" rx="3" fill="#B9935F"/><rect x="26" y="36" width="48" height="92" rx="14" fill="${c}"/><rect x="34" y="70" width="32" height="30" rx="3" fill="rgba(0,0,0,.15)"/>`,
    spray: `<rect x="40" y="4" width="22" height="14" rx="3" fill="${cap}"/><rect x="58" y="8" width="16" height="5" rx="2" fill="${cap}"/><rect x="30" y="18" width="40" height="12" rx="3" fill="#BDB3A8"/><rect x="26" y="30" width="48" height="98" rx="12" fill="${c}"/><rect x="34" y="66" width="32" height="36" rx="3" fill="rgba(0,0,0,.13)"/>`,
  };
  return `<svg viewBox="0 0 100 132" aria-hidden="true">${shapes[p.shape]}<text x="50" y="${p.shape === 'jar' ? 99 : 88}" text-anchor="middle" font-family="Georgia" font-size="11" fill="rgba(0,0,0,.55)">NÁCAR</text></svg>`;
}
let shopFilter = 'todo';
$('[data-shop-filters]').innerHTML = Object.entries(SHOP_CATS).map(([k, v]) => `<button type="button" class="chip" aria-pressed="${k === 'todo'}" data-shop-filter="${k}">${v}</button>`).join('');
$('[data-shop-filters]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-shop-filter]'); if (!b) return;
  shopFilter = b.dataset.shopFilter;
  $$('[data-shop-filter]').forEach((x) => x.setAttribute('aria-pressed', x === b)); renderShop();
});
function renderShop() {
  $('[data-shop]').innerHTML = PRODUCTS.filter((p) => shopFilter === 'todo' || p.cat === shopFilter).map((p) => {
    const pct = shopPct(p), price = withPct(p.price, pct);
    return `
    <article class="product rounded-3xl bg-bark border border-white/5 p-3 flex flex-col">
      <div class="product-art" style="--bg:${p.bg}">${productSVG(p)}${pct ? `<span class="product-badge">-${pct} %</span>` : p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}</div>
      <div class="px-1 pt-3 flex-1 flex flex-col">
        <h3 class="font-semibold leading-tight">${esc(p.name)}</h3>
        <p class="text-xs text-muted">${p.size}</p>
        <p class="mt-2 font-display text-2xl font-semibold">${eur(price)} ${pct ? `<s class="font-sans text-xs text-muted">${eur(p.price)}</s>` : ''}</p>
        <button type="button" class="btn-ghost mt-3 !py-2.5 text-sm" data-add="${p.id}">Añadir</button>
      </div>
    </article>`;
  }).join('');
}
$('[data-shop]').addEventListener('click', (e) => { const b = e.target.closest('[data-add]'); if (b) addToCart(b.dataset.add); });

const cart = new Map();
const cartDlg = $('[data-cart]');
function addToCart(id) { cart.set(id, (cart.get(id) || 0) + 1); renderCart(); toast('Añadido al carrito'); }
function cartTotals() {
  let sub = 0, disc = 0;
  for (const [id, q] of cart) { const p = PRODUCTS.find((x) => x.id === id); sub += p.price * q; disc += (p.price - withPct(p.price, shopPct(p))) * q; }
  const after = sub - disc, envio = $('input[name=entrega]:checked', cartDlg).value === 'envio' && after < 45 ? 3.9 : 0;
  return { sub, disc, envio, total: Math.round((after + envio) * 100) / 100 };
}
function renderCart() {
  const n = [...cart.values()].reduce((a, b) => a + b, 0);
  $('[data-cart-count]').textContent = n;
  $('[data-cart-empty]').classList.toggle('hidden', n > 0);
  $('[data-cart-foot]').classList.toggle('hidden', n === 0);
  $('[data-cart-items]').innerHTML = [...cart].map(([id, q]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return `<li class="flex items-center gap-3 rounded-2xl bg-bark p-3">
      <div class="product-art !w-14 !rounded-xl flex-none" style="--bg:${p.bg}">${productSVG(p)}</div>
      <div class="flex-1 min-w-0"><p class="font-semibold text-sm truncate">${esc(p.name)}</p><p class="text-xs text-muted">${eur(withPct(p.price, shopPct(p)))}</p></div>
      <div class="qty"><button type="button" data-qty="${id}" data-d="-1" aria-label="Quitar uno">−</button><span class="w-6 text-center text-sm">${q}</span><button type="button" data-qty="${id}" data-d="1" aria-label="Añadir uno">+</button></div>
    </li>`;
  }).join('');
  if (n) {
    const t = cartTotals();
    $('[data-ship-price]').textContent = t.sub - t.disc >= 45 ? 'Gratis' : '3,90 €';
    $('[data-cart-totals]').innerHTML = [['Subtotal', eur(t.sub)], t.disc ? ['Oferta', '−' + eur(t.disc)] : null, ['Envío', t.envio ? eur(t.envio) : 'Gratis'], ['Total', eur(t.total)]]
      .filter(Boolean).map(([k, v], i, a) => `<div class="flex justify-between ${i === a.length - 1 ? 'pt-2 border-t border-white/10 text-base font-semibold' : 'text-muted'}"><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  }
}
$('[data-cart-items]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-qty]'); if (!b) return;
  const q = (cart.get(b.dataset.qty) || 0) + +b.dataset.d;
  q > 0 ? cart.set(b.dataset.qty, q) : cart.delete(b.dataset.qty); renderCart();
});
cartDlg.addEventListener('change', renderCart);
$('[data-cart-open]').addEventListener('click', () => { renderCart(); cartDlg.showModal(); });
$('[data-cart-close]').addEventListener('click', () => cartDlg.close());
cartDlg.addEventListener('click', (e) => { if (e.target === cartDlg) cartDlg.close(); });
$('[data-cart-pay]').addEventListener('click', () => {
  const t = cartTotals();
  const lines = [...cart].map(([id, q]) => `${q} × ${PRODUCTS.find((x) => x.id === id).name}`);
  if (t.disc) lines.push(`Oferta: −${eur(t.disc)}`);
  lines.push(t.envio ? `Envío: ${eur(t.envio)}` : ($('input[name=entrega]:checked', cartDlg).value === 'envio' ? 'Envío gratis' : 'Recogida en el salón'));
  cartDlg.close();
  checkout({ title: 'Pedido de la tienda', amount: t.total, lines, onDone: () => { cart.clear(); renderCart(); } });
});

/* =======================================================================
   7. CALENDARIO DE EVENTOS
   ======================================================================= */
const evByDay = {};
EVENTS.forEach((e) => { const d = new Date(); d.setDate(d.getDate() + e.in); evByDay[ymd(d)] = { ...e, date: d }; });
let calMonth = new Date(); calMonth.setDate(1);
let calSel = null;
function renderCalendar() {
  $('[data-cal-title]').textContent = calMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const first = new Date(calMonth), start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));
  const today = ymd(new Date()); let html = '';
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const k = ymd(d), ev = evByDay[k];
    html += `<button type="button" class="cal-day ${d.getMonth() !== calMonth.getMonth() ? 'is-other' : ''} ${k === today ? 'is-today' : ''} ${ev ? 'has-event' : ''} ${k === calSel ? 'is-selected' : ''}" ${ev ? `data-ev="${k}" aria-label="${esc(ev.title)}"` : 'tabindex="-1"'}>${d.getDate()}</button>`;
  }
  $('[data-cal-grid]').innerHTML = html;
  const list = calSel ? [evByDay[calSel]] : Object.values(evByDay).sort((a, b) => a.date - b.date).slice(0, 3);
  $('[data-event-list]').innerHTML = (calSel ? '' : '<p class="text-sm text-muted">Próximos eventos</p>') + list.map((e) => `
    <article class="rounded-3xl bg-bark border border-white/5 p-5 flex gap-4">
      <div class="flex-none w-16 text-center rounded-2xl bg-ink py-2"><p class="text-xs uppercase text-rose-light">${e.date.toLocaleDateString('es-ES', { month: 'short' })}</p><p class="font-display text-3xl font-semibold leading-none">${e.date.getDate()}</p></div>
      <div class="flex-1">
        <h3 class="font-semibold">${esc(e.title)}</h3>
        <p class="text-xs text-muted mt-0.5">${e.time} · ${e.price}</p>
        <p class="text-sm text-muted mt-2">${esc(e.desc)}</p>
        <a class="inline-flex mt-3 text-sm font-semibold text-rose-light hover:text-rose" href="${wa(`Hola, quiero apuntarme a "${e.title}" del ${e.date.toLocaleDateString('es-ES')}.`)}" target="_blank" rel="noopener">Apuntarme por WhatsApp →</a>
      </div>
    </article>`).join('');
}
$('[data-cal-grid]').addEventListener('click', (e) => { const b = e.target.closest('[data-ev]'); if (b) { calSel = calSel === b.dataset.ev ? null : b.dataset.ev; renderCalendar(); } });
$('[data-cal-prev]').addEventListener('click', () => { calMonth.setMonth(calMonth.getMonth() - 1); renderCalendar(); });
$('[data-cal-next]').addEventListener('click', () => { calMonth.setMonth(calMonth.getMonth() + 1); renderCalendar(); });
renderCalendar();

/* =======================================================================
   8. DIAGNÓSTICO CAPILAR (función a medida)
   ======================================================================= */
$('[data-quiz]').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.currentTarget, tipo = f.tipo.value, prob = f.problema.value, tiempo = f.tiempo.value;
  const err = $('[data-quiz-error]'), out = $('[data-quiz-result]');
  if (!tipo || !prob || !tiempo) { err.classList.remove('hidden'); return; }
  err.classList.add('hidden');
  const R = {
    encrespado: tiempo === '5' ? ['keratina', 'serum', 'Con tan poco tiempo por la mañana, la keratina te deja el pelo liso y sin frizz hasta 4 meses.'] : ['hidratacion', 'serum', 'Una hidratación profunda sella la cutícula y el sérum controla el frizz el resto de la semana.'],
    seco: ['hidratacion', 'mascarilla', 'Tu pelo pide agua y nutrición: ritual de hidratación en el salón y mascarilla una vez por semana en casa.'],
    color: ['gloss', 'champu-color', 'Un matiz con gloss devuelve el brillo al color en 30 minutos. En casa, champú protector para que dure.'],
    caida: ['anticaida', 'tonico', 'Empezamos con un diagnóstico del cuero cabelludo y un tratamiento anticaída, y lo refuerzas con el tónico diario.'],
  }[prob];
  const extra = { rizado: ' Lo haremos con productos sin sulfatos, pensados para rizo.', fino: ' Elegiremos fórmulas ligeras para no restar volumen.', liso: '', ondulado: ' Te enseñaremos a definir la onda sin plancha.' }[tipo];
  const s = svc(R[0]), p = PRODUCTS.find((x) => x.id === R[1]);
  out.innerHTML = `
    <div class="rounded-2xl border border-rose/40 bg-rose/10 p-5">
      <p class="text-xs uppercase tracking-widest text-rose-light font-semibold">Tu recomendación</p>
      <p class="mt-2 text-sm">${esc(R[2] + extra)}</p>
      <div class="mt-4 grid sm:grid-cols-2 gap-3">
        <div class="rounded-2xl bg-ink p-4"><p class="text-xs text-muted">En el salón</p><p class="font-semibold">${esc(s.name)}</p><p class="text-sm text-muted">${dur(s.time)} · ${eur(s.price)}</p><button type="button" class="btn-primary w-full mt-3 !py-2.5 text-sm" data-quiz-book="${s.id}">Reservar</button></div>
        <div class="rounded-2xl bg-ink p-4"><p class="text-xs text-muted">En casa</p><p class="font-semibold">${esc(p.name)}</p><p class="text-sm text-muted">${p.size} · ${eur(withPct(p.price, shopPct(p)))}</p><button type="button" class="btn-ghost w-full mt-3 !py-2 text-sm" data-add="${p.id}">Añadir al carrito</button></div>
      </div>
    </div>`;
  out.classList.remove('hidden');
});
$('[data-quiz]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-quiz-book]'); if (b) bookService(b.dataset.quizBook);
  const a = e.target.closest('[data-add]'); if (a) addToCart(a.dataset.add);
});

/* Reseñas */
$('[data-reviews]').innerHTML = REVIEWS.map(([n, t, r]) => `
  <article class="rounded-3xl bg-bark border border-white/5 p-6">
    <div class="flex items-center gap-3"><span class="w-10 h-10 grid place-items-center rounded-full bg-rose/20 text-rose-light font-semibold">${esc(n[0])}</span>
    <div><p class="font-semibold leading-tight">${esc(n)}</p><p class="text-xs text-muted">${esc(t)} · Google</p></div></div>
    <p class="mt-3 text-amber-400">★★★★★</p><p class="mt-2 text-sm text-cream/80">“${esc(r)}”</p>
  </article>`).join('');

/* =======================================================================
   9. PÁGINAS OCULTAS DE ZONA (#/corte, #/color…)
   ======================================================================= */
function zonePageHTML(key) {
  const z = ZONES[key], list = SERVICES.filter((s) => s.cat === z.cat);
  const others = ZONE_ORDER.filter((k) => k !== key);
  return `
  <div class="sticky top-0 z-10 bg-ink/85 backdrop-blur border-b border-white/10">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
      <a href="#salon" class="inline-flex items-center gap-2 rounded-full border border-white/15 hover:border-white/40 px-4 py-2 text-sm font-semibold">← <span class="hidden sm:inline">Volver al salón</span><span class="sm:hidden">Salón</span></a>
      <p class="font-display text-xl font-bold truncate">${esc(z.nombre)}</p>
      <button type="button" class="rounded-full bg-rose hover:bg-rose-light text-ink text-sm font-semibold px-4 py-2" data-book="${list[0].id}">Reservar</button>
    </div>
  </div>
  <section class="relative min-h-[72svh] flex items-end overflow-hidden">
    <img src="${U(z.hero, 1600)}" alt="" class="absolute inset-0 w-full h-full object-cover" ${imgErr} />
    <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/10"></div>
    <div class="relative max-w-6xl mx-auto px-4 pb-10 pt-24 w-full">
      <p class="text-xs font-semibold uppercase tracking-[.22em] text-rose-light">Salón › ${esc(z.nombre)}</p>
      <h1 id="zone-title" class="mt-3 font-display text-5xl md:text-7xl font-bold leading-[.98] max-w-3xl">${esc(z.titulo)}</h1>
      <p class="mt-5 text-lg text-cream/80 max-w-xl">${esc(z.intro)}</p>
      <div class="mt-7 flex flex-col sm:flex-row gap-3">
        <button type="button" class="btn-primary" data-book="${list[0].id}">Reservar cita online</button>
        <a class="btn-ghost" href="${wa(`Hola, tengo una consulta sobre ${z.nombre.toLowerCase()}.`)}" target="_blank" rel="noopener">${WA_SVG} Preguntar por WhatsApp</a>
      </div>
    </div>
  </section>
  <section class="max-w-6xl mx-auto px-4 py-16">
    <p class="eyebrow">Carta y precios</p>
    <h2 class="h2">${esc(z.nombre)}</h2>
    <div class="mt-8 divide-y divide-white/10 border-y border-white/10">
      ${list.map((s) => `
        <div class="py-5 flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[200px]"><h3 class="text-lg font-semibold">${esc(s.name)}</h3><p class="text-sm text-muted">${dur(s.time)}</p></div>
          <p class="font-display text-3xl font-semibold">${eur(s.price)}</p>
          <button type="button" class="btn-ghost !py-2.5 text-sm" data-book="${s.id}">Reservar</button>
        </div>`).join('')}
    </div>
  </section>
  <section class="bg-coal py-16">
    <div class="max-w-6xl mx-auto px-4 grid lg:grid-cols-[1fr_320px] gap-8 items-center">
      <div class="ba relative aspect-[4/3] md:aspect-[16/10] rounded-3xl overflow-hidden select-none shadow-2xl shadow-black/40" data-simulate style="--pos:50%">
        <img src="${U(z.ba, 1400)}" alt="Después" class="absolute inset-0 w-full h-full object-cover" draggable="false" ${imgErr} />
        <div class="ba-before absolute inset-0"><img src="${U(z.ba, 1400)}" alt="Antes" class="absolute inset-0 w-full h-full object-cover" draggable="false" ${imgErr} /></div>
        <span class="absolute top-3 left-3 rounded-full bg-black/70 text-white text-xs font-semibold px-3 py-1">ANTES</span>
        <span class="absolute top-3 right-3 rounded-full bg-rose text-ink text-xs font-semibold px-3 py-1">DESPUÉS</span>
        <div class="ba-line absolute inset-y-0 w-0.5 -ml-px bg-cream pointer-events-none"><div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cream text-ink grid place-items-center font-bold shadow-xl">↔</div></div>
        <input type="range" min="0" max="100" value="50" aria-label="Comparar antes y después" class="absolute inset-0 w-full h-full opacity-0 m-0" />
      </div>
      <div>
        <p class="eyebrow">Antes y después</p>
        <h2 class="h2">Arrastra y compara</h2>
        <p class="mt-3 text-muted">Trabajo real de nuestro salón. Y lo que se dice de nosotras:</p>
        <blockquote class="mt-5 font-display text-2xl leading-snug">“${esc(z.review[1])}”</blockquote>
        <p class="mt-2 text-sm text-muted">${esc(z.review[0])} · ★★★★★ Google</p>
      </div>
    </div>
  </section>
  <section class="max-w-6xl mx-auto px-4 py-16">
    <h2 class="font-display text-4xl font-semibold">Trabajos recientes</h2>
    <div class="mt-6 flex md:grid md:grid-cols-4 gap-4 overflow-x-auto no-scrollbar snap-x -mx-4 px-4 md:mx-0 md:px-0">
      ${z.galeria.map(([id, cap]) => `<figure class="shrink-0 w-[72%] md:w-auto snap-start"><div class="aspect-[4/5] rounded-2xl overflow-hidden bg-bark"><img src="${U(id, 700)}" alt="${esc(cap)}" loading="lazy" class="w-full h-full object-cover hover:scale-105 transition duration-700" ${imgErr} /></div><figcaption class="mt-2 text-xs text-muted">${esc(cap)}</figcaption></figure>`).join('')}
    </div>
  </section>
  <section class="max-w-3xl mx-auto px-4 pb-16">
    <h2 class="font-display text-4xl font-semibold">Preguntas frecuentes</h2>
    <div class="mt-6 divide-y divide-white/10 border-y border-white/10">
      ${z.faq.map(([q, a]) => `<details class="py-5"><summary class="flex justify-between items-center gap-4 cursor-pointer font-semibold">${esc(q)}<span class="faq-plus text-rose text-2xl leading-none transition-transform">+</span></summary><p class="mt-3 text-muted">${esc(a)}</p></details>`).join('')}
    </div>
  </section>
  <section class="max-w-6xl mx-auto px-4 pb-28 md:pb-16">
    <h2 class="font-display text-3xl font-semibold">Sigue recorriendo el salón</h2>
    <div class="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
      ${others.map((k) => `<a href="#/${k}" class="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-bark"><img src="${U(ZONES[k].hero, 500)}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition duration-700" ${imgErr} /><div class="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent"></div><span class="absolute left-3 bottom-3 right-3 font-semibold text-sm">${ZONES[k].icono} ${esc(ZONES[k].nombre)} →</span></a>`).join('')}
    </div>
  </section>`;
}
function initBA(scope) {
  $$('.ba', scope).forEach((ba) => {
    const r = $('input', ba); const set = (v) => { r.value = v; ba.style.setProperty('--pos', v + '%'); };
    r.addEventListener('input', () => set(r.value));
    ba.addEventListener('pointerdown', (e) => { const b = ba.getBoundingClientRect(); set(Math.round(((e.clientX - b.left) / b.width) * 100)); });
    let t = 0; const demo = setInterval(() => { t++; set(50 + Math.sin(t / 6) * 12); if (t > 40) { clearInterval(demo); set(50); } }, 16);
  });
}
const page = $('#zone-page');
let openKey = null, House = null;
function openPage(key) {
  if (openKey !== key) { page.innerHTML = zonePageHTML(key); initBA(page); }
  openKey = key; page.scrollTop = 0; page.classList.add('open');
  document.documentElement.style.overflow = 'hidden';
  document.title = `${ZONES[key].nombre} · ${CONFIG.empresa}`;
  House?.focusRoom(key);
  setTimeout(() => openKey && House?.pause(true), 500);
}
function closePage() {
  if (!openKey) return;
  openKey = null; page.classList.remove('open');
  document.documentElement.style.overflow = '';
  document.title = `${CONFIG.empresa} · Peluquería & Estética en Cádiz`;
  House?.pause(false); House?.leaveRoom();
}
function route(hash = location.hash) {
  const m = hash.match(/^#\/(\w+)/);
  if (m && ZONES[m[1]]) openPage(m[1]); else closePage();
}
function go(hash) {
  try { if (location.hash !== hash) history.pushState(null, '', hash); } catch (_) {}
  route(hash);
  if (!hash.startsWith('#/')) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.addEventListener('popstate', () => route());
document.addEventListener('click', (e) => {
  const book = e.target.closest('[data-book]');
  if (book) { e.preventDefault(); bookService(book.dataset.book); return; }
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const href = a.getAttribute('href'); if (href === '#') return;
  e.preventDefault(); go(href);
});
bindWa();
renderOffers();

/* Accesos directos a zonas y modos */
$('#zone-chips').innerHTML = ZONE_ORDER.map((k) => `<button type="button" data-zone="${k}" class="shrink-0 inline-flex items-center gap-2 rounded-full bg-ink/75 backdrop-blur border border-white/10 hover:border-rose px-4 py-2 text-sm font-medium transition">${ZONES[k].icono} ${esc(ZONES[k].nombre)}</button>`).join('');
$('#zone-chips').addEventListener('click', (e) => { const b = e.target.closest('[data-zone]'); if (!b) return; House ? House.enterRoom(b.dataset.zone) : go('#/' + b.dataset.zone); });
function paintModes(mode) {
  $$('#mode-switch [data-mode]').forEach((b) => { const on = b.dataset.mode === mode; b.classList.toggle('bg-rose', on); b.classList.toggle('text-ink', on); b.classList.toggle('text-cream/80', !on); });
}
$('#mode-switch').addEventListener('click', (e) => { const b = e.target.closest('[data-mode]'); if (b && House) House.setMode(b.dataset.mode); });
paintModes('exterior');

/* =======================================================================
   10. SALÓN 3D (Three.js)
   ======================================================================= */
async function init3D() {
  const THREE = await import('three');
  const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
  const { CSS2DRenderer, CSS2DObject } = await import('three/addons/renderers/CSS2DRenderer.js');
  const { RGBELoader } = await import('three/addons/loaders/RGBELoader.js');
  const { RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js');
  const { mergeGeometries } = await import('three/addons/utils/BufferGeometryUtils.js');

  const host = $('#scene');
  const isMobile = matchMedia('(max-width: 767px)').matches;
  const PH = CONFIG.recursos;

  /* ---------- Render (con optimizaciones: resolución limitada, sombras estáticas, render bajo demanda) ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: devicePixelRatio < 1.5, powerPreference: 'high-performance' });
  const PR_MAX = Math.min(devicePixelRatio, 1.5), PR_MIN = isMobile ? 0.75 : 1;
  let pixelRatio = PR_MAX; renderer.setPixelRatio(pixelRatio);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
  host.appendChild(renderer.domElement);
  let invalidate = 3;
  function redraw(n = 2, shadows = false) { invalidate = Math.max(invalidate, n); if (shadows) renderer.shadowMap.needsUpdate = true; }

  const labelRenderer = new CSS2DRenderer({ element: $('#labels') });
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#2A1E18');
  scene.fog = new THREE.Fog('#4A3A30', 40, 120);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.07;
  controls.minDistance = 4; controls.maxDistance = 40; controls.maxPolarAngle = 1.48;
  controls.autoRotate = false; controls.screenSpacePanning = true;
  host.addEventListener('wheel', (e) => { if (!e.ctrlKey && !e.metaKey) e.stopPropagation(); }, { capture: true });   // la rueda hace scroll de la página
  controls.addEventListener('change', () => redraw(1));

  /* ---------- Recursos CC0 ---------- */
  const manager = new THREE.LoadingManager();
  const texturesReady = new Promise((res) => { manager.onLoad = res; });
  manager.onProgress = (_u, l, t) => { $('#loader-pct').textContent = Math.round((l / t) * 100) + ' %'; redraw(); };
  const texLoader = new THREE.TextureLoader(manager);
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const pmrem = new THREE.PMREMGenerator(renderer);
  const hdrRes = isMobile ? '1k' : '2k';
  new RGBELoader(manager).load(`${PH}/HDRIs/hdr/${hdrRes}/qwantani_late_afternoon_puresky_${hdrRes}.hdr`, (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = pmrem.fromEquirectangular(hdr).texture;
    scene.background = hdr; scene.backgroundIntensity = 0.5;
  });

  /* ---------- Luces ---------- */
  scene.add(new THREE.HemisphereLight('#FFE3CC', '#3A2A1C', 0.35));
  const sun = new THREE.DirectionalLight('#FFD2A8', 2.2);
  sun.position.set(-14, 20, 18); sun.castShadow = true;
  sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 });
  sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.025;
  scene.add(sun);
  [[-3, 2.9, -1], [4, 2.9, 0]].forEach(([x, y, z]) => { const l = new THREE.PointLight('#FFD3A8', 10, 10, 2); l.position.set(x, y, z); scene.add(l); });

  /* ---------- Materiales PBR ---------- */
  const T = {};
  const tex = (id, kind, srgb = false) => {
    const k = id + kind;
    if (!T[k]) {
      const t = texLoader.load(`${PH}/Textures/jpg/1k/${id}/${id}_${kind}_1k.jpg`);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      T[k] = t;
    }
    return T[k];
  };
  const pbr = (id, { tile = 1, color = '#ffffff', rough = 0.8, arm = false, normal = 1, physical = null } = {}) => {
    const o = { color, map: tex(id, 'diff', true), normalMap: tex(id, 'nor_gl'), roughness: arm ? 1 : rough };
    if (arm) o.roughnessMap = tex(id, 'arm');
    const m = physical ? new THREE.MeshPhysicalMaterial({ ...o, ...physical }) : new THREE.MeshStandardMaterial(o);
    m.normalScale.set(normal, normal); m.userData.tile = tile; return m;
  };
  const std = (c, r = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...extra });
  const phys = (o) => new THREE.MeshPhysicalMaterial(o);
  const M = {
    stucco:   pbr('white_stucco', { tile: 3, color: '#F6EFE6', rough: 0.9, normal: 0.6 }),
    stuccoB:  pbr('white_stucco', { tile: 3, color: '#E2C9BB', rough: 0.9, normal: 0.6 }),   // fachada rosada
    stuccoN:  pbr('white_stucco', { tile: 3, color: '#BFC7C2', rough: 0.9, normal: 0.6 }),   // edificio vecino
    stuccoN2: pbr('white_stucco', { tile: 3, color: '#E6D7B8', rough: 0.9, normal: 0.6 }),
    wallIn:   std('#F1E8E0', 0.92),
    blush:    std('#E7CFC3', 0.9),
    barber:   std('#26352F', 0.8),
    terrazzo: phys({ color: '#D8D1C9', roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3 }),   // microcemento pulido
    parquet:  pbr('herringbone_parquet', { tile: 1.6, arm: true, color: '#9A7E66' }),
    concrete: pbr('concrete_wall_008', { tile: 2.5, color: '#C7C5C2', rough: 0.9 }),
    asphalt:  std('#2C2B2A', 0.95),
    marble:   pbr('marble_01', { tile: 1.6, arm: true, physical: { clearcoat: 0.5, clearcoatRoughness: 0.15 } }),
    oak:      pbr('oak_veneer_01', { tile: 1.4, rough: 0.55 }),
    blackOak: pbr('black_oak_veneer', { tile: 1.4, rough: 0.5 }),
    dark:     std('#1E1C1B', 0.4, { metalness: 0.6 }),
    brass:    std('#C9A15F', 0.3, { metalness: 1 }),
    steel:    std('#C4C1BC', 0.25, { metalness: 1 }),
    lacquer:  phys({ color: '#EFE7DF', roughness: 0.3, clearcoat: 0.6 }),
    lacquerR: phys({ color: '#D9A07C', roughness: 0.35, clearcoat: 0.5 }),
    ceramic:  phys({ color: '#F6F4F0', roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 }),
    ceramicK: phys({ color: '#1C1A19', roughness: 0.15, clearcoat: 1 }),
    leather:  phys({ color: '#3A2A22', roughness: 0.55, sheen: 0.4 }),
    velvet:   phys({ color: '#B6766A', roughness: 0.8, sheen: 1, sheenColor: new THREE.Color('#F0C3A5') }),
    towel:    std('#F3EEE8', 1),
    mirror:   std('#A7AFB1', 0.16, { metalness: 1, envMapIntensity: 0.55 }),
    glass:    phys({ color: '#D7E6E8', roughness: 0.02, metalness: 0, transparent: true, opacity: 0.18, depthWrite: false, envMapIntensity: 1.6 }),
    bulb:     new THREE.MeshStandardMaterial({ color: '#FFE6C4', emissive: '#FFC27A', emissiveIntensity: 3 }),
    led:      new THREE.MeshStandardMaterial({ color: '#FFE6C4', emissive: '#FFCB8E', emissiveIntensity: 2.4 }),
    plant:    std('#4E6B3A', 0.8),
    awning:   std('#2E3A35', 0.9),
  };

  /* ---------- Helpers de geometría ---------- */
  function worldUV(g, w, h, d, t, x0, y0, z0) {
    const uv = g.attributes.uv;
    const F = [[d, h, z0, y0], [d, h, z0, y0], [w, d, x0, z0], [w, d, x0, z0], [w, h, x0, y0], [w, h, x0, y0]];
    for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i, [su, sv, ou, ov] = F[f]; uv.setXY(k, (uv.getX(k) * su + ou) / t, (uv.getY(k) * sv + ov) / t); }
  }
  const B = (p, mat, x, y, z, w, h, d, cast = true) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (mat.userData.tile) worldUV(g, w, h, d, mat.userData.tile, x - w / 2, y, z - d / 2);
    const m = new THREE.Mesh(g, mat); m.position.set(x, y + h / 2, z); m.castShadow = cast; m.receiveShadow = true; p.add(m); return m;
  };
  const R = (p, mat, x, y, z, w, h, d, r = 0.04, cast = true) => {
    const rr = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, rr), mat);
    m.position.set(x, y + h / 2, z); m.castShadow = cast; m.receiveShadow = true; p.add(m); return m;
  };
  const C = (p, mat, x, y, z, rt, rb, h, seg = 24) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y + h / 2, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m;
  };
  const S = (p, mat, x, y, z, r, seg = 16) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg * 0.75)), mat); m.position.set(x, y, z); p.add(m); return m; };
  // Pared interior: un plano que solo se ve desde dentro (desde fuera la cámara ve a través)
  const P = (p, mat, x, y, z, w, h, rotY) => {
    const g = new THREE.PlaneGeometry(w, h);
    if (mat.userData.tile) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / mat.userData.tile, uv.getY(i) * h / mat.userData.tile); }
    const m = new THREE.Mesh(g, mat); m.position.set(x, y + h / 2, z); m.rotation.y = rotY; m.receiveShadow = true; p.add(m); return m;
  };

  /* ---------- Grupos ---------- */
  const G = { shell: new THREE.Group(), front: new THREE.Group(), inside: new THREE.Group() };
  Object.values(G).forEach((g) => scene.add(g));
  const site = new THREE.Group(); scene.add(site);
  const H = 3.2;   // altura del salón

  /* ---------- Calle ---------- */
  B(site, M.concrete, 0, -0.02, 6.6, 44, 0.14, 4.2, false);          // acera
  B(site, M.dark, 0, -0.02, 8.72, 44, 0.14, 0.12, false);            // bordillo
  B(site, M.asphalt, 0, -0.06, 14, 44, 0.06, 10.5, false);           // calzada
  for (let x = -20; x <= 20; x += 4) B(site, M.wallIn, x, 0.001, 14, 2, 0.01, 0.15, false);   // línea discontinua
  B(site, M.concrete, 0, -0.02, 20.6, 44, 0.14, 2.8, false);         // acera de enfrente
  const ground = new THREE.Mesh(new THREE.CircleGeometry(140, 48), std('#2A2622', 1)); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.1; ground.receiveShadow = true; site.add(ground);
  [-9.5, 9.5].forEach((x) => { C(site, M.dark, x, 0.12, 8.2, 0.06, 0.08, 4.2, 12); B(site, M.dark, x, 4.3, 7.75, 0.08, 0.06, 0.9); S(site, M.bulb, x, 4.24, 7.35, 0.13); });
  R(site, M.oak, 3.2, 0.5, 5.5, 1.8, 0.08, 0.5, 0.02); [2.5, 3.9].forEach((x) => B(site, M.dark, x, 0.12, 5.5, 0.06, 0.38, 0.45));   // banco
  // Edificios vecinos
  B(G.shell, M.stuccoN, -12.2, 0, 0, 10, 10, 9.2); B(G.shell, M.stuccoN2, 12.2, 0, 0, 10, 8.5, 9.2);
  for (const [x0, hgt] of [[-12.2, 10], [12.2, 8.5]]) for (let fl = 3.6; fl < hgt - 1; fl += 3) for (const dx of [-3, 0, 3]) { B(G.shell, M.dark, x0 + dx, fl, 4.62, 1.3, 1.7, 0.06); B(G.shell, M.glass, x0 + dx, fl + 0.05, 4.66, 1.2, 1.6, 0.02, false); }
  B(G.shell, M.dark, -12.2, 0, 4.62, 6, 2.8, 0.06); B(G.shell, M.dark, 12.2, 0, 4.62, 6, 2.8, 0.06);   // persianas de locales

  /* ---------- Edificio (se oculta al entrar) ---------- */
  B(G.shell, M.stuccoB, -7.15, 0, 0, 0.3, 9.6, 9.2);    // medianera izq.
  B(G.shell, M.stuccoB, 7.15, 0, 0, 0.3, 9.6, 9.2);     // medianera dcha.
  B(G.shell, M.stuccoB, 0, 0, -4.65, 14.6, 9.6, 0.3);   // fondo
  B(G.shell, M.stuccoB, 0, H, 4.65, 14.6, 6.4, 0.3);    // fachada pisos superiores
  B(G.shell, M.concrete, 0, 9.6, 0, 14.9, 0.3, 9.6);    // cubierta
  B(G.shell, M.concrete, 0, 9.1, 4.9, 14.9, 0.2, 0.3);  // cornisa
  for (const fl of [4.6, 7.2]) for (const x of [-4.5, 0, 4.5]) {
    B(G.shell, M.dark, x, fl, 4.82, 1.5, 2.0, 0.06); B(G.shell, M.glass, x, fl + 0.05, 4.86, 1.4, 1.9, 0.02, false);
    B(G.shell, M.concrete, x, fl - 0.12, 5.15, 1.9, 0.12, 0.7);                                         // balcón
    // barandilla de forja: pasamanos + barrotes
    B(G.shell, M.dark, x, fl + 0.88, 5.48, 1.9, 0.04, 0.04); B(G.shell, M.dark, x - 0.93, fl + 0.88, 5.15, 0.04, 0.04, 0.7); B(G.shell, M.dark, x + 0.93, fl + 0.88, 5.15, 0.04, 0.04, 0.7);
    for (let bx = -0.9; bx <= 0.91; bx += 0.15) B(G.shell, M.dark, x + bx, fl, 5.48, 0.02, 0.88, 0.02);
  }
  // Rótulo con el nombre
  const signCanvas = document.createElement('canvas'); signCanvas.width = 2048; signCanvas.height = 256;
  const drawSign = () => {
    const c = signCanvas.getContext('2d'); c.fillStyle = '#1C1513'; c.fillRect(0, 0, 2048, 256);
    c.fillStyle = '#F0C3A5'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '600 150px "Cormorant Garamond", Georgia, serif'; c.fillText('Nácar', 760, 128);
    c.font = '500 52px Inter, sans-serif'; c.fillStyle = '#F3E7DC'; c.fillText('PELUQUERÍA · ESTÉTICA · BARBERÍA', 1400, 132);
    signTex.needsUpdate = true; redraw();
  };
  const signTex = new THREE.CanvasTexture(signCanvas); signTex.colorSpace = THREE.SRGBColorSpace; signTex.anisotropy = maxAniso;
  drawSign(); document.fonts?.load('600 150px "Cormorant Garamond"').then(drawSign).catch(() => {});
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.75), new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6, emissive: '#ffffff', emissiveMap: signTex, emissiveIntensity: 0.35 }));
  sign.position.set(0, H + 0.4, 4.84); G.shell.add(sign);
  B(G.shell, M.awning, 2.5, H - 0.15, 5.25, 8.6, 0.12, 1.1);       // toldo
  B(G.shell, M.led, 0, H + 1.25, 4.9, 13.6, 0.03, 0.05, false);   // luz del rótulo

  /* ---------- Escaparate (queda translúcido al entrar) ---------- */
  B(G.front, M.dark, 0, 0, 4.5, 14, 0.35, 0.12);                   // zócalo
  B(G.front, M.dark, 0, H - 0.12, 4.5, 14, 0.12, 0.14);             // dintel
  for (const x of [-7, -5.4, -3.6, -1, 1.8, 4.6, 7]) B(G.front, M.dark, x, 0, 4.5, 0.08, H, 0.14);
  B(G.front, M.glass, 0, 0.35, 4.52, 14, H - 0.47, 0.02, false);
  B(G.front, M.brass, -4.0, 0.95, 4.62, 0.04, 1.0, 0.04);          // tirador puerta
  B(G.front, M.dark, -4.5, 0, 4.6, 1.8, 0.02, 0.6, false);         // felpudo

  /* ---------- Interior: suelos, paredes y techo ---------- */
  B(G.inside, M.terrazzo, -1.8, -0.02, 0, 10.4, 0.04, 9, false);
  B(G.inside, M.parquet, 5.2, -0.02, -2, 3.6, 0.04, 5, false);
  B(G.inside, M.terrazzo, 5.2, -0.02, 2.5, 3.6, 0.04, 4, false);
  P(G.inside, M.blush, -3.5, 0, -4.49, 7, H, 0);                   // fondo zona corte (rosado)
  P(G.inside, M.wallIn, 1.7, 0, -4.49, 3.4, H, 0);                  // fondo lavacabezas
  P(G.inside, M.barber, 5.2, 0, -4.49, 3.6, H, 0);                  // fondo barbería
  P(G.inside, M.wallIn, -6.99, 0, 0, 9, H, Math.PI / 2);            // pared izquierda
  P(G.inside, M.barber, 6.99, 0, -2, 5, H, -Math.PI / 2);           // pared derecha barbería
  P(G.inside, M.wallIn, 6.99, 0, 2.5, 4, H, -Math.PI / 2);          // pared derecha uñas
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), std('#F4EEE8', 1)); ceil.rotation.x = Math.PI / 2; ceil.position.y = H; G.inside.add(ceil);

  // Tocadores de corte (4 en la pared del fondo)
  for (const x of [-6, -4.3, -2.6, -0.9]) {
    R(G.inside, M.led, x, 0.98, -4.47, 0.98, 1.38, 0.02, 0.45, false);
    R(G.inside, M.mirror, x, 1.0, -4.45, 0.9, 1.3, 0.02, 0.42, false);
    R(G.inside, M.oak, x, 0.78, -4.27, 1.25, 0.05, 0.42, 0.02);
    C(G.inside, M.ceramicK, x - 0.4, 0.83, -4.32, 0.035, 0.035, 0.2, 12); C(G.inside, M.lacquerR, x - 0.3, 0.83, -4.32, 0.03, 0.03, 0.16, 12);
    R(G.inside, M.lacquer, x + 0.5, 0, -4.15, 0.36, 0.6, 0.36, 0.04);   // carrito auxiliar
  }
  // Tabique de lamas entre corte y lavacabezas
  for (let z = -4.45; z < -2.6; z += 0.12) B(G.inside, M.oak, 0.05, 0, z, 0.05, 2.4, 0.06);
  // Lavacabezas (3)
  for (const x of [0.75, 1.75, 2.75]) {
    R(G.inside, M.ceramicK, x, 0, -4.15, 0.62, 0.72, 0.55, 0.04);
    R(G.inside, M.ceramic, x, 0.72, -4.1, 0.56, 0.2, 0.5, 0.16);
    C(G.inside, M.steel, x, 0.92, -4.33, 0.015, 0.015, 0.22, 10);
    const seat = R(G.inside, M.leather, x, 0.42, -3.4, 0.62, 0.16, 0.7, 0.06);
    const back = R(G.inside, M.leather, x, 0.55, -3.92, 0.6, 0.12, 0.7, 0.05); back.rotation.x = -0.75; back.position.y += 0.18;
    R(G.inside, M.leather, x, 0.28, -2.85, 0.6, 0.1, 0.5, 0.04);
    B(G.inside, M.dark, x, 0, -3.3, 0.5, 0.42, 0.5);
  }
  B(G.inside, M.oak, 1.75, 1.6, -4.38, 2.8, 0.04, 0.22);            // balda de toallas
  for (let i = 0; i < 8; i++) R(G.inside, M.towel, 0.6 + i * 0.32, 1.64, -4.37, 0.28, 0.12, 0.18, 0.04, false);
  // Barbería (2 puestos en la pared derecha)
  for (const z of [-3.4, -1.4]) {
    B(G.inside, M.blackOak, 6.94, 0.9, z, 0.04, 1.6, 1.2); B(G.inside, M.mirror, 6.91, 1.0, z, 0.02, 1.4, 1.0, false);
    R(G.inside, M.blackOak, 6.72, 0.8, z, 0.42, 0.05, 1.3, 0.02);
    C(G.inside, M.dark, 6.15, 2.45, z, 0.006, 0.006, 0.75, 6); C(G.inside, M.dark, 6.15, 2.25, z, 0.05, 0.2, 0.22, 20); S(G.inside, M.bulb, 6.15, 2.27, z, 0.05);
  }
  B(G.inside, M.blackOak, 3.65, 0, -2.6, 0.5, 0.45, 2.0);           // banco de espera
  R(G.inside, M.leather, 3.65, 0.45, -2.6, 0.46, 0.08, 1.9, 0.03);
  // Poste de barbero
  const poleC = document.createElement('canvas'); poleC.width = 64; poleC.height = 256;
  { const c = poleC.getContext('2d'); const cols = ['#F3EEE8', '#B23A3A', '#F3EEE8', '#2A4D8F']; for (let i = -8; i < 16; i++) { c.fillStyle = cols[((i % 4) + 4) % 4]; c.beginPath(); c.moveTo(0, i * 32); c.lineTo(64, i * 32 - 40); c.lineTo(64, i * 32 - 8); c.lineTo(0, i * 32 + 32); c.fill(); } }
  const poleT = new THREE.CanvasTexture(poleC); poleT.colorSpace = THREE.SRGBColorSpace; poleT.wrapS = poleT.wrapT = THREE.RepeatWrapping; poleT.repeat.set(1, 2);
  C(G.inside, new THREE.MeshPhysicalMaterial({ map: poleT, roughness: 0.2, clearcoat: 1 }), 3.7, 1.2, -0.95, 0.09, 0.09, 0.9);
  C(G.inside, M.brass, 3.7, 1.15, -0.95, 0.11, 0.11, 0.05); C(G.inside, M.brass, 3.7, 2.1, -0.95, 0.11, 0.11, 0.05);
  // Zona color (pared izquierda) + barra de color
  for (const z of [-0.6, 1.0]) {
    R(G.inside, M.led, -6.97, 0.98, z, 0.02, 1.38, 0.98, 0.45, false);
    R(G.inside, M.mirror, -6.95, 1.0, z, 0.02, 1.3, 0.9, 0.42, false);
    R(G.inside, M.oak, -6.78, 0.78, z, 0.42, 0.05, 1.25, 0.02);
  }
  R(G.inside, M.oak, -4.1, 0, 0.2, 0.7, 0.9, 1.8, 0.03);
  B(G.inside, M.marble, -4.1, 0.9, 0.2, 0.8, 0.04, 1.9);
  for (let i = 0; i < 4; i++) C(G.inside, i % 2 ? M.ceramicK : M.ceramic, -4.1 + (i % 2 ? 0.15 : -0.15), 0.94, -0.4 + i * 0.35, 0.09, 0.07, 0.07, 18);
  for (let i = 0; i < 12; i++) R(G.inside, [M.lacquerR, M.ceramicK, M.lacquer, M.brass][i % 4], -3.82, 0.94, -0.5 + i * 0.12, 0.05, 0.14, 0.05, 0.02, false);
  // Secador de casco
  C(G.inside, M.steel, -5.2, 0, 2.05, 0.25, 0.3, 0.05); C(G.inside, M.steel, -5.2, 0.05, 2.05, 0.025, 0.025, 1.25, 10);
  const hood = S(G.inside, M.lacquer, -5.2, 1.45, 1.85, 0.32); hood.scale.set(1, 0.85, 1.05);
  // Novias y maquillaje: tocador con bombillas
  R(G.inside, M.lacquer, -1.0, 0, -0.65, 1.8, 0.78, 0.55, 0.03);
  B(G.inside, M.lacquer, -1.0, 0.78, -0.9, 1.6, 1.15, 0.05);
  B(G.inside, M.mirror, -1.0, 0.86, -0.87, 1.4, 1.0, 0.02, false);
  for (let i = 0; i < 6; i++) { S(G.inside, M.bulb, -1.72 + i * 0.29, 1.96, -0.86, 0.045); }
  for (let j = 0; j < 4; j++) { S(G.inside, M.bulb, -1.75, 0.95 + j * 0.28, -0.86, 0.045); S(G.inside, M.bulb, -0.25, 0.95 + j * 0.28, -0.86, 0.045); }
  C(G.inside, M.ceramic, -0.45, 0.78, -0.6, 0.07, 0.05, 0.2, 16); for (let i = 0; i < 5; i++) S(G.inside, M.lacquerR, -0.45 + Math.cos(i) * 0.05, 1.02, -0.6 + Math.sin(i) * 0.05, 0.035, 8);
  B(G.inside, M.brass, 0.75, 0, 0.6, 0.03, 1.7, 0.03); B(G.inside, M.brass, -0.15, 0, 0.6, 0.03, 1.7, 0.03); B(G.inside, M.brass, 0.3, 1.68, 0.6, 0.93, 0.03, 0.03);   // burra de vestidos
  R(G.inside, M.towel, 0.1, 0.55, 0.6, 0.35, 1.1, 0.05, 0.03); R(G.inside, M.velvet, 0.5, 0.75, 0.6, 0.3, 0.9, 0.05, 0.03);
  // Uñas y estética
  for (const x of [4.5, 6.1]) {
    R(G.inside, M.lacquer, x, 0, 2.25, 1.1, 0.74, 0.55, 0.03); B(G.inside, M.marble, x, 0.74, 2.25, 1.14, 0.03, 0.6);
    C(G.inside, M.dark, x + 0.4, 0.77, 2.05, 0.06, 0.07, 0.02); C(G.inside, M.dark, x + 0.4, 0.79, 2.05, 0.008, 0.008, 0.4, 6); S(G.inside, M.bulb, x + 0.4, 1.2, 2.15, 0.05);
    R(G.inside, M.towel, x - 0.15, 0.77, 2.3, 0.3, 0.04, 0.22, 0.02, false);
  }
  B(G.inside, M.oak, 6.85, 1.1, 2.5, 0.22, 0.03, 2.6); B(G.inside, M.oak, 6.85, 1.45, 2.5, 0.22, 0.03, 2.6); B(G.inside, M.oak, 6.85, 1.8, 2.5, 0.22, 0.03, 2.6);
  const polish = ['#B23A4A', '#E6A6A0', '#5B1E2E', '#F2D3C5', '#2B2B2B', '#C98B6B', '#8C5A9E', '#D9A07C'].map((c) => phys({ color: c, roughness: 0.15, clearcoat: 1 }));
  for (const y of [1.13, 1.48, 1.83]) for (let i = 0; i < 18; i++) C(G.inside, polish[(i + Math.round(y * 10)) % 8], 6.85, y, 1.3 + i * 0.14, 0.025, 0.03, 0.09, 8);
  // Recepción
  R(G.inside, M.oak, -5.2, 0, 2.55, 2.2, 1.0, 0.6, 0.04);
  B(G.inside, M.marble, -5.2, 1.0, 2.55, 2.3, 0.04, 0.7);
  for (let x = -6.2; x < -4.2; x += 0.08) B(G.inside, M.blackOak, x, 0.04, 2.86, 0.04, 0.92, 0.02, false);   // frente acanalado
  B(G.inside, M.ceramicK, -5.6, 1.04, 2.5, 0.38, 0.25, 0.02);       // pantalla
  // Rótulo de neón interior
  const neonC = document.createElement('canvas'); neonC.width = 1024; neonC.height = 256;
  const drawNeon = () => { const c = neonC.getContext('2d'); c.clearRect(0, 0, 1024, 256); c.font = 'italic 600 150px "Cormorant Garamond", Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#FFB08A'; c.shadowBlur = 30; c.fillStyle = '#FFE3D2'; c.fillText('hello gorgeous', 512, 128); neonT.needsUpdate = true; redraw(); };
  const neonT = new THREE.CanvasTexture(neonC); neonT.colorSpace = THREE.SRGBColorSpace; drawNeon(); document.fonts?.load('italic 600 150px "Cormorant Garamond"').then(drawNeon).catch(() => {});
  const neon = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshBasicMaterial({ map: neonT, transparent: true, toneMapped: false }));
  neon.position.set(-6.97, 2.3, 2.9); neon.rotation.y = Math.PI / 2; G.inside.add(neon);

  /* ---------- Fusión de piezas estáticas (rendimiento) ---------- */
  function mergeGroup(g) {
    const buckets = new Map();
    for (const m of [...g.children]) {
      if (!m.isMesh || m === neon || m === sign) continue;   // la matriz de cada pieza (giro y escala) se aplica al fusionar
      const key = m.material.uuid + '|' + m.castShadow; if (!buckets.has(key)) buckets.set(key, []); buckets.get(key).push(m);
    }
    for (const list of buckets.values()) {
      if (list.length < 2) continue;
      const geos = list.map((m) => { m.updateMatrix(); const gg = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone(); return gg.applyMatrix4(m.matrix); });
      const merged = mergeGeometries(geos, false); geos.forEach((x) => x.dispose()); if (!merged) continue;
      const mesh = new THREE.Mesh(merged, list[0].material); mesh.castShadow = list[0].castShadow; mesh.receiveShadow = true;
      list.forEach((m) => { g.remove(m); m.geometry.dispose(); }); g.add(mesh);
    }
  }
  Object.values(G).forEach(mergeGroup); mergeGroup(site);

  /* ---------- Fundidos por grupo ---------- */
  const faders = {};
  for (const [name, g] of Object.entries(G)) {
    const meshes = [];
    g.traverse((o) => { if (!o.isMesh) return; o.material = o.material.clone(); o.material.userData.base = o.material.opacity; o.material.userData.baseT = o.material.transparent; o.userData.cast = o.castShadow; meshes.push(o); });
    faders[name] = { g, meshes, v: 1, to: 1 };
  }
  const applyFade = (f) => {
    f.g.visible = f.v > 0.01;
    for (const o of f.meshes) {
      const m = o.material, solid = f.v > 0.995, wantT = m.userData.baseT || !solid;
      if (m.transparent !== wantT) { m.transparent = wantT; m.needsUpdate = true; }
      m.opacity = m.userData.base * f.v; m.depthWrite = solid && !m.userData.baseT; o.castShadow = f.v > 0.5 && o.userData.cast;
    }
  };

  /* ---------- Zonas clicables ---------- */
  const ROOM3D = {
    corte:        { x: [-7, 0], z: [-4.5, -1.6] },
    tratamientos: { x: [0, 3.4], z: [-4.5, -1.6] },
    barberia:     { x: [3.4, 7], z: [-4.5, 0.6] },
    color:        { x: [-7, -3.2], z: [-1.6, 1.8] },
    novias:       { x: [-2.4, 1.2], z: [-1.6, 1.4] },
    unas:         { x: [3.4, 7], z: [0.6, 3.9] },
    recepcion:    { x: [-7, -2.4], z: [1.8, 4.4] },
  };
  const ACCENT = new THREE.Color('#F0C3A5');
  const pickables = [];
  const makePin = (text, cta, cls = '') => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<button class="pin ${cls}" type="button"><span class="pin-dot"></span><span>${text}</span>${cta ? `<span class="pin-cta">${cta}</span>` : ''}</button>`;
    return { obj: new CSS2DObject(wrap), btn: wrap.firstElementChild };
  };
  let hovered = null;
  for (const [key, r] of Object.entries(ROOM3D)) {
    const w = r.x[1] - r.x[0], d = r.z[1] - r.z[0], h = 2.6, cx = (r.x[0] + r.x[1]) / 2, cz = (r.z[0] + r.z[1]) / 2;
    r.center = new THREE.Vector3(cx, 0, cz); r.size = { w, d };
    r.hit = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false }));
    r.hit.position.set(cx, h / 2, cz); r.hit.userData.key = key; scene.add(r.hit); pickables.push(r.hit);
    r.edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w - 0.06, 0.02, d - 0.06)), new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0 }));
    r.edges.position.set(cx, 0.03, cz); scene.add(r.edges);
    r.glow = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.06, d - 0.06), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, depthWrite: false }));
    r.glow.rotation.x = -Math.PI / 2; r.glow.position.set(cx, 0.04, cz); scene.add(r.glow);
    const label = key === 'recepcion' ? '📅 Recepción' : `${ZONES[key].icono} ${ZONES[key].nombre}`;
    r.pin = makePin(label, key === 'recepcion' ? 'Reservar cita →' : 'Ver servicios →');
    r.pin.obj.position.set(cx, 2.1, cz);
    r.pin.btn.addEventListener('click', (e) => { e.stopPropagation(); activate(key); });
    r.pin.btn.addEventListener('pointerenter', () => { hovered = key; redraw(); });
    r.pin.btn.addEventListener('pointerleave', () => { hovered = null; redraw(); });
    scene.add(r.pin.obj); r.hot = 0;
  }
  const enterPin = makePin('Entrar al salón', '', 'pin-enter');
  enterPin.obj.position.set(isMobile ? -1.5 : -4.5, 1.7, 5.3);
  enterPin.btn.addEventListener('click', (e) => { e.stopPropagation(); setMode('interior'); });
  scene.add(enterPin.obj);

  /* ---------- Cámara y modos ---------- */
  const VIEWS = {
    exterior: { pos: [8, 3.4, 23], target: [0, 3.4, 0] },
    interior: { pos: [5, 13.5, 11.5], target: [0, 0, -0.3] },
  };
  const FADES = { exterior: { shell: 1, front: 1, inside: 1 }, interior: { shell: 0, front: 0.12, inside: 1 } };
  let mode = 'exterior', flight = null, paused = false, inRoom = null, zoomAnim = null;
  const viewFor = (m) => {
    const v = VIEWS[m], t = new THREE.Vector3(...v.target), p = new THREE.Vector3(...v.pos);
    const s = camera.aspect < 0.8 ? 1.8 : camera.aspect < 1.3 ? 1.3 : 1;
    return { pos: p.sub(t).multiplyScalar(s).add(t), target: t };
  };
  const roomView = (key) => {
    const r = ROOM3D[key], t = r.center.clone().add(new THREE.Vector3(0, 0.8, 0));
    const R0 = Math.max(r.size.w, r.size.d) * 0.5 + 2.2;
    return { target: t, pos: t.clone().add(new THREE.Vector3(R0 * 0.35, R0 * 1.15 + 1.5, R0 * 0.85)) };
  };
  const flyTo = ({ pos, target }, dur = 1.3, done) => { flight = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target, start: performance.now(), dur, done }; controls.enabled = false; };
  const jumpTo = ({ pos, target }) => { camera.position.copy(pos); controls.target.copy(target); redraw(); };
  function setMode(m, { fly = true } = {}) {
    mode = m; paintModes(m);
    for (const [g, v] of Object.entries(FADES[m])) faders[g].to = v;
    enterPin.obj.visible = m === 'exterior';
    for (const r of Object.values(ROOM3D)) { const on = m === 'interior'; r.pin.obj.visible = on; r.edges.visible = on; r.glow.visible = on; }
    if (fly) flyTo(viewFor(m));
    dismissHint(); redraw(2, true);
  }
  const snapFades = () => { for (const f of Object.values(faders)) { f.v = f.to; applyFade(f); } redraw(2, true); };
  function activate(key) {
    if (key === 'recepcion') { go('#reservas'); return; }
    enterRoom(key);
  }
  function enterRoom(key) {
    if (flight) return;
    if (mode !== 'interior') setMode('interior', { fly: false });
    inRoom = key;
    flyTo(roomView(key), 1.35, () => go('#/' + key));
  }

  /* ---------- Interacción ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), el = renderer.domElement;
  let pointerDirty = false, down = null;
  const toNdc = (e) => { const b = el.getBoundingClientRect(); ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); };
  const pick = () => { if (mode !== 'interior') return null; ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(pickables, false)[0]; return h ? h.object.userData.key : null; };
  el.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { toNdc(e); pointerDirty = true; redraw(1); } });
  el.addEventListener('pointerleave', () => { hovered = null; el.style.cursor = ''; redraw(); });
  el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  el.addEventListener('pointerup', (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), quick = performance.now() - down.t < 450; down = null;
    if (moved > 7 || !quick) return;
    toNdc(e); const key = pick();
    if (key) activate(key); else if (mode === 'exterior') setMode('interior');
  });
  const hint = $('#hint'); const dismissHint = () => { hint.style.opacity = 0; };
  setTimeout(dismissHint, 9000);
  controls.addEventListener('start', dismissHint);
  const zoomBy = (f) => {
    const off = camera.position.clone().sub(controls.target);
    const len = THREE.MathUtils.clamp(off.length() * f, controls.minDistance, controls.maxDistance);
    zoomAnim = { from: camera.position.clone(), to: controls.target.clone().add(off.setLength(len)), start: performance.now() };
  };
  $('#zoom-btns').addEventListener('click', (e) => { const b = e.target.closest('[data-zoom]'); if (b) zoomBy(b.dataset.zoom === 'in' ? 0.75 : 1.33); });

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h); labelRenderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); redraw();
  };
  new ResizeObserver(resize).observe(host); resize();

  /* ---------- Bucle (solo dibuja cuando algo cambia) ---------- */
  const clock = new THREE.Clock();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const tmin = new THREE.Vector3(-9, 0, -6), tmax = new THREE.Vector3(9, 5, 9);
  let frames = 0, frameTime = 0;
  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (paused) return;
    let active = false;
    if (flight) {
      active = true;
      const k = ease(Math.min(1, (performance.now() - flight.start) / 1000 / flight.dur));
      camera.position.lerpVectors(flight.p0, flight.p1, k); controls.target.lerpVectors(flight.t0, flight.t1, k);
      if (k >= 1) { const d = flight.done; flight = null; controls.enabled = true; d && d(); }
    }
    for (const f of Object.values(faders)) if (Math.abs(f.v - f.to) > 0.002) {
      f.v += (f.to - f.v) * Math.min(1, dt * 5); if (Math.abs(f.v - f.to) <= 0.002) f.v = f.to;
      applyFade(f); active = true; renderer.shadowMap.needsUpdate = true;
    }
    if (zoomAnim) {
      active = true;
      if (flight) zoomAnim = null;
      else { const k = ease(Math.min(1, (performance.now() - zoomAnim.start) / 400)); camera.position.lerpVectors(zoomAnim.from, zoomAnim.to, k); if (k >= 1) zoomAnim = null; }
    }
    if (pointerDirty && !flight) { pointerDirty = false; const k = pick(); if (k !== hovered) { hovered = k; el.style.cursor = k ? 'pointer' : ''; } }
    for (const [k, r] of Object.entries(ROOM3D)) {
      const target = k === hovered || k === inRoom ? 1 : 0, diff = target - r.hot;
      if (Math.abs(diff) > 0.003) { active = true; r.hot += diff * Math.min(1, dt * 8); } else r.hot = target;
      r.edges.material.opacity = 0.35 + r.hot * 0.65; r.glow.material.opacity = r.hot * 0.2;
      r.pin.btn.classList.toggle('is-hot', r.hot > 0.5);
    }
    const moved = controls.update();
    controls.target.clamp(tmin, tmax);
    if (!(moved || active || invalidate > 0)) { frames = 0; return; }
    if (invalidate > 0) invalidate--;
    renderer.render(scene, camera); labelRenderer.render(scene, camera);
    frames++; frameTime += dt;
    if (frames >= 45) {
      if (frameTime / frames > 1 / 40 && pixelRatio > PR_MIN) { pixelRatio = Math.max(PR_MIN, pixelRatio - 0.25); renderer.setPixelRatio(pixelRatio); resize(); }
      frames = 0; frameTime = 0;
    }
  }

  /* ---------- Muebles reales escaneados (Poly Haven, CC0) ----------
     [id, x, y, z, rotación°, opciones] — todos van al grupo interior */
  const FURN = [
    ...[-6, -4.3, -2.6, -0.9].map((x) => ['BarberShopChair_01', x, 0, -3.15, 180]),
    ['BarberShopChair_01', -5.85, 0, -0.6, -90], ['BarberShopChair_01', -5.85, 0, 1.0, -90],
    ['BarberShopChair_01', 5.85, 0, -3.4, 90], ['BarberShopChair_01', 5.85, 0, -1.4, 90],
    ['GreenChair_01', 4.5, 0, 3.05, 180], ['GreenChair_01', 6.1, 0, 3.05, 180],
    ['Ottoman_01', 4.5, 0, 1.55, 0], ['Ottoman_01', 6.1, 0, 1.55, 0],
    ['Ottoman_01', -1.0, 0, 0.0, 0],
    ['sofa_03', -0.6, 0, 3.85, 180], ['coffee_table_round_01', -0.6, 0, 2.85, 0],
    ['wooden_display_shelves_01', -6.75, 0, 3.75, 90],
    ['potted_plant_04', 0.9, 0, 4.0, 0], ['potted_plant_04', -2.2, 0, 4.0, 40, { deco: true }], ['potted_plant_04', 3.15, 0, -4.1, 0, { deco: true }],
    ['ceramic_vase_03', -4.5, 1.04, 2.45, 0, { deco: true }],
    ['modern_ceiling_lamp_01', -5.2, H, 2.55, 0, { ceiling: true }], ['modern_ceiling_lamp_01', -4.1, H, 0.2, 0, { ceiling: true }],
    ['modern_ceiling_lamp_01', -1.0, H, -0.2, 0, { ceiling: true }], ['modern_ceiling_lamp_01', -0.6, H, 2.85, 0, { ceiling: true }],
  ];
  function addFurniture(obj) {
    obj.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.material = o.material.clone(); o.material.userData.base = o.material.opacity; o.material.userData.baseT = o.material.transparent; o.userData.cast = true; faders.inside.meshes.push(o); } });
    G.inside.add(obj); applyFade(faders.inside); redraw(2, true);
  }
  async function loadFurniture() {
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const fm = new THREE.LoadingManager();
    fm.setURLModifier((u) => u.replace(/\/Models\/gltf\/1k\/([^/]+)\/textures\//, '/Models/jpg/1k/$1/'));
    const loader = new GLTFLoader(fm), cache = {};
    const get = (id) => (cache[id] ||= loader.loadAsync(`${PH}/Models/gltf/1k/${id}/${id}_1k.gltf`).then((g) => g.scene).catch((e) => { console.warn('[Salón 3D] Mueble no disponible:', id, e); return null; }));
    await Promise.all(FURN.map(async ([id, x, y, z, rot = 0, opt = {}]) => {
      if (opt.deco && isMobile) return;
      const src = await get(id); if (!src) return;
      const o = src.clone(true); o.rotation.y = THREE.MathUtils.degToRad(rot); o.updateMatrixWorld(true);
      const bb = new THREE.Box3().setFromObject(o), c = bb.getCenter(new THREE.Vector3());
      o.position.set(x - c.x, opt.ceiling ? y - bb.max.y : y - bb.min.y, z - c.z);
      addFurniture(o);
    }));
  }

  /* ---------- Arranque ---------- */
  setMode('exterior', { fly: false }); jumpTo(viewFor('exterior')); snapFades();
  tick();
  Promise.race([texturesReady, new Promise((r) => setTimeout(r, 15000))]).then(() => { $('#loader').classList.add('done'); loadFurniture(); redraw(); });
  if (/[?&]debug/.test(location.search)) window.__salon = { renderer, scene, camera };

  return {
    setMode, enterRoom: activate,
    pause(v) { paused = v; if (!v) { clock.getDelta(); redraw(); } },
    focusRoom(key) { if (mode !== 'interior') { setMode('interior', { fly: false }); snapFades(); } inRoom = key; if (!flight) jumpTo(roomView(key)); },
    leaveRoom() { inRoom = null; flight = null; flyTo(viewFor(mode), 1.2); },
  };
}

/* =======================================================================
   11. ARRANQUE
   ======================================================================= */
try {
  const c = document.createElement('canvas');
  if (!(c.getContext('webgl2') || c.getContext('webgl'))) throw new Error('Sin WebGL');
  House = await init3D();
} catch (err) {
  console.warn('3D no disponible:', err);
  $('#loader .bar').parentElement.classList.add('hidden');
  $('#loader-error').classList.remove('hidden');
  $('#loader').style.pointerEvents = 'none';
  $('#mode-switch').classList.add('hidden');
}
route();
})();
