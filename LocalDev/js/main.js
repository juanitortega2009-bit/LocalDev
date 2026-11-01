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
