(function () {
  "use strict";

  var number = (window.LOCALDEV && window.LOCALDEV.whatsapp || "").replace(/\D/g, "");

  function whatsappUrl(message) {
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
  }

  // Sin número configurado, los enlaces siguen llevando al formulario
  function initWhatsappLinks() {
    if (!number) return;
    document.querySelectorAll("[data-wa]").forEach(function (link) {
      link.href = whatsappUrl(link.dataset.wa);
      link.target = "_blank";
      link.rel = "noopener";
    });
  }

  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    }

    toggle.addEventListener("click", function () {
      setOpen(!menu.classList.contains("is-open"));
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });
  }

  // Las demos se cargan al acercarse (con ratón) o al tocarlas (en táctil)
  function initDemos() {
    var phones = document.querySelectorAll("[data-demo]");

    function start(phone) {
      if (phone.querySelector("iframe")) return;
      var frame = document.createElement("iframe");
      frame.title = phone.dataset.demoTitle;
      frame.src = phone.dataset.demo;
      frame.addEventListener("load", function () {
        // Sin barra de scroll, como en un móvil de verdad
        frame.contentDocument.documentElement.style.scrollbarWidth = "none";
        phone.classList.add("is-live");
      });
      phone.querySelector(".phone__screen").appendChild(frame);
    }

    phones.forEach(function (phone) {
      var button = phone.querySelector("[data-demo-start]");
      button.addEventListener("click", function () {
        button.textContent = "Cargando…";
        start(phone);
      });
    });

    if (!window.matchMedia("(hover: hover)").matches || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        start(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "300px 0px" });
    phones.forEach(function (phone) { observer.observe(phone); });
  }

  // Escaparate: la web de ejemplo de cada plan dentro de una ventana de navegador.
  // En pantallas anchas se ve la versión de ordenador; en móvil, la de móvil.
  function initShowcase() {
    var root = document.querySelector("[data-showcase]");
    if (!root) return;
    var screen = root.querySelector("[data-showcase-screen]");
    var startButton = root.querySelector("[data-showcase-start]");
    var urlLabel = root.querySelector("[data-showcase-url]");
    var openLink = root.querySelector("[data-showcase-open]");
    var waLink = root.querySelector("[data-showcase-wa]");
    var panel = root.querySelector('[role="tabpanel"]');
    var tabs = root.querySelectorAll("[data-model]");
    var names = { esencial: "Esencial", profesional: "Profesional", avanzado: "Avanzado" };
    var current = "profesional";
    var frame = null;

    // Tipos de negocio de ejemplo: cada uno con su carpeta de demos
    var SECTORS = {
      gimnasio: { dir: "demos/modelos/", domain: "olimpo", noun: "gimnasio",
        lead: "Un mismo gimnasio, Olimpo, hecho con cada plan. Elige uno y navega por su web como lo haría un cliente." },
      peluqueria: { dir: "demos/modelos-peluqueria/", domain: "nacar", noun: "peluquería",
        lead: "Una misma peluquería, Nácar, hecha con cada plan. Elige uno y navega por su web como lo haría una clienta." }
    };
    var sector = "gimnasio";
    var leadEl = root.querySelector("[data-showcase-lead]");
    var sectorButtons = root.querySelectorAll("[data-sector]:not(ul)");

    function pageUrl(model) { return SECTORS[sector].dir + model + "/index.html"; }

    function fit() {
      if (!frame) return;
      var width = screen.clientWidth;
      var height = screen.clientHeight;
      var virtualWidth = width < 600 ? 390 : 1280;
      var scale = width / virtualWidth;
      frame.style.width = virtualWidth + "px";
      frame.style.height = Math.ceil(height / scale) + "px";
      frame.style.transform = "scale(" + scale + ")";
    }

    function load() {
      if (!frame) {
        frame = document.createElement("iframe");
        frame.addEventListener("load", function () {
          try { frame.contentDocument.documentElement.style.scrollbarWidth = "none"; } catch (error) {}
          screen.classList.add("is-live");
        });
        screen.appendChild(frame);
        fit();
      }
      screen.classList.remove("is-live");
      frame.title = "Web de ejemplo del plan " + names[current];
      frame.src = pageUrl(current);
    }

    function select(model) {
      if (!names[model]) return;
      current = model;
      tabs.forEach(function (tab) {
        var active = tab.dataset.model === model;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active) panel.setAttribute("aria-labelledby", tab.id);
      });
      root.querySelectorAll("[data-model-info]").forEach(function (list) {
        list.hidden = list.dataset.modelInfo !== model || (list.dataset.sector || "gimnasio") !== sector;
      });
      urlLabel.textContent = SECTORS[sector].domain + "-" + model + ".es";
      openLink.href = pageUrl(model);
      var message = "Hola, he visto la web de ejemplo de " + SECTORS[sector].noun + " del plan " + names[model] + " y me interesa.";
      waLink.dataset.wa = message;
      if (number) waLink.href = whatsappUrl(message);
      if (frame) load();
    }

    tabs.forEach(function (tab, index) {
      tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
      tab.addEventListener("click", function () { select(tab.dataset.model); });
      tab.addEventListener("keydown", function (event) {
        var step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        var next = tabs[(index + step + tabs.length) % tabs.length];
        next.focus();
        select(next.dataset.model);
      });
    });

    // Selector de tipo de negocio (gimnasio / peluquería)
    sectorButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (!SECTORS[button.dataset.sector] || button.dataset.sector === sector) return;
        sector = button.dataset.sector;
        sectorButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === button)); });
        if (leadEl) leadEl.textContent = SECTORS[sector].lead;
        select(current);
      });
    });

    // Los enlaces de cada tarjeta de precio abren su web en el escaparate
    document.querySelectorAll("[data-model-link]").forEach(function (link) {
      link.addEventListener("click", function () { select(link.dataset.modelLink); });
    });

    startButton.addEventListener("click", function () {
      startButton.textContent = "Cargando…";
      load();
    });

    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(screen);
    else window.addEventListener("resize", fit);

    if (!window.matchMedia("(hover: hover)").matches || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      load();
      observer.disconnect();
    }, { rootMargin: "300px 0px" });
    observer.observe(screen);
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    function show(item) { item.classList.add("is-visible"); }

    if (!("IntersectionObserver" in window)) {
      items.forEach(show);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.05 });
    items.forEach(function (item) { observer.observe(item); });

    // Red de seguridad: ningún contenido se queda oculto
    setTimeout(function () { items.forEach(show); }, 6000);
  }

  // Muestra el tiempo de carga real de esta página en el dispositivo del visitante.
  // Si no baja de 1 s, se mantiene el texto original.
  function initSpeed() {
    var value = document.querySelector("[data-speed-value]");
    var note = document.querySelector("[data-speed-note]");
    var bar = document.querySelector("[data-speed-bar]");
    if (!value || !("PerformanceObserver" in window)) return;

    var latest = 0;
    function render() {
      if (!latest || latest >= 1000) return;
      value.textContent = (latest / 1000).toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + " s";
      note.textContent = "Lo que ha tardado esta página en tu dispositivo";
      bar.style.transform = "scaleX(" + latest / 1000 + ")";
    }

    try {
      new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) { latest = entry.startTime; });
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch (error) {
      return;
    }

    window.addEventListener("load", function () { setTimeout(render, 300); });
    if (document.readyState === "complete") setTimeout(render, 300);
  }

  function initForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    var status = form.querySelector("[data-form-status]");

    function setStatus(text, isError) {
      status.textContent = text;
      status.classList.toggle("is-error", isError);
    }

    function isMissing(field) {
      return field.type === "checkbox" ? !field.checked : !field.value.trim();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;
      form.querySelectorAll("[required]").forEach(function (field) {
        var invalid = isMissing(field);
        field.setAttribute("aria-invalid", String(invalid));
        if (invalid && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        setStatus("Rellena los campos que faltan y acepta la política de privacidad para poder enviarlo.", true);
        firstInvalid.focus();
        return;
      }

      if (!number) {
        setStatus("El envío por WhatsApp no está disponible en este momento.", true);
        return;
      }

      var data = new FormData(form);
      var message = [
        "Hola, soy " + data.get("nombre").trim() + ", de " + data.get("negocio").trim() + ".",
        "Plan: " + data.get("plan") + ".",
        data.get("mensaje").trim()
      ].join("\n");

      setStatus("Abriendo WhatsApp con tu mensaje…", false);
      var opened = window.open(whatsappUrl(message), "_blank");
      if (opened) {
        opened.opener = null;
      } else {
        window.location.href = whatsappUrl(message);
      }
    });

    form.addEventListener("input", function (event) {
      if (event.target.getAttribute("aria-invalid") === "true" && !isMissing(event.target)) {
        event.target.setAttribute("aria-invalid", "false");
      }
    });
  }

  // Un fallo en una parte no debe romper el resto
  [
    initWhatsappLinks,
    initNav,
    initDemos,
    initShowcase,
    initReveal,
    initSpeed,
    initForm
  ].forEach(function (init) {
    try {
      init();
    } catch (error) {
      console.error(init.name, error);
    }
  });
})();
