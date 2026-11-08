/* Olimpo Club — plan Avanzado: reservas, pagos, eventos, ofertas programadas y test */
(function () {
  "use strict";

  var toast = function (message) { window.Olimpo && window.Olimpo.toast(message); };
  var canHover = window.matchMedia("(hover: hover)").matches;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Datos del gimnasio ---------- */

  var PLANS = [
    { id: "mensual", name: "Mensual", price: 39, unit: "/mes", desc: "Acceso completo y clases ilimitadas." },
    { id: "trimestral", name: "Trimestral", price: 99, unit: "/3 meses", desc: "Ahorras 18 € frente a la mensual.", featured: true },
    { id: "anual", name: "Anual", price: 349, unit: "/año", desc: "El mejor precio: menos de 30 € al mes." },
    { id: "bono", name: "Bono 10 clases", price: 60, unit: "", desc: "Para venir cuando puedas. Válido 3 meses." }
  ];

  // Productos de la tienda online
  var PRODUCTS = [
    { id: "proteina", cat: "suplementos", name: "Proteína whey 1 kg", detail: "Sabor chocolate · 33 tomas", price: 34.9, art: "tub", tone: "#3a2418" },
    { id: "creatina", cat: "suplementos", name: "Creatina monohidrato 300 g", detail: "Sin sabor · 100 tomas", price: 24.9, art: "jar", tone: "#1d2a33" },
    { id: "camiseta", cat: "ropa", name: "Camiseta técnica Olimpo", detail: "Tejido transpirable · Tallas S–XXL", price: 19.9, art: "shirt", tone: "#33221c" },
    { id: "sudadera", cat: "ropa", name: "Sudadera Olimpo Club", detail: "Algodón orgánico · Unisex", price: 39.9, art: "hoodie", tone: "#24242a" },
    { id: "guantes", cat: "accesorios", name: "Guantes de boxeo 12 oz", detail: "Piel sintética · Cierre de velcro", price: 39.9, art: "glove", tone: "#3a1c1a" },
    { id: "botella", cat: "accesorios", name: "Botella térmica 750 ml", detail: "Acero inoxidable · 24 h frío", price: 14.9, art: "bottle", tone: "#1c2b26" }
  ];

  // Las ofertas se programan una vez y la web las activa y retira sola.
  // Cada descuento dice a qué cuotas (plans) y a qué categorías de la tienda (shop) se aplica.
  var OFFERS = [
    { name: "Semana de puertas abiertas", from: "2026-11-02", to: "2026-11-15", text: "Entrena gratis, sin compromiso", discount: null },
    { name: "Black Friday", from: "2026-11-20", to: "2026-11-30", text: "-30% en todas las cuotas y en toda la tienda", discount: { plans: "todas", shop: "todas", pct: 30 } },
    { name: "Reto de Navidad", from: "2026-12-01", to: "2026-12-24", text: "-25% en el bono 10 clases y en ropa y accesorios para regalar", discount: { plans: ["bono"], shop: ["ropa", "accesorios"], pct: 25 } },
    { name: "Propósitos 2027", from: "2027-01-01", to: "2027-01-31", text: "-20% en las cuotas trimestral y anual y en suplementos", discount: { plans: ["trimestral", "anual"], shop: ["suplementos"], pct: 20 } }
  ];

  // Dibujos sencillos de los productos (sin fotos)
  var ART = {
    tub: '<rect x="30" y="34" width="60" height="62" rx="10" fill="#f3efe8"/><rect x="27" y="24" width="66" height="16" rx="6" fill="#ff5a1f"/><rect x="38" y="54" width="44" height="22" rx="4" fill="#0e0e0f"/><text x="60" y="69" text-anchor="middle" font-size="10" font-weight="800" fill="#f3efe8" font-family="Archivo, sans-serif">WHEY</text>',
    jar: '<rect x="36" y="40" width="48" height="54" rx="12" fill="#f3efe8"/><rect x="40" y="28" width="40" height="16" rx="5" fill="#0e0e0f"/><rect x="42" y="58" width="36" height="16" rx="3" fill="#ff5a1f"/>',
    shirt: '<path d="M40 26 L28 34 L18 52 L32 58 L36 50 L36 98 L84 98 L84 50 L88 58 L102 52 L92 34 L80 26 Q70 36 60 36 Q50 36 40 26Z" fill="#f3efe8"/><text x="60" y="72" text-anchor="middle" font-size="10" font-weight="800" fill="#ff5a1f" font-family="Archivo, sans-serif">OLIMPO</text>',
    hoodie: '<path d="M42 24 Q60 14 78 24 L94 34 L104 82 L90 86 L86 58 L86 100 L34 100 L34 58 L30 86 L16 82 L26 34Z" fill="#3a3a42"/><path d="M46 26 Q60 44 74 26" fill="none" stroke="#f3efe8" stroke-width="3"/><rect x="44" y="78" width="32" height="12" rx="4" fill="#2c2c33"/><text x="60" y="68" text-anchor="middle" font-size="9" font-weight="800" fill="#ff5a1f" font-family="Archivo, sans-serif">OLIMPO</text>',
    glove: '<path d="M38 50 Q38 26 62 26 Q86 26 86 50 L86 74 Q86 86 74 86 L50 86 Q38 86 38 74Z" fill="#ff5a1f"/><path d="M38 60 Q24 58 26 46 Q28 38 38 42" fill="#e04a12"/><rect x="44" y="84" width="38" height="16" rx="4" fill="#f3efe8"/>',
    bottle: '<rect x="44" y="34" width="32" height="64" rx="12" fill="#f3efe8"/><rect x="48" y="20" width="24" height="16" rx="5" fill="#ff5a1f"/><rect x="44" y="58" width="32" height="10" fill="#0e0e0f"/>'
  };

  // Clases por día de la semana (0 = domingo)
  var SCHEDULE = {
    0: [],
    1: [["07:30", "Remo indoor"], ["10:00", "Movilidad"], ["19:00", "Boxeo"], ["20:15", "Fuerza técnica"]],
    2: [["07:30", "Funcional"], ["10:00", "Barre"], ["18:30", "HIIT"], ["20:00", "Grappling"]],
    3: [["07:30", "Remo indoor"], ["13:30", "HIIT exprés"], ["19:00", "Boxeo"], ["20:15", "Fuerza técnica"]],
    4: [["07:30", "Funcional"], ["10:00", "Barre"], ["18:30", "HIIT"], ["20:00", "Grappling"]],
    5: [["07:30", "Remo indoor"], ["19:00", "Boxeo"], ["20:00", "Open gym"]],
    6: [["09:00", "Running club"], ["10:30", "Funcional"]]
  };
  var CAPACITY = 12;

  var EVENTS = [
    { date: "2026-11-14", time: "11:00", name: "Masterclass de peso muerto", text: "Técnica, errores típicos y cómo progresar sin lesionarte." },
    { date: "2026-11-21", time: "10:00", name: "Torneo interno de remo", text: "2.000 metros por categorías. Premios para los tres primeros." },
    { date: "2026-11-28", time: "10:30", name: "Clase abierta de Black Friday", text: "Trae a quien quieras: clase funcional gratis para todos." },
    { date: "2026-12-05", time: "12:00", name: "Taller de nutrición", text: "Cómo comer para rendir mejor, con nuestra nutricionista." },
    { date: "2026-12-13", time: "09:00", name: "Carrera solidaria", text: "5 km por el paseo marítimo. Lo recaudado va a un banco de alimentos." },
    { date: "2026-12-19", time: "11:00", name: "Entrenamiento navideño por parejas", text: "Circuito por parejas y chocolate con churros al terminar." },
    { date: "2027-01-09", time: "10:00", name: "Jornada de puertas abiertas", text: "Prueba todas las clases gratis durante la mañana." },
    { date: "2027-01-23", time: "18:00", name: "Exhibición de boxeo", text: "Combates de exhibición de los alumnos de competición." }
  ];

  /* ---------- Utilidades ---------- */

  var money = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
  function startOfDay(date) { var d = new Date(date); d.setHours(0, 0, 0, 0); return d; }
  function parseISO(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function toISO(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }
  function longDate(date) { return date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }); }
  function shortDate(date) { return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" }); }
  function code() { return "OLI-" + Math.floor(1000 + Math.random() * 9000); }
  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  var realToday = startOfDay(new Date());
  var viewDate = realToday; // fecha que simula la sección de ofertas

  /* ---------- Ofertas programadas ---------- */

  function offerStatus(offer, date) {
    if (date < parseISO(offer.from)) return "programada";
    if (date > parseISO(offer.to)) return "terminada";
    return "activa";
  }
  function activeOffer(date) {
    for (var i = 0; i < OFFERS.length; i++) if (offerStatus(OFFERS[i], date) === "activa") return OFFERS[i];
    return null;
  }
  function priceFor(plan, date) {
    var offer = activeOffer(date);
    var plans = offer && offer.discount && offer.discount.plans;
    if (plans && (plans === "todas" || plans.indexOf(plan.id) !== -1)) {
      return { price: plan.price * (1 - offer.discount.pct / 100), old: plan.price, offer: offer };
    }
    return { price: plan.price, old: null, offer: null };
  }
  function productPrice(product, date) {
    var offer = activeOffer(date);
    var shop = offer && offer.discount && offer.discount.shop;
    if (shop && (shop === "todas" || shop.indexOf(product.cat) !== -1)) {
      return { price: Math.round(product.price * (100 - offer.discount.pct)) / 100, old: product.price, offer: offer };
    }
    return { price: product.price, old: null, offer: null };
  }

  function renderOfferBar() {
    var bar = document.querySelector("[data-offer-bar]");
    var offer = activeOffer(viewDate);
    if (!offer) {
      var next = OFFERS.filter(function (o) { return offerStatus(o, viewDate) === "programada"; })[0];
      if (!next) { bar.hidden = true; return; }
      var days = Math.round((parseISO(next.from) - viewDate) / 86400000);
      bar.innerHTML = "Próximamente: <strong>" + next.name + "</strong> · empieza en " + days + (days === 1 ? " día" : " días");
    } else {
      bar.innerHTML = "<strong>" + offer.name + "</strong> · " + offer.text + " · hasta el " + shortDate(parseISO(offer.to)) + " · <u>Ver cuotas</u>";
    }
    bar.hidden = false;
  }

  function renderOfferList() {
    var list = document.querySelector("[data-offer-list]");
    list.innerHTML = "";
    OFFERS.forEach(function (offer) {
      var status = offerStatus(offer, viewDate);
      var item = el("li", "offer" + (status === "activa" ? " is-active" : status === "terminada" ? " is-past" : ""));
      item.appendChild(el("span", "offer__status", status === "activa" ? "Activa" : status === "terminada" ? "Terminada" : "Programada"));
      item.appendChild(el("h3", null, offer.name));
      item.appendChild(el("p", null, offer.text));
      item.appendChild(el("p", "offer__dates", "Del " + shortDate(parseISO(offer.from)) + " al " + shortDate(parseISO(offer.to))));
      // Atajo para la demostración: saltar a esa fecha y ver los precios ya rebajados
      var jump = el("button", "offer__jump", offer.discount ? "Ver los precios ese día" : "Ver la web ese día");
      jump.type = "button";
      jump.addEventListener("click", function () { simulate(parseISO(offer.from), Boolean(offer.discount)); });
      item.appendChild(jump);
      list.appendChild(item);
    });
  }

  function renderPrices() {
    var wrap = document.querySelector("[data-prices]");
    wrap.innerHTML = "";
    PLANS.forEach(function (plan) {
      var p = priceFor(plan, viewDate);
      var card = el("article", "price" + (plan.featured ? " price--featured" : ""));
      if (p.offer) card.appendChild(el("span", "price__tag", p.offer.name + " · -" + p.offer.discount.pct + "%"));
      else if (plan.featured) card.appendChild(el("span", "price__tag", "La más elegida"));
      card.appendChild(el("h3", "price__name", plan.name));
      card.appendChild(el("p", "price__amount", money.format(p.price).replace(",00", "") + (plan.unit ? " <small>" + plan.unit + "</small>" : "")));
      card.appendChild(el("p", "price__old", p.old ? "Antes " + money.format(p.old).replace(",00", "") : ""));
      card.appendChild(el("p", "price__desc", plan.desc));
      var button = el("button", "btn " + (plan.featured || p.offer ? "btn--accent" : "btn--ghost"), "Pagar online");
      button.type = "button";
      button.addEventListener("click", function () { openCheckout(plan); });
      card.appendChild(button);
      wrap.appendChild(card);
    });
    initTilt();
  }

  function renderOffers() {
    renderOfferBar();
    renderOfferList();
    renderPrices();
    renderShop();
    renderCart();
  }

  /* ---------- Tienda online y carrito ---------- */

  var cart = {}; // id del producto -> cantidad
  var shopFilter = "todo";

  function findProduct(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }
  function euros(value) { return money.format(value); }

  function renderShop() {
    var wrap = document.querySelector("[data-shop]");
    if (!wrap) return;
    wrap.innerHTML = "";
    PRODUCTS.forEach(function (product) {
      if (shopFilter !== "todo" && product.cat !== shopFilter) return;
      var p = productPrice(product, viewDate);
      var card = el("article", "product");
      var media = el("div", "product__media", '<svg viewBox="0 0 120 120" aria-hidden="true">' + ART[product.art] + "</svg>");
      media.style.background = "radial-gradient(circle at 50% 40%, " + product.tone + " 0%, #121213 75%)";
      if (p.offer) media.appendChild(el("span", "product__tag", "-" + p.offer.discount.pct + "%"));
      card.appendChild(media);
      var body = el("div", "product__body");
      body.appendChild(el("p", "product__cat", product.cat));
      body.appendChild(el("h3", "product__name", product.name));
      body.appendChild(el("p", "product__detail", product.detail));
      body.appendChild(el("p", "product__price", euros(p.price) + (p.old ? " <s>" + euros(p.old) + "</s>" : "")));
      var add = el("button", "btn btn--ghost product__add", "Añadir al carrito");
      add.type = "button";
      add.addEventListener("click", function () {
        cart[product.id] = (cart[product.id] || 0) + 1;
        renderCart();
        add.textContent = "Añadido ✓";
        add.classList.add("is-added");
        setTimeout(function () { add.textContent = "Añadir al carrito"; add.classList.remove("is-added"); }, 1400);
        var button = document.querySelector("[data-cart-open]");
        button.classList.remove("is-bump");
        void button.offsetWidth;
        button.classList.add("is-bump");
      });
      body.appendChild(add);
      card.appendChild(body);
      wrap.appendChild(card);
    });
  }

  // Calcula el pedido completo: líneas, descuento, envío y total
  function cartSummary() {
    var items = [];
    var subtotal = 0;
    var total = 0;
    var offer = null;
    Object.keys(cart).forEach(function (id) {
      var product = findProduct(id);
      var qty = cart[id];
      var p = productPrice(product, viewDate);
      if (p.offer) offer = p.offer;
      items.push({ product: product, qty: qty, unit: p.price, old: p.old });
      subtotal += product.price * qty;
      total += p.price * qty;
    });
    var shipping = document.querySelector('[name="entrega"]:checked');
    var delivery = shipping && shipping.value === "envio";
    var shipCost = delivery && total < 50 ? 3.9 : 0;
    return {
      items: items,
      count: items.reduce(function (n, item) { return n + item.qty; }, 0),
      subtotal: subtotal,
      discount: subtotal - total,
      offer: offer,
      delivery: delivery,
      shipCost: shipCost,
      total: total + shipCost
    };
  }

  function renderCart() {
    var list = document.querySelector("[data-cart-items]");
    if (!list) return;
    var s = cartSummary();
    var count = document.querySelector("[data-cart-count]");
    count.textContent = s.count;
    count.parentElement.setAttribute("aria-label", "Abrir carrito (" + s.count + (s.count === 1 ? " producto)" : " productos)"));
    count.parentElement.classList.toggle("has-items", s.count > 0);

    document.querySelector("[data-cart-empty]").hidden = s.count > 0;
    document.querySelector("[data-cart-foot]").hidden = s.count === 0;
    document.querySelector("[data-ship-price]").textContent = s.total - s.shipCost >= 50 ? "Gratis" : "3,90 €";

    list.innerHTML = "";
    s.items.forEach(function (item) {
      var row = el("li", "cart-item");
      row.innerHTML =
        '<div class="cart-item__img" style="background:' + item.product.tone + '"><svg viewBox="0 0 120 120" aria-hidden="true">' + ART[item.product.art] + "</svg></div>" +
        '<div class="cart-item__info"><p class="cart-item__name">' + item.product.name + "</p>" +
        '<p class="cart-item__price">' + euros(item.unit) + (item.old ? " <s>" + euros(item.old) + "</s>" : "") + "</p></div>" +
        '<div class="cart-item__qty"><button type="button" aria-label="Quitar uno" data-qty="-1">−</button><span>' + item.qty +
        '</span><button type="button" aria-label="Añadir uno" data-qty="1">+</button></div>';
      row.querySelectorAll("[data-qty]").forEach(function (button) {
        button.addEventListener("click", function () {
          cart[item.product.id] += Number(button.dataset.qty);
          if (cart[item.product.id] <= 0) delete cart[item.product.id];
          renderCart();
        });
      });
      list.appendChild(row);
    });

    var totals = document.querySelector("[data-cart-totals]");
    totals.innerHTML = "";
    totals.appendChild(el("li", null, "<span>Subtotal</span><span>" + euros(s.subtotal) + "</span>"));
    if (s.discount > 0.001) totals.appendChild(el("li", "is-discount", "<span>" + s.offer.name + " (-" + s.offer.discount.pct + "%)</span><span>-" + euros(s.discount) + "</span>"));
    totals.appendChild(el("li", null, "<span>Entrega</span><span>" + (s.shipCost ? euros(s.shipCost) : "Gratis") + "</span>"));
    totals.appendChild(el("li", "is-total", "<span>Total</span><span>" + euros(s.total) + "</span>"));
    document.querySelector("[data-cart-pay]").textContent = "Pagar " + euros(s.total);
  }

  function initShop() {
    var drawer = document.querySelector("[data-cart]");
    var filters = document.querySelectorAll("[data-shop-filter]");
    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        shopFilter = button.dataset.shopFilter;
        filters.forEach(function (other) { other.setAttribute("aria-pressed", String(other === button)); });
        renderShop();
      });
    });

    document.querySelector("[data-cart-open]").addEventListener("click", function () {
      renderCart();
      if (typeof drawer.showModal === "function") drawer.showModal();
    });
    document.querySelector("[data-cart-close]").addEventListener("click", function () { drawer.close(); });
    drawer.addEventListener("click", function (event) { if (event.target === drawer) drawer.close(); });
    drawer.querySelectorAll('[name="entrega"]').forEach(function (radio) {
      radio.addEventListener("change", renderCart);
    });

    document.querySelector("[data-cart-pay]").addEventListener("click", function () {
      var s = cartSummary();
      if (!s.count) return;
      var lines = s.items.map(function (item) {
        return [item.qty + " × " + item.product.name, euros(item.product.price * item.qty)];
      });
      if (s.discount > 0.001) lines.push([s.offer.name + " (-" + s.offer.discount.pct + "%)", "-" + euros(s.discount)]);
      lines.push([s.delivery ? "Envío a domicilio" : "Recogida en el gimnasio", s.shipCost ? euros(s.shipCost) : "0,00 €"]);
      drawer.close();
      openPayment({
        title: "Pedido de la tienda",
        total: s.total,
        lines: lines,
        receipt: function (ref) {
          return "Pedido " + ref + " confirmado. " +
            (s.delivery ? "Te lo enviamos a casa en 24–48 h." : "Recógelo en recepción a partir de mañana.") +
            " En la web real te llegaría un email con el resumen. (Demostración: no se ha cobrado nada.)";
        },
        onPaid: function () { cart = {}; renderCart(); }
      });
    });
  }

  function simulate(date, showPrices) {
    viewDate = date;
    document.querySelector("[data-sim-date]").value = toISO(date);
    renderOffers();
    toast("Viendo la web como si fuera el " + longDate(viewDate) + ".");
    if (showPrices) window.Olimpo.scrollToTarget(document.getElementById("cuotas"));
  }

  function initOffers() {
    var input = document.querySelector("[data-sim-date]");
    input.value = toISO(realToday);
    input.addEventListener("change", function () {
      if (!input.value) return;
      simulate(parseISO(input.value), false);
    });
    document.querySelector("[data-sim-today]").addEventListener("click", function () {
      viewDate = realToday;
      input.value = toISO(realToday);
      renderOffers();
    });
    renderOffers();
  }

  /* ---------- Pago online (simulado) ---------- */

  var dialog = document.querySelector("[data-checkout]");
  var currentPayment = null;

  // order: { title, total, lines: [[texto, importe]], receipt(ref), onPaid() }
  function openPayment(order) {
    currentPayment = order;
    dialog.querySelector("[data-co-name]").textContent = order.title;
    dialog.querySelector("[data-co-amount]").textContent = money.format(order.total);
    var lines = dialog.querySelector("[data-co-lines]");
    lines.innerHTML = "";
    order.lines.forEach(function (line) {
      lines.appendChild(el("li", null, "<span>" + line[0] + "</span><span>" + line[1] + "</span>"));
    });
    lines.appendChild(el("li", "is-total", "<span>Total</span><span>" + money.format(order.total) + "</span>"));
    var confirm = dialog.querySelector("[data-co-confirm]");
    confirm.disabled = false;
    confirm.textContent = "Pagar " + money.format(order.total);
    dialog.querySelector("[data-co-pay]").hidden = false;
    dialog.querySelector("[data-co-done]").hidden = true;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else toast("Este navegador no puede mostrar el pago de demostración.");
  }

  function openCheckout(plan) {
    var p = priceFor(plan, viewDate);
    var lines = [[plan.name, money.format(plan.price)]];
    if (p.old) lines.push([p.offer.name + " (-" + p.offer.discount.pct + "%)", "-" + money.format(p.old - p.price)]);
    lines.push(["Matrícula", "0,00 €"]);
    openPayment({
      title: "Cuota " + plan.name.toLowerCase(),
      total: p.price,
      lines: lines,
      receipt: function (ref) {
        return "Ya eres socio con la cuota " + plan.name.toLowerCase() + ". Recibo " + ref +
          ". En la web real te llegaría por email. (Demostración: no se ha cobrado nada.)";
      }
    });
  }

  function initCheckout() {
    var confirm = dialog.querySelector("[data-co-confirm]");
    confirm.addEventListener("click", function () {
      confirm.disabled = true;
      confirm.textContent = "Procesando el pago…";
      setTimeout(function () {
        dialog.querySelector("[data-co-pay]").hidden = true;
        dialog.querySelector("[data-co-done]").hidden = false;
        dialog.querySelector("[data-co-receipt]").textContent = currentPayment.receipt(code());
        if (currentPayment.onPaid) currentPayment.onPaid();
      }, 1400);
    });
    dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });
  }

  /* ---------- Reservas de clases ---------- */

  var booked = {};
  function seed(text) {
    var h = 0;
    for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 997;
    return h;
  }
  function placesLeft(date, time) {
    var key = toISO(date) + " " + time;
    return Math.max(0, CAPACITY - (seed(key) % 13) - (booked[key] || 0));
  }

  function initBooking() {
    var daysWrap = document.querySelector("[data-days]");
    var slotsWrap = document.querySelector("[data-slots]");
    var form = document.querySelector("[data-booking-form]");
    var summary = document.querySelector("[data-booking-summary]");
    var status = document.querySelector("[data-booking-status]");
    var selectedDay = null;
    var selected = null;

    function renderSlots() {
      slotsWrap.innerHTML = "";
      selected = null;
      form.hidden = true;
      var classes = SCHEDULE[selectedDay.getDay()];
      if (!classes.length) {
        slotsWrap.appendChild(el("p", "booking__empty", "Los domingos el club está cerrado. ¡Toca descansar!"));
        return;
      }
      var now = new Date();
      classes.forEach(function (c) {
        var parts = c[0].split(":");
        var start = new Date(selectedDay);
        start.setHours(+parts[0], +parts[1]);
        var left = placesLeft(selectedDay, c[0]);
        var past = start < now;
        var slot = el("button", "slot");
        slot.type = "button";
        slot.setAttribute("aria-pressed", "false");
        slot.disabled = past || left === 0;
        slot.innerHTML = '<span class="slot__time">' + c[0] + '</span><span class="slot__name">' + c[1] + "</span>" +
          '<span class="slot__places' + (left <= 3 && left > 0 ? " is-low" : "") + '">' +
          (past ? "Ya empezó" : left === 0 ? "Completa" : left + (left === 1 ? " plaza libre" : " plazas libres")) + "</span>";
        slot.addEventListener("click", function () {
          slotsWrap.querySelectorAll(".slot").forEach(function (s) { s.setAttribute("aria-pressed", "false"); });
          slot.setAttribute("aria-pressed", "true");
          selected = { time: c[0], name: c[1] };
          summary.innerHTML = "<strong>" + c[1] + "</strong> · " + longDate(selectedDay) + " a las " + c[0];
          status.textContent = "";
          form.hidden = false;
          form.querySelector("input").focus({ preventScroll: true });
        });
        slotsWrap.appendChild(slot);
      });
    }

    for (var i = 0; i < 7; i++) {
      (function (offset) {
        var day = new Date(realToday);
        day.setDate(day.getDate() + offset);
        var button = el("button", null, "<small>" + (offset === 0 ? "Hoy" : day.toLocaleDateString("es-ES", { weekday: "short" })) + "</small><strong>" + day.getDate() + "</strong>");
        button.type = "button";
        button.setAttribute("role", "tab");
        button.setAttribute("aria-selected", offset === 0 ? "true" : "false");
        button.addEventListener("click", function () {
          daysWrap.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-selected", "false"); });
          button.setAttribute("aria-selected", "true");
          selectedDay = day;
          renderSlots();
        });
        daysWrap.appendChild(button);
        if (offset === 0) selectedDay = day;
      })(i);
    }
    renderSlots();

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = form.elements.nombre;
      if (!name.value.trim()) {
        name.setAttribute("aria-invalid", "true");
        status.textContent = "Escribe tu nombre para reservar.";
        status.classList.add("is-error");
        window.Olimpo.focusField(name);
        return;
      }
      name.setAttribute("aria-invalid", "false");
      var key = toISO(selectedDay) + " " + selected.time;
      booked[key] = (booked[key] || 0) + 1;
      var message = "¡Reserva confirmada, " + name.value.trim().split(" ")[0] + "! " + selected.name + ", " +
        longDate(selectedDay) + " a las " + selected.time + ". Código " + code() + ".";
      form.reset();
      renderSlots();
      slotsWrap.insertBefore(el("p", "booking__done", message), slotsWrap.firstChild);
      toast(message);
    });
  }

  /* ---------- Calendario de eventos ---------- */

  function initCalendar() {
    var grid = document.querySelector("[data-cal-grid]");
    var title = document.querySelector("[data-cal-title]");
    var list = document.querySelector("[data-event-list]");
    var month = new Date(realToday.getFullYear(), realToday.getMonth(), 1);
    var selectedISO = null;

    function eventsIn(year, monthIndex) {
      return EVENTS.filter(function (e) { var d = parseISO(e.date); return d.getFullYear() === year && d.getMonth() === monthIndex; });
    }

    function renderList(events) {
      list.innerHTML = "";
      if (!events.length) {
        list.appendChild(el("p", "booking__empty", "No hay eventos este mes. Mira el mes siguiente."));
        return;
      }
      events.forEach(function (e) {
        var date = parseISO(e.date);
        var card = el("article", "event" + (e.date === selectedISO ? " is-selected" : ""));
        card.appendChild(el("p", "event__date", longDate(date) + " · " + e.time));
        card.appendChild(el("h4", null, e.name));
        card.appendChild(el("p", null, e.text));
        var past = date < realToday;
        var button = el("button", "btn " + (past ? "btn--ghost" : "btn--accent"), past ? "Evento terminado" : "Apuntarme");
        button.type = "button";
        button.disabled = past;
        button.addEventListener("click", function () {
          button.textContent = "Apuntado ✓";
          button.disabled = true;
          toast("Te has apuntado a «" + e.name + "». Te lo recordaremos el día antes.");
        });
        card.appendChild(button);
        list.appendChild(card);
      });
    }

    function render() {
      var label = month.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
      title.textContent = label.charAt(0).toUpperCase() + label.slice(1);
      grid.innerHTML = "";
      var year = month.getFullYear();
      var m = month.getMonth();
      var offset = (new Date(year, m, 1).getDay() + 6) % 7;
      var days = new Date(year, m + 1, 0).getDate();
      var events = eventsIn(year, m);
      for (var i = 0; i < offset; i++) grid.appendChild(el("span"));
      for (var d = 1; d <= days; d++) {
        var date = new Date(year, m, d);
        var iso = toISO(date);
        var has = events.some(function (e) { return e.date === iso; });
        var cell;
        if (has) {
          cell = el("button", null, String(d));
          cell.type = "button";
          cell.setAttribute("aria-pressed", String(iso === selectedISO));
          cell.setAttribute("aria-label", d + ": " + events.filter(function (e) { return e.date === iso; })[0].name);
          (function (isoDay) {
            cell.addEventListener("click", function () { selectedISO = isoDay; render(); });
          })(iso);
        } else {
          cell = el("span", null, String(d));
        }
        if (iso === toISO(realToday)) cell.classList.add("is-today");
        if (date < realToday) cell.classList.add("is-past");
        grid.appendChild(cell);
      }
      var shown = selectedISO ? events.filter(function (e) { return e.date === selectedISO; }) : events;
      renderList(shown.length ? shown : events);
    }

    document.querySelector("[data-cal-prev]").addEventListener("click", function () {
      month = new Date(month.getFullYear(), month.getMonth() - 1, 1);
      selectedISO = null;
      render();
    });
    document.querySelector("[data-cal-next]").addEventListener("click", function () {
      month = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      selectedISO = null;
      render();
    });
    render();
  }

  /* ---------- Test: ¿qué cuota te conviene? ---------- */

  function initQuiz() {
    var form = document.querySelector("[data-quiz]");
    var result = form.querySelector("[data-quiz-result]");
    var classes = {
      fuerza: "Fuerza técnica y Open gym",
      peso: "HIIT, Funcional y Remo indoor",
      combate: "Boxeo y Grappling",
      salud: "Movilidad, Barre y Running club"
    };
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        toast("Responde a las tres preguntas para ver tu recomendación.");
        return;
      }
      var data = new FormData(form);
      var days = data.get("dias");
      var time = data.get("tiempo");
      var planId = time === "probar" || days === "1" ? "bono" : time === "anio" ? "anual" : time === "meses" ? "trimestral" : "mensual";
      var plan = PLANS.filter(function (p) { return p.id === planId; })[0];
      var p = priceFor(plan, viewDate);
      result.innerHTML = "";
      result.appendChild(el("p", "eyebrow", "Tu recomendación"));
      result.appendChild(el("h3", null, plan.name + " · " + money.format(p.price).replace(",00", "")));
      result.appendChild(el("p", null, "Clases para ti: " + classes[data.get("objetivo")] + "." + (p.old ? " Y ahora con la oferta «" + p.offer.name + "»." : "")));
      var button = el("button", "btn btn--accent", "Pagar esta cuota");
      button.type = "button";
      button.addEventListener("click", function () { openCheckout(plan); });
      result.appendChild(button);
      result.hidden = false;
    });
  }

  /* ---------- Animación ---------- */

  function initSplit() {
    var title = document.querySelector("[data-split]");
    var words = title.textContent.trim().split(/\s+/);
    title.setAttribute("aria-label", words.join(" "));
    title.innerHTML = words.map(function (word, i) {
      return '<span class="word" aria-hidden="true"><span style="animation-delay:' + (0.15 + i * 0.08).toFixed(2) + 's">' + word + "</span></span>";
    }).join(" ");
  }

  function initProgress() {
    var bar = document.querySelector("[data-progress]");
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-count]");
    var format = new Intl.NumberFormat("es-ES");
    function run(node) {
      var target = +node.dataset.count;
      var start = performance.now();
      function tick(now) {
        var t = Math.min(1, (now - start) / 1600);
        node.textContent = format.format(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if (!("IntersectionObserver" in window)) { counters.forEach(function (n) { n.textContent = n.dataset.count; }); return; }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    });
    counters.forEach(function (n) { observer.observe(n); });
  }

  function initParallax() {
    var img = document.querySelector("[data-parallax]");
    if (!img || reducedMotion) return;
    window.addEventListener("scroll", function () {
      var y = Math.min(window.scrollY, 900);
      img.style.transform = "translateY(" + (y * 0.12).toFixed(1) + "px) scale(1.04)";
    }, { passive: true });
  }

  function initMagnetic() {
    if (!canHover) return;
    document.querySelectorAll(".magnetic").forEach(function (button) {
      button.addEventListener("mousemove", function (event) {
        var r = button.getBoundingClientRect();
        var x = (event.clientX - r.left - r.width / 2) * 0.25;
        var y = (event.clientY - r.top - r.height / 2) * 0.35;
        button.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      button.addEventListener("mouseleave", function () { button.style.transform = ""; });
    });
  }

  function initTilt() {
    if (!canHover) return;
    document.querySelectorAll(".price").forEach(function (card) {
      card.addEventListener("mousemove", function (event) {
        var r = card.getBoundingClientRect();
        var x = (event.clientX - r.left) / r.width - 0.5;
        var y = (event.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(800px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  function initStrip() {
    var track = document.querySelector(".strip__track");
    Array.prototype.slice.call(track.children).forEach(function (img) {
      var copy = img.cloneNode(true);
      copy.alt = "";
      track.appendChild(copy);
    });
  }

  function initOpenBadge() {
    var badge = document.querySelector(".hero__badge");
    var dot = badge.querySelector(".hero__dot");
    var now = new Date();
    var day = now.getDay();
    var hour = now.getHours() + now.getMinutes() / 60;
    var open = day >= 1 && day <= 5 ? hour >= 7 && hour < 22 : day === 6 ? hour >= 9 && hour < 14 : false;
    var next;
    if (day === 0 || (day === 6 && hour >= 14)) next = "el lunes a las 7:00";
    else if (day === 6) next = "hoy a las 9:00";
    else if (hour < 7) next = "hoy a las 7:00";
    else next = day === 5 ? "mañana a las 9:00" : "mañana a las 7:00";
    var text = open ? "Abierto ahora · hasta las " + (day === 6 ? "14:00" : "22:00") : "Cerrado ahora · abrimos " + next;
    dot.classList.toggle("is-closed", !open);
    badge.lastChild.textContent = " " + text;
  }

  [initSplit, initProgress, initCounters, initParallax, initMagnetic, initStrip, initOpenBadge,
    initShop, initOffers, initCheckout, initBooking, initCalendar, initQuiz].forEach(function (init) {
    try { init(); } catch (error) { console.error(init.name, error); }
  });
})();
