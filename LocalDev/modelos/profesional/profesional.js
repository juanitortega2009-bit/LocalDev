/* Olimpo — plan Profesional: catálogo filtrable y galería */
(function () {
  "use strict";

  // Las tarjetas entran una detrás de otra
  function initStagger() {
    document.querySelectorAll(".catalog, .gallery").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (item, index) {
        item.style.transitionDelay = (index % 3) * 0.08 + "s";
      });
    });
  }

  function initFilters() {
    var buttons = document.querySelectorAll("[data-filter]");
    var items = document.querySelectorAll("[data-catalog] [data-cat]");
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.dataset.filter;
        buttons.forEach(function (other) { other.setAttribute("aria-pressed", String(other === button)); });
        items.forEach(function (item) {
          item.hidden = filter !== "todas" && item.dataset.cat !== filter;
          item.classList.add("is-visible");
        });
      });
    });
  }

  function initLightbox() {
    var box = document.querySelector("[data-lightbox]");
    var img = box.querySelector("[data-lb-img]");
    var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-gallery] img"));
    var current = 0;
    var opener = null;

    function show(index) {
      current = (index + thumbs.length) % thumbs.length;
      img.src = thumbs[current].src;
      img.alt = thumbs[current].alt;
    }
    function open(index) {
      opener = document.activeElement;
      show(index);
      box.hidden = false;
      document.body.style.overflow = "hidden";
      box.querySelector("[data-lb-close]").focus();
    }
    function close() {
      box.hidden = true;
      document.body.style.overflow = "";
      if (opener) opener.focus();
    }

    thumbs.forEach(function (thumb, index) {
      thumb.parentElement.addEventListener("click", function () { open(index); });
    });
    box.querySelector("[data-lb-close]").addEventListener("click", close);
    box.querySelector("[data-lb-prev]").addEventListener("click", function () { show(current - 1); });
    box.querySelector("[data-lb-next]").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (event) { if (event.target === box) close(); });
    document.addEventListener("keydown", function (event) {
      if (box.hidden) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") show(current - 1);
      if (event.key === "ArrowRight") show(current + 1);
    });
  }

  [initStagger, initFilters, initLightbox].forEach(function (init) {
    try { init(); } catch (error) { console.error(init.name, error); }
  });
})();
