/* ==========================================================================
   NÁCAR STUDIO — avanzado.js
   Funciones del plan Avanzado: bonos y tarjetas regalo con pago online,
   tienda con carrito, agenda de eventos, ofertas programadas por fecha
   y diagnóstico capilar. Se apoya en la reserva de main.js.
   Patrón IIFE (sin módulos) para que funcione en cualquier hosting.
   ========================================================================== */
(function () {
  "use strict";

  var B = window.__BRAND__ || {};

  /* ---------- Datos (editar aquí) ---------- */
  var BONOS = [
    { id: "bono-ritual", name: "Bono Ritual", price: 81, per: "3 sesiones", items: ["3 rituales de hidratación", "Masaje craneal con vapor", "Válido 6 meses"] },
    { id: "regalo", name: "Tarjeta regalo", price: 50, per: "cualquier servicio", items: ["La envías por WhatsApp o email", "Sirve para servicios y tienda", "Válida 1 año"], featured: true },
    { id: "club", name: "Club Barbería", price: 39, per: "al mes", items: ["2 cortes caballero al mes", "Arreglo de barba incluido", "Sin permanencia"] }
  ];

  var PRODUCTS = [
    { id: "champu", cat: "cuidado", name: "Champú nutritivo", size: "300 ml", price: 18.9, shape: "bottle", c: "#F7E6DA" },
    { id: "mascarilla", cat: "cuidado", name: "Mascarilla reparadora", size: "250 ml", price: 24.5, shape: "jar", c: "#E2C3AE", tag: "Más vendido" },
    { id: "serum", cat: "cuidado", name: "Sérum anti-encrespado", size: "50 ml", price: 21, shape: "dropper", c: "#A88C7D" },
    { id: "rizos", cat: "cuidado", name: "Crema de rizos", size: "200 ml", price: 19.5, shape: "tube", c: "#F7E6DA" },
    { id: "gloss", cat: "cuidado", name: "Champú protector del color", size: "300 ml", price: 19.9, shape: "bottle", c: "#B97E5A" },
    { id: "texturizante", cat: "styling", name: "Spray texturizante", size: "150 ml", price: 16.5, shape: "spray", c: "#8C776C" },
    { id: "cera", cat: "barberia", name: "Cera mate", size: "100 ml", price: 13.9, shape: "jar", c: "#4B3A33" },
    { id: "aceite", cat: "barberia", name: "Aceite de barba", size: "30 ml", price: 16, shape: "dropper", c: "#D9A07C" }
  ];
  var SHOP_CATS = { todo: "Todo", cuidado: "Cuidado", styling: "Peinado", barberia: "Barbería" };

  // Los eventos se colocan a partir de hoy para que la agenda siempre tenga actividad
  var EVENTS = [
    { in: 4, title: "Taller de rizo con Inés", time: "18:00–20:00", price: "25 €", desc: "Método curly paso a paso: lavado, definición y secado al aire. Máximo 8 personas." },
    { in: 10, title: "Noche de balayage", time: "19:00–22:00", price: "Entrada libre", desc: "Lucía hace diagnóstico de color gratis y hay −15 % en mechas reservadas esa noche." },
    { in: 17, title: "Barber Thursday", time: "17:00–21:00", price: "Entrada libre", desc: "Marco hace degradados exprés y regalamos cera con cada corte." },
    { in: 24, title: "Masterclass de recogidos", time: "11:00–13:30", price: "35 €", desc: "Sara enseña tres recogidos de invitada que te puedes hacer tú sola." },
    { in: 38, title: "Pasarela de novias 2027", time: "18:30", price: "Con invitación", desc: "Tendencias de peinado nupcial y agenda abierta para pruebas." }
  ];

  // Ofertas: se activan y retiran solas según el día (formato mes-día)
  var OFFERS = [
    { from: "10-15", to: "11-22", label: "Otoño: −15 % en productos de cuidado", shop: 15, shopCat: "cuidado" },
    { from: "11-23", to: "11-30", label: "Black Week: −25 % en tienda y −20 % en bonos", shop: 25, bonos: 20 },
    { from: "12-01", to: "12-24", label: "Navidad: tarjetas regalo y bonos −15 %", bonos: 15 },
    { from: "01-07", to: "01-31", label: "Rebajas: −20 % en toda la tienda", shop: 20 },
    { from: "02-07", to: "02-14", label: "San Valentín: −10 % en bonos para regalar", bonos: 10 },
    { from: "04-24", to: "05-03", label: "Día de la Madre: −15 % en bonos", bonos: 15 },
    { from: "07-01", to: "08-31", label: "Verano: −10 % en productos de cuidado", shop: 10, shopCat: "cuidado" }
  ];

  /* ---------- Utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function eur(n) { return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: n % 1 ? 2 : 0 }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function wa(text) { return "https://wa.me/" + (B.whatsapp || "") + "?text=" + encodeURIComponent(text); }
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }
  var toastTimer;
  function toast(msg) {
    var t = $("[data-toast]"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 2600);
  }

  /* ---------- Ofertas programadas ---------- */
  var simDate = new Date();
  function md(d) { return pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function activeOffer() { var k = md(simDate); for (var i = 0; i < OFFERS.length; i++) if (k >= OFFERS[i].from && k <= OFFERS[i].to) return OFFERS[i]; return null; }
  function shopPct(p) { var o = activeOffer(); return o && o.shop && (!o.shopCat || o.shopCat === p.cat) ? o.shop : 0; }
  function bonoPct() { var o = activeOffer(); return (o && o.bonos) || 0; }
  function withPct(price, pct) { return Math.round(price * (1 - pct / 100) * 100) / 100; }
  function fmtMD(s) {
    var p = s.split("-"); return +p[1] + " " + ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][+p[0] - 1];
  }
  function renderOffers() {
    var o = activeOffer(), bar = $("[data-offer-bar]");
    bar.hidden = !o; document.body.classList.toggle("has-offer", !!o);
    if (o) bar.innerHTML = "<b>●</b> " + esc(o.label) + " — Ver tienda →";
    $("[data-offer-list]").innerHTML = OFFERS.map(function (x) {
      return '<li class="offer' + (x === o ? " is-on" : "") + '"><p class="offer__when">' + fmtMD(x.from) + " — " + fmtMD(x.to) + (x === o ? " · Activa ahora" : "") +
        '</p><p class="offer__t">' + esc(x.label) + "</p></li>";
    }).join("");
    renderBonos(); renderShop(); renderCart();
  }
  function initOffers() {
    var input = $("[data-sim-date]");
    input.value = ymd(simDate);
    input.addEventListener("change", function () {
      if (!input.value) return;
      simDate = new Date(input.value + "T12:00"); renderOffers();
      toast("Web mostrada como el " + simDate.toLocaleDateString("es-ES"));
    });
    $("[data-sim-today]").addEventListener("click", function () { simDate = new Date(); input.value = ymd(simDate); renderOffers(); });
  }

  /* ---------- Pago online (simulado) ---------- */
  var payDone = null;
  function checkout(o) {
    var dlg = $("[data-checkout]");
    $("[data-co-name]").textContent = o.title;
    $("[data-co-amount]").textContent = eur(o.amount);
    $("[data-co-lines]").innerHTML = (o.lines || []).map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("");
    $("[data-co-pay]").hidden = false; $("[data-co-done]").hidden = true;
    var btn = $("[data-co-confirm]"); btn.disabled = false; btn.textContent = "Pagar " + eur(o.amount);
    $("[data-co-extra]").innerHTML = o.extra || "";
    payDone = o.onDone; dlg.showModal();
  }
  function initCheckout() {
    $("[data-co-confirm]").addEventListener("click", function () {
      var btn = this; btn.disabled = true; btn.textContent = "Procesando…";
      setTimeout(function () {
        var metodo = $('[data-checkout] input[name="metodo"]:checked').value;
        $("[data-co-receipt]").textContent = "Pagado con " + metodo + ". Te hemos enviado el recibo por email y WhatsApp. Ref. NC-" + Math.random().toString(36).slice(2, 8).toUpperCase() + ".";
        $("[data-co-pay]").hidden = true; $("[data-co-done]").hidden = false;
        if (payDone) payDone();
      }, 1200);
    });
  }

  /* ---------- Bonos ---------- */
  function renderBonos() {
    var pct = bonoPct();
    $("[data-bonos]").innerHTML = BONOS.map(function (b) {
      var p = withPct(b.price, pct);
      return '<article class="bono' + (b.featured ? " bono--featured" : "") + '">' +
        '<p class="bono__k">' + (b.featured ? "El más regalado" : "Pago online") + "</p>" +
        '<p class="bono__name">' + esc(b.name) + "</p>" +
        "<ul>" + b.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>" +
        '<p class="bono__price">' + eur(p) + "<small>" + esc(b.per) + "</small></p>" +
        (pct ? '<p class="bono__was">Antes ' + eur(b.price) + " · −" + pct + " %</p>" : "") +
        '<hr class="dash" /><button type="button" class="btn btn--ghost" data-buy="' + b.id + '">Comprar online</button>' +
        "</article>";
    }).join("");
  }
  function initBonos() {
    $("[data-bonos]").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-buy]"); if (!btn) return;
      var b = BONOS.filter(function (x) { return x.id === btn.dataset.buy; })[0];
      var amount = withPct(b.price, bonoPct());
      checkout({
        title: b.name, amount: amount, lines: [b.per].concat(b.items),
        onDone: function () { toast(b.name + " comprado"); },
        extra: '<a class="btn btn--ghost" target="_blank" rel="noopener" href="' + wa("Hola, acabo de comprar " + b.name + " online. ¿Me ayudáis a usarlo?") + '">Escribir por WhatsApp</a>'
      });
    });
  }

  /* ---------- Tienda y carrito ---------- */
  function productSVG(p) {
    var c = p.c, cap = "#140E0C", label = "rgba(20,14,12,.16)";
    var shapes = {
      bottle: '<rect x="36" y="8" width="28" height="18" rx="3" fill="' + cap + '"/><rect x="20" y="24" width="60" height="104" rx="14" fill="' + c + '"/><rect x="30" y="64" width="40" height="32" rx="2" fill="' + label + '"/>',
      jar: '<rect x="16" y="52" width="68" height="14" rx="4" fill="' + cap + '"/><rect x="14" y="64" width="72" height="64" rx="12" fill="' + c + '"/><rect x="26" y="84" width="48" height="24" rx="2" fill="' + label + '"/>',
      dropper: '<rect x="44" y="4" width="12" height="22" rx="6" fill="' + cap + '"/><rect x="38" y="24" width="24" height="12" rx="2" fill="#A88C7D"/><rect x="26" y="36" width="48" height="92" rx="12" fill="' + c + '"/><rect x="34" y="70" width="32" height="30" rx="2" fill="' + label + '"/>',
      tube: '<rect x="30" y="112" width="40" height="16" rx="3" fill="' + cap + '"/><path d="M24 14h52l-6 98H30z" fill="' + c + '"/><rect x="34" y="46" width="32" height="34" rx="2" fill="' + label + '"/>',
      spray: '<rect x="40" y="4" width="22" height="14" rx="3" fill="' + cap + '"/><rect x="58" y="8" width="16" height="5" rx="2" fill="' + cap + '"/><rect x="30" y="18" width="40" height="12" rx="2" fill="#A88C7D"/><rect x="26" y="30" width="48" height="98" rx="10" fill="' + c + '"/><rect x="34" y="66" width="32" height="36" rx="2" fill="' + label + '"/>'
    };
    var textFill = p.c === "#4B3A33" || p.c === "#8C776C" || p.c === "#B97E5A" || p.c === "#D9A07C" ? "rgba(247,230,218,.75)" : "rgba(20,14,12,.6)";
    return '<svg viewBox="0 0 100 132" aria-hidden="true">' + shapes[p.shape] +
      '<text x="50" y="' + (p.shape === "jar" ? 100 : p.shape === "tube" ? 67 : 86) + '" text-anchor="middle" font-family="Inter, Arial" font-size="8" font-weight="500" letter-spacing="1" fill="' + textFill + '">NÁCAR</text></svg>';
  }
  var shopFilter = "todo";
  function renderShop() {
    $("[data-shop]").innerHTML = PRODUCTS.filter(function (p) { return shopFilter === "todo" || p.cat === shopFilter; }).map(function (p) {
      var pct = shopPct(p), price = withPct(p.price, pct);
      return '<article class="product">' +
        '<div class="product__art">' + productSVG(p) + (pct ? '<span class="product__tag product__tag--ember">−' + pct + " %</span>" : p.tag ? '<span class="product__tag">' + esc(p.tag) + "</span>" : "") + "</div>" +
        '<p class="product__name">' + esc(p.name) + "</p>" +
        '<div class="product__meta"><span>' + esc(p.size) + '</span><span class="product__price">' + eur(price) + (pct ? "<s>" + eur(p.price) + "</s>" : "") + "</span></div>" +
        '<button type="button" class="btn btn--ghost btn--sm" data-add="' + p.id + '">Añadir</button>' +
        "</article>";
    }).join("");
  }
  var cart = {};
  function cartCount() { var n = 0; for (var k in cart) n += cart[k]; return n; }
  function product(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1; renderCart(); toast("Añadido al carrito");
    var b = $(".cart-btn"); b.classList.remove("is-bump"); void b.offsetWidth; b.classList.add("is-bump");
  }
  function totals() {
    var sub = 0, disc = 0;
    for (var id in cart) { var p = product(id); sub += p.price * cart[id]; disc += (p.price - withPct(p.price, shopPct(p))) * cart[id]; }
    var after = sub - disc;
    var envio = $('[data-cart] input[name="entrega"]:checked').value === "envio" && after < 45 ? 3.9 : 0;
    return { sub: sub, disc: disc, envio: envio, total: Math.round((after + envio) * 100) / 100 };
  }
  function renderCart() {
    var n = cartCount();
    $("[data-cart-count]").textContent = n;
    $("[data-cart-empty]").hidden = n > 0;
    $("[data-cart-foot]").hidden = n === 0;
    $("[data-cart-items]").innerHTML = Object.keys(cart).map(function (id) {
      var p = product(id);
      return '<li class="cart-item"><div class="product__art">' + productSVG(p) + "</div>" +
        "<div><p>" + esc(p.name) + "</p><small>" + eur(withPct(p.price, shopPct(p))) + "</small></div>" +
        '<div class="qty"><button type="button" data-qty="' + id + '" data-d="-1" aria-label="Quitar uno">−</button><span>' + cart[id] + '</span><button type="button" data-qty="' + id + '" data-d="1" aria-label="Añadir uno">+</button></div></li>';
    }).join("");
    if (!n) return;
    var t = totals();
    $("[data-ship-price]").textContent = t.sub - t.disc >= 45 ? "gratis" : "3,90 €";
    var rows = [["Subtotal", eur(t.sub)]];
    if (t.disc) rows.push(["Oferta", "−" + eur(t.disc)]);
    rows.push(["Envío", t.envio ? eur(t.envio) : "Gratis"], ["Total", eur(t.total)]);
    $("[data-cart-totals]").innerHTML = rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("");
  }
  function initShop() {
    $("[data-shop-filters]").innerHTML = Object.keys(SHOP_CATS).map(function (k) {
      return '<button type="button" class="pill' + (k === "todo" ? " is-active" : "") + '" aria-pressed="' + (k === "todo") + '" data-shop-filter="' + k + '">' + SHOP_CATS[k] + "</button>";
    }).join("");
    $("[data-shop-filters]").addEventListener("click", function (e) {
      var b = e.target.closest("[data-shop-filter]"); if (!b) return;
      shopFilter = b.dataset.shopFilter;
      $$("[data-shop-filter]").forEach(function (x) { var on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-pressed", on); });
      renderShop();
    });
    document.addEventListener("click", function (e) { var b = e.target.closest("[data-add]"); if (b) addToCart(b.dataset.add); });

    var dlg = $("[data-cart]");
    $("[data-cart-open]").addEventListener("click", function () { renderCart(); dlg.showModal(); });
    $("[data-cart-close]").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("change", renderCart);
    $("[data-cart-items]").addEventListener("click", function (e) {
      var b = e.target.closest("[data-qty]"); if (!b) return;
      var q = (cart[b.dataset.qty] || 0) + (+b.dataset.d);
      if (q > 0) cart[b.dataset.qty] = q; else delete cart[b.dataset.qty];
      renderCart();
    });
    $("[data-cart-pay]").addEventListener("click", function () {
      var t = totals();
      var lines = Object.keys(cart).map(function (id) { return cart[id] + " × " + product(id).name; });
      if (t.disc) lines.push("Oferta: −" + eur(t.disc));
      lines.push($('[data-cart] input[name="entrega"]:checked').value === "envio" ? (t.envio ? "Envío: " + eur(t.envio) : "Envío gratis") : "Recogida en el estudio");
      dlg.close();
      checkout({ title: "Pedido de la tienda", amount: t.total, lines: lines, onDone: function () { cart = {}; renderCart(); } });
    });
  }

  /* ---------- Agenda ---------- */
  var evByDay = {}, calMonth = new Date(), calSel = null;
  function renderCalendar() {
    $("[data-cal-title]").textContent = calMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    var start = new Date(calMonth); start.setDate(1 - ((calMonth.getDay() + 6) % 7));
    var today = ymd(new Date()), html = "";
    for (var i = 0; i < 42; i++) {
      var d = new Date(start); d.setDate(start.getDate() + i);
      var k = ymd(d), ev = evByDay[k];
      var cls = "cal__day" + (d.getMonth() !== calMonth.getMonth() ? " is-other" : "") + (k === today ? " is-today" : "") + (ev ? " has-event" : "") + (k === calSel ? " is-selected" : "");
      html += ev ? '<button type="button" class="' + cls + '" data-ev="' + k + '" aria-label="' + esc(ev.title) + '">' + d.getDate() + "</button>"
                 : '<span class="' + cls + '">' + d.getDate() + "</span>";
    }
    $("[data-cal-grid]").innerHTML = html;
    var list = calSel ? [evByDay[calSel]] : Object.keys(evByDay).sort().map(function (k) { return evByDay[k]; }).slice(0, 3);
    $("[data-event-list]").innerHTML = (calSel ? "" : '<p class="events__k">Próximos eventos</p>') + list.map(function (e) {
      return '<article class="event"><div class="event__date"><small>' + e.date.toLocaleDateString("es-ES", { month: "short" }) + "</small><b>" + e.date.getDate() + "</b></div>" +
        '<div><p class="event__t">' + esc(e.title) + '</p><p class="event__m">' + esc(e.time) + " · " + esc(e.price) + '</p><p class="event__d">' + esc(e.desc) + "</p>" +
        '<a class="link" target="_blank" rel="noopener" href="' + wa('Hola, quiero apuntarme a "' + e.title + '" del ' + e.date.toLocaleDateString("es-ES") + ".") + '">Apuntarme por WhatsApp</a></div></article>';
    }).join("");
  }
  function initAgenda() {
    EVENTS.forEach(function (e) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + e.in); evByDay[ymd(d)] = Object.assign({ date: d }, e); });
    calMonth.setDate(1);
    $("[data-cal-grid]").addEventListener("click", function (e) {
      var b = e.target.closest("[data-ev]"); if (!b) return;
      calSel = calSel === b.dataset.ev ? null : b.dataset.ev; renderCalendar();
    });
    $("[data-cal-prev]").addEventListener("click", function () { calMonth.setMonth(calMonth.getMonth() - 1); renderCalendar(); });
    $("[data-cal-next]").addEventListener("click", function () { calMonth.setMonth(calMonth.getMonth() + 1); renderCalendar(); });
    renderCalendar();
  }

  /* ---------- Diagnóstico capilar ---------- */
  function svcName(id) { var el = $('.svc[data-service="' + id + '"]'); return el ? el.dataset.name : id; }
  function svcMeta(id) { var el = $('.svc[data-service="' + id + '"]'); return el ? el.dataset.duration + " min · " + el.querySelector(".svc__price").textContent : ""; }
  function initQuiz() {
    var form = $("[data-quiz]"), out = $("[data-quiz-result]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var tipo = form.tipo.value, prob = form.problema.value, tiempo = form.tiempo.value;
      if (!tipo || !prob || !tiempo) { $("[data-quiz-error]").hidden = false; return; }
      $("[data-quiz-error]").hidden = true;
      var R = {
        encrespado: tiempo === "5" ? ["keratina", "serum", "Con cinco minutos por la mañana, el alisado de keratina te deja el pelo manejable hasta cuatro meses."] : ["ritual", "serum", "Un ritual de hidratación sella la cutícula y el sérum controla el encrespado el resto de la semana."],
        seco: ["ritual", "mascarilla", "Tu pelo pide nutrición: ritual con vapor en el estudio y mascarilla una vez por semana en casa."],
        color: ["matiz", "gloss", "Un baño de color devuelve el brillo en una hora. En casa, champú protector para que dure."],
        forma: ["corte-mujer", "texturizante", "Lo que falta es un corte pensado para tu rutina. Te lo dejamos para que funcione también la tercera semana."]
      }[prob];
      if (tipo === "rizado" && prob !== "color") R = ["corte-mujer", "rizos", "El rizo se corta en seco, rizo a rizo. Inés es especialista en método curly y te enseña a definirlo en casa."];
      var extra = { fino: " Usaremos fórmulas ligeras para no restar volumen.", ondulado: " Te enseñamos a marcar la onda sin plancha.", liso: "", rizado: "" }[tipo];
      var p = product(R[1]);
      out.innerHTML = '<p class="label">Tu recomendación</p><p class="quiz__text">' + esc(R[2] + extra) + "</p>" +
        '<div class="quiz__picks">' +
        '<div class="quiz__pick"><p class="k">En el estudio</p><p class="t">' + esc(svcName(R[0])) + "</p><p>" + esc(svcMeta(R[0])) + '</p><button type="button" class="btn btn--filled" data-quiz-book="' + R[0] + '">Reservar</button></div>' +
        '<div class="quiz__pick"><p class="k">En casa</p><p class="t">' + esc(p.name) + "</p><p>" + esc(p.size) + " · " + eur(withPct(p.price, shopPct(p))) + '</p><button type="button" class="btn btn--ghost" data-add="' + p.id + '">Añadir al carrito</button></div>' +
        "</div>";
      out.hidden = false;
    });
    // "Reservar" usa el sistema de citas del estudio (main.js): pulsa el botón de ese servicio en la carta
    out.addEventListener("click", function (e) {
      var b = e.target.closest("[data-quiz-book]"); if (!b) return;
      var btn = $('.svc [data-book="' + b.dataset.quizBook + '"]');
      if (btn) btn.click();
    });
  }

  function init() {
    safe(initCheckout, "checkout");
    safe(initBonos, "bonos");
    safe(initShop, "shop");
    safe(initAgenda, "agenda");
    safe(initOffers, "offers");
    safe(initQuiz, "quiz");
    safe(renderOffers, "renderOffers");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
