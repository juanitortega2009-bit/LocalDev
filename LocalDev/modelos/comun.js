/* Olimpo — interacciones comunes de los tres modelos */
(function () {
  "use strict";

  var toastEl;
  var toastTimer;

  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, 3200);
  }

  // Dentro del teléfono de LocalDev sobra la barra de modelos
  function initDemoStrip() {
    if (window.self === window.top) return;
    var strip = document.querySelector(".demo-strip");
    if (strip) strip.remove();
  }

  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-nav]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (event) {
      if (!event.target.closest("a")) return;
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    function show(item) { item.classList.add("is-visible"); }
    if (!("IntersectionObserver" in window)) { items.forEach(show); return; }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.05 });
    items.forEach(function (item) { observer.observe(item); });
    setTimeout(function () { items.forEach(show); }, 6000);
  }

  // En el modelo, WhatsApp no abre ningún chat real
  function initWhatsapp() {
    document.querySelectorAll("[data-demo-wa]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        toast("En la web real, este botón abre el WhatsApp del gimnasio.");
      });
    });
  }

  function isMissing(field) {
    return field.type === "checkbox" ? !field.checked : !field.value.trim();
  }

  // Formularios de demostración: validan, pero no envían nada
  function initForms() {
    document.querySelectorAll("[data-demo-form]").forEach(function (form) {
      var status = form.querySelector(".form__status");
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = null;
        form.querySelectorAll("[required]").forEach(function (field) {
          var invalid = isMissing(field);
          field.setAttribute("aria-invalid", String(invalid));
          if (invalid && !first) first = field;
        });
        if (first) {
          status.textContent = "Rellena los campos marcados para continuar.";
          status.classList.add("is-error");
          first.focus();
          return;
        }
        status.textContent = form.dataset.demoForm || "Mensaje enviado. Te respondemos en menos de 24 horas.";
        status.classList.remove("is-error");
        form.reset();
        toast("Modelo de demostración: el formulario no envía datos reales.");
      });
      form.addEventListener("input", function (event) {
        if (event.target.getAttribute("aria-invalid") === "true" && !isMissing(event.target)) {
          event.target.setAttribute("aria-invalid", "false");
        }
      });
    });
  }

  window.Olimpo = { toast: toast };

  [initDemoStrip, initNav, initReveal, initWhatsapp, initForms].forEach(function (init) {
    try { init(); } catch (error) { console.error(init.name, error); }
  });
})();
