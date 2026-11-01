(function () {
  "use strict";

  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  document.documentElement.classList.add("js");

  /* =============================================================
     Shapes — workshop objects drawn on an offscreen canvas,
     then sampled into points for the particles.
     ============================================================= */
  const SHAPES = {
    car: { w: 600, h: 260, draw(c) {
      c.beginPath();
      c.moveTo(20, 186);
      c.lineTo(22, 150);
      c.quadraticCurveTo(26, 124, 72, 118);
      c.lineTo(150, 110);
      c.quadraticCurveTo(222, 58, 300, 56);
      c.quadraticCurveTo(362, 55, 402, 94);
      c.quadraticCurveTo(472, 106, 540, 124);
      c.quadraticCurveTo(586, 134, 588, 164);
      c.lineTo(586, 186);
      c.closePath();
      c.fill();
      c.globalCompositeOperation = "destination-out";
      // windows
      c.beginPath();
      c.moveTo(178, 106);
      c.quadraticCurveTo(232, 72, 296, 70);
      c.quadraticCurveTo(346, 70, 380, 98);
      c.closePath();
      c.fill();
      c.fillRect(282, 66, 8, 40);
      // wheel arches
      [140, 470].forEach(x => { c.beginPath(); c.arc(x, 186, 48, 0, Math.PI * 2); c.fill(); });
      c.globalCompositeOperation = "source-over";
      // wheels
      [140, 470].forEach(x => {
        c.beginPath(); c.arc(x, 186, 40, 0, Math.PI * 2); c.fill();
        c.globalCompositeOperation = "destination-out";
        c.beginPath(); c.arc(x, 186, 25, 0, Math.PI * 2); c.fill();
        c.globalCompositeOperation = "source-over";
        c.beginPath(); c.arc(x, 186, 9, 0, Math.PI * 2); c.fill();
        for (let i = 0; i < 5; i++) {
          const a = i * Math.PI * 2 / 5;
          c.save(); c.translate(x, 186); c.rotate(a); c.fillRect(-2.5, 0, 5, 25); c.restore();
        }
      });
    } },

    gear: { w: 420, h: 420, draw(c) {
      const cx = 210, cy = 210;
      c.beginPath(); c.arc(cx, cy, 150, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 12; i++) {
        c.save(); c.translate(cx, cy); c.rotate(i * Math.PI / 6);
        c.beginPath(); c.moveTo(-28, -140); c.lineTo(-20, -188); c.lineTo(20, -188); c.lineTo(28, -140); c.fill();
        c.restore();
      }
      c.globalCompositeOperation = "destination-out";
      c.beginPath(); c.arc(cx, cy, 58, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + Math.PI / 6;
        c.beginPath(); c.arc(cx + Math.cos(a) * 104, cy + Math.sin(a) * 104, 22, 0, Math.PI * 2); c.fill();
      }
      c.globalCompositeOperation = "source-over";
    } },

    wrench: { w: 420, h: 420, draw(c) {
      c.save(); c.translate(210, 210); c.rotate(-Math.PI / 4);
      c.beginPath(); c.roundRect(-19, -110, 38, 250, 19); c.fill();
      c.beginPath(); c.arc(0, -134, 64, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(0, 150, 44, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = "destination-out";
      c.fillRect(-24, -210, 48, 78);
      c.beginPath(); c.arc(0, -132, 24, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(0, 150, 20, 0, Math.PI * 2); c.fill();
      c.restore();
      c.globalCompositeOperation = "source-over";
    } },

    chip: { w: 420, h: 420, draw(c) {
      c.beginPath(); c.roundRect(110, 110, 200, 200, 18); c.fill();
      c.globalCompositeOperation = "destination-out";
      c.beginPath(); c.roundRect(138, 138, 144, 144, 8); c.fill();
      c.globalCompositeOperation = "source-over";
      c.fillRect(172, 172, 76, 76);
      for (let i = 0; i < 6; i++) {
        const p = 124 + i * 32;
        c.fillRect(p, 50, 12, 52); c.fillRect(p, 318, 12, 52);
        c.fillRect(50, p, 52, 12); c.fillRect(318, p, 52, 12);
      }
    } },

    gauge: { w: 420, h: 420, draw(c) {
      const cx = 210, cy = 230, a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
      c.lineCap = "round";
      c.lineWidth = 24; c.beginPath(); c.arc(cx, cy, 170, a0, a1); c.stroke();
      for (let i = 0; i <= 10; i++) {
        const a = a0 + (a1 - a0) * i / 10;
        c.lineWidth = i % 5 === 0 ? 10 : 6;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * 112, cy + Math.sin(a) * 112);
        c.lineTo(cx + Math.cos(a) * 138, cy + Math.sin(a) * 138);
        c.stroke();
      }
      const n = a0 + (a1 - a0) * 0.78;
      c.lineWidth = 12; c.beginPath(); c.moveTo(cx, cy);
      c.lineTo(cx + Math.cos(n) * 130, cy + Math.sin(n) * 130); c.stroke();
      c.beginPath(); c.arc(cx, cy, 22, 0, Math.PI * 2); c.fill();
    } },

    disc: { w: 420, h: 420, draw(c) {
      const cx = 210, cy = 210;
      c.beginPath(); c.arc(cx, cy, 185, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = "destination-out";
      c.beginPath(); c.arc(cx, cy, 72, 0, Math.PI * 2); c.fill();
      for (let ring = 0; ring < 3; ring++) {
        const r = 100 + ring * 28;
        for (let i = 0; i < 12; i++) {
          const a = i * Math.PI / 6 + ring * 0.18;
          c.beginPath(); c.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 7, 0, Math.PI * 2); c.fill();
        }
      }
      c.globalCompositeOperation = "source-over";
      c.beginPath(); c.arc(cx, cy, 52, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = "destination-out";
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5;
        c.beginPath(); c.arc(cx + Math.cos(a) * 32, cy + Math.sin(a) * 32, 7, 0, Math.PI * 2); c.fill();
      }
      c.beginPath(); c.arc(cx, cy, 14, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = "source-over";
      // caliper
      c.lineWidth = 46; c.lineCap = "round";
      c.beginPath(); c.arc(cx, cy, 190, -Math.PI * 0.42, -Math.PI * 0.12); c.stroke();
    } },

    wheel: { w: 420, h: 420, draw(c) {
      const cx = 210, cy = 210;
      c.beginPath(); c.arc(cx, cy, 196, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = "destination-out";
      c.beginPath(); c.arc(cx, cy, 150, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = "source-over";
      c.lineWidth = 9; c.beginPath(); c.arc(cx, cy, 138, 0, Math.PI * 2); c.stroke();
      for (let i = 0; i < 5; i++) {
        c.save(); c.translate(cx, cy); c.rotate(i * Math.PI * 2 / 5);
        c.beginPath(); c.moveTo(-16, 30); c.lineTo(-9, 136); c.lineTo(9, 136); c.lineTo(16, 30); c.fill();
        c.restore();
      }
      c.beginPath(); c.arc(cx, cy, 38, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = "destination-out";
      c.beginPath(); c.arc(cx, cy, 13, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = "source-over";
    } },

    euro: { w: 420, h: 420, draw(c) {
      c.textAlign = "center"; c.textBaseline = "middle";
      c.font = "600 360px Inter, Arial, sans-serif";
      c.fillText("€", 210, 225);
    } },

    check: { w: 420, h: 420, draw(c) {
      c.lineWidth = 14; c.beginPath(); c.arc(210, 210, 188, 0, Math.PI * 2); c.stroke();
      c.lineWidth = 42; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.moveTo(118, 216); c.lineTo(184, 282); c.lineTo(306, 146); c.stroke();
    } },

    bp: { w: 600, h: 320, draw(c) {
      c.textAlign = "center"; c.textBaseline = "middle";
      c.font = "600 300px Inter, Arial, sans-serif";
      c.fillText("BP", 300, 170);
    } }
  };

  const shapeCache = {};
  function sampleShape(name) {
    if (shapeCache[name]) return shapeCache[name];
    const def = SHAPES[name];
    const cv = document.createElement("canvas");
    cv.width = def.w; cv.height = def.h;
    const c = cv.getContext("2d");
    c.fillStyle = "#fff"; c.strokeStyle = "#fff";
    def.draw(c);
    const data = c.getImageData(0, 0, def.w, def.h).data;
    const pts = [];
    const step = 3;
    for (let y = 0; y < def.h; y += step) {
      for (let x = 0; x < def.w; x += step) {
        if (data[(y * def.w + x) * 4 + 3] > 128) {
          pts.push((x - def.w / 2) / def.w, (y - def.h / 2) / def.w);
        }
      }
    }
    // shuffle pairs so particles pick random spots
    const n = pts.length / 2;
    for (let i = n - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const ax = pts[i * 2], ay = pts[i * 2 + 1];
      pts[i * 2] = pts[j * 2]; pts[i * 2 + 1] = pts[j * 2 + 1];
      pts[j * 2] = ax; pts[j * 2 + 1] = ay;
    }
    const out = { pts: new Float32Array(pts), n, wide: def.w > def.h * 1.5 };
    shapeCache[name] = out;
    return out;
  }

  /* =============================================================
     Particle field
     ============================================================= */
  const Field = {
    ready: false,
    shape: "car",
    side: "right",
    my: null,
    setShape(name, side, my) {
      this.shape = name || "scatter";
      this.side = side || "right";
      this.my = my;
      if (this.ready) this.assign();
    }
  };

  function initField() {
    const canvas = $("[data-field]");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const COLORS = ["#8052ff", "#8052ff", "#a58bff", "#ffb829", "#1fae90", "#ff5fd2", "#4f8bff", "#ffffff"];
    let W = 0, H = 0, DPR = 1, N = 0, P = [];
    const mouse = { x: -9999, y: -9999 };
    let lastScroll = scrollY;

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function build() {
      N = W < 720 ? 750 : 1500;
      P = [];
      for (let i = 0; i < N; i++) {
        const big = Math.random() < 0.12;
        P.push({
          x: W / 2 + (Math.random() - 0.5) * 40,
          y: H / 2 + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 30,
          vy: (Math.random() - 0.5) * 30,
          hx: Math.random() * W, hy: Math.random() * H,
          dx: (Math.random() - 0.5) * 0.25, dy: (Math.random() - 0.5) * 0.25,
          depth: 0.2 + Math.random() * 0.8,
          s: big ? 3.2 + Math.random() * 1.6 : 1.6 + Math.random() * 1.6,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.03,
          k: 0.012 + Math.random() * 0.03,
          ph: Math.random() * Math.PI * 2,
          c: (Math.random() * COLORS.length) | 0,
          on: false, sx: 0, sy: 0
        });
      }
    }

    function layout() {
      const mobile = W < 960;
      const name = Field.shape;
      const wide = name !== "scatter" && SHAPES[name] && SHAPES[name].w > SHAPES[name].h * 1.5;
      let size, cx, cy;
      if (mobile) {
        size = wide ? W * 0.92 : Math.min(W * 0.7, H * 0.4);
        cx = W / 2;
        cy = H * (Field.my != null ? Field.my : 0.5);
      } else {
        size = wide ? Math.min(W * 0.5, 820) : Math.min(W * 0.34, H * 0.6, 520);
        cx = Field.side === "left" ? W * 0.27 : Field.side === "center" ? W * 0.5 : W * 0.74;
        cy = H * 0.52;
      }
      return { size, cx, cy, mobile };
    }
    let L = { size: 400, cx: 0, cy: 0, mobile: false };

    Field.assign = function () {
      L = layout();
      if (Field.shape === "scatter" || !SHAPES[Field.shape]) {
        P.forEach(p => { p.on = false; });
        return;
      }
      const s = sampleShape(Field.shape);
      const use = Math.floor(N * 0.86);
      for (let i = 0; i < N; i++) {
        const p = P[i];
        if (i < use) {
          const j = i % s.n;
          p.on = true;
          p.sx = s.pts[j * 2] + (i >= s.n ? (Math.random() - 0.5) * 0.006 : 0);
          p.sy = s.pts[j * 2 + 1] + (i >= s.n ? (Math.random() - 0.5) * 0.006 : 0);
          p.k = 0.012 + Math.random() * 0.03;
        } else p.on = false;
      }
    };

    function frame(t) {
      const sc = scrollY, dScroll = sc - lastScroll;
      lastScroll = sc;
      ctx.clearRect(0, 0, W, H);

      const floatY = Math.sin(t * 0.0008) * 6;
      const R = 110, R2 = R * R;

      for (let i = 0; i < N; i++) {
        const p = P[i];
        let tx, ty;
        if (p.on) {
          tx = L.cx + p.sx * L.size + Math.sin(t * 0.0012 + p.ph) * 1.6;
          ty = L.cy + p.sy * L.size + Math.cos(t * 0.001 + p.ph) * 1.6 + floatY;
        } else {
          p.hx += p.dx; p.hy += p.dy - dScroll * 0.25 * p.depth;
          if (p.hx < -20) p.hx = W + 20; else if (p.hx > W + 20) p.hx = -20;
          if (p.hy < -20) p.hy = H + 20; else if (p.hy > H + 20) p.hy = -20;
          tx = p.hx; ty = p.hy;
        }
        if (!reduced) {
          const mx = p.x - mouse.x, my = p.y - mouse.y, d2 = mx * mx + my * my;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2), f = (1 - d / R) * 2.2;
            p.vx += mx / d * f; p.vy += my / d * f;
          }
        }
        p.vx += (tx - p.x) * p.k; p.vy += (ty - p.y) * p.k;
        p.vx *= 0.84; p.vy *= 0.84;
        p.x += p.vx; p.y += p.vy;
        p.rot += p.vr + (Math.abs(p.vx) + Math.abs(p.vy)) * 0.004;
      }

      ctx.lineWidth = 1;
      const shapeAlpha = L.mobile ? 0.55 : 0.95;
      for (let pass = 0; pass < 2; pass++) {
        const onPass = pass === 1;
        ctx.globalAlpha = onPass ? shapeAlpha : 0.35;
        for (let c = 0; c < COLORS.length; c++) {
          ctx.beginPath();
          for (let i = 0; i < N; i++) {
            const p = P[i];
            if (p.c !== c || p.on !== onPass) continue;
            const r = p.s, a = p.rot;
            ctx.moveTo(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
            ctx.lineTo(p.x + Math.cos(a + 2.094) * r, p.y + Math.sin(a + 2.094) * r);
            ctx.lineTo(p.x + Math.cos(a + 4.189) * r, p.y + Math.sin(a + 4.189) * r);
            ctx.closePath();
          }
          ctx.strokeStyle = COLORS[c];
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    resize(); build();
    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        const wasW = W; resize();
        if ((wasW < 720) !== (W < 720)) build();
        P.forEach(p => { p.hx = Math.random() * W; p.hy = Math.random() * H; });
        Field.assign();
      }, 150);
    });
    window.addEventListener("pointermove", e => { if (e.pointerType === "mouse") { mouse.x = e.clientX; mouse.y = e.clientY; } }, { passive: true });
    document.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });

    Field.ready = true;
    // Shapes using text need the web font; re-sample once fonts are ready
    const start = () => { Field.assign(); };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { delete shapeCache.bp; delete shapeCache.euro; start(); });
    }
    start();
    requestAnimationFrame(frame);
  }

  /* =============================================================
     Section tracking → shape + HUD + nav
     ============================================================= */
  let svcShape = null;
  let stepShape = null;

  function initTracking() {
    const sections = $$("[data-shape]");
    const hudNum = $("[data-hud-num]"), hudName = $("[data-hud-name]"), hudBar = $("[data-hud-bar]");
    const navLinks = $$(".nav-links a");
    let current = null, key = "";

    function update() {
      const mid = innerHeight * 0.5;
      let found = sections[0];
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) { found = s; break; }
      }
      if (found !== current) {
        current = found;
        const idx = sections.indexOf(found);
        if (hudNum) hudNum.textContent = String(idx + 1).padStart(2, "0");
        if (hudName) hudName.textContent = found.dataset.label || "";
        navLinks.forEach(a => a.classList.toggle("is-current", a.getAttribute("href") === "#" + found.id));
      }
      let shape = found.dataset.shape;
      if (found.id === "servicios" && svcShape) shape = svcShape;
      if (found.id === "proceso" && stepShape) shape = stepShape;
      const my = found.dataset.my ? parseFloat(found.dataset.my) : null;
      const k = shape + found.dataset.side + my;
      if (k !== key) { key = k; Field.setShape(shape, found.dataset.side, my); }

      const max = document.documentElement.scrollHeight - innerHeight;
      if (hudBar) hudBar.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";
    }
    Field.refresh = () => { key = ""; update(); };
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { ticking = false; update(); });
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* =============================================================
     Splash
     ============================================================= */
  function initSplash(onDone) {
    const splash = $("[data-splash]");
    const count = $("[data-splash-count]");
    let done = false;
    const hide = () => {
      if (done) return; done = true;
      if (splash) splash.classList.add("is-out");
      onDone();
    };
    if (!splash) { hide(); return; }
    const t0 = performance.now(), dur = 1100;
    (function tick(now) {
      const p = clamp((now - t0) / dur, 0, 1);
      if (count) count.textContent = String(Math.round(p * 100)).padStart(3, "0");
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(hide, 200);
    })(t0);
    setTimeout(hide, 4000);
  }

  /* =============================================================
     Text splitting & reveals
     ============================================================= */
  function wrapWords(text, cls, counter) {
    return text.split(/(\s+)/).map(w => {
      if (!w) return "";
      if (/^\s+$/.test(w)) return " ";
      const i = counter.n++;
      const safeW = w.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
      return cls === "ln"
        ? '<span class="ln"><span style="--i:' + i + '">' + safeW + "</span></span>"
        : '<span class="mw">' + safeW + "</span>";
    }).join("");
  }
  function split(el, cls) {
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    const counter = { n: 0 };
    el.innerHTML = Array.from(el.childNodes).map(node => {
      if (node.nodeType === 3) return wrapWords(node.textContent, cls, counter);
      if (node.nodeName === "BR") return "<br>";
      if (node.nodeType === 1) {
        const tag = node.tagName.toLowerCase();
        return "<" + tag + ">" + wrapWords(node.textContent, cls, counter) + "</" + tag + ">";
      }
      return "";
    }).join("");
    Array.from(el.children).forEach(ch => { if (ch.tagName !== "BR" && !ch.classList.contains("ln") && !ch.classList.contains("mw")) ch.setAttribute("aria-hidden", "true"); });
  }

  function initSplits() {
    $$("[data-lines]").forEach(el => split(el, "ln"));
    $$("[data-words]").forEach(el => split(el, "mw"));
  }

  function initReveals() {
    const targets = $$(".reveal, [data-lines]");
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(el => io.observe(el));
    setTimeout(() => {
      targets.forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-in"); });
    }, 6000);
  }

  /* Manifesto: words light up with scroll */
  function initManifesto() {
    const el = $("[data-words]");
    if (!el) return;
    const words = $$(".mw", el);
    function update() {
      const r = el.getBoundingClientRect();
      const start = innerHeight * 0.85, end = innerHeight * 0.35;
      const p = clamp((start - r.top) / (r.height + start - end), 0, 1);
      const on = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < on));
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* =============================================================
     Services accordion + shape on hover
     ============================================================= */
  function initServices() {
    const list = $("[data-svc-list]");
    if (!list) return;
    const items = $$(".svc", list);
    let openShape = null;
    items.forEach(item => {
      const btn = $(".svc-row", item);
      btn.addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");
        items.forEach(o => { o.classList.remove("is-open"); $(".svc-row", o).setAttribute("aria-expanded", "false"); });
        if (willOpen) { item.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); }
        openShape = willOpen ? item.dataset.svcShape : null;
        svcShape = openShape;
        Field.refresh && Field.refresh();
      });
      item.addEventListener("mouseover", e => {
        if (item.contains(e.relatedTarget)) return;
        svcShape = item.dataset.svcShape;
        Field.refresh && Field.refresh();
      });
    });
    list.addEventListener("mouseout", e => {
      if (list.contains(e.relatedTarget)) return;
      svcShape = openShape;
      Field.refresh && Field.refresh();
    });
  }

  /* =============================================================
     Process — sticky steps driven by scroll
     ============================================================= */
  function initProcess() {
    const sec = $("[data-process]");
    if (!sec) return;
    const steps = $$("[data-step]", sec);
    const dots = $$(".step-dots i", sec);
    let active = -1;
    function update() {
      const r = sec.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - innerHeight), 0, 0.9999);
      const idx = Math.floor(p * steps.length);
      if (idx === active) return;
      active = idx;
      steps.forEach((s, i) => {
        s.classList.toggle("is-active", i === idx);
        s.classList.toggle("is-past", i < idx);
      });
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      stepShape = steps[idx].dataset.stepShape;
      Field.refresh && Field.refresh();
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* =============================================================
     Count-up stats
     ============================================================= */
  function initCounters() {
    const els = $$("[data-count]");
    const fmt = (v, dec, sep) => {
      let s = dec ? v.toFixed(dec).replace(".", ",") : String(Math.round(v));
      if (sep) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return s;
    };
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target, to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10), sep = el.hasAttribute("data-sep");
        const t0 = performance.now(), dur = 1800;
        (function tick(now) {
          const p = clamp((now - t0) / dur, 0, 1), eased = 1 - Math.pow(1 - p, 4);
          el.textContent = fmt(to * eased, dec, sep);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.01 });
    els.forEach(el => io.observe(el));
  }

  /* =============================================================
     Reviews slider
     ============================================================= */
  function initSlider() {
    const root = $("[data-slider]");
    if (!root) return;
    const slides = $$(".slide", root);
    const dots = $$("[data-dots] button");
    let i = 0, timer;
    function go(n) {
      const prev = i;
      i = (n + slides.length) % slides.length;
      if (prev === i) return;
      slides[prev].classList.add("is-leaving");
      slides[prev].classList.remove("is-active");
      setTimeout(() => slides[prev].classList.remove("is-leaving"), 900);
      slides[i].classList.add("is-active");
      dots.forEach((d, k) => d.classList.toggle("is-active", k === i));
      restart();
    }
    function restart() { clearInterval(timer); timer = setInterval(() => go(i + 1), 7000); }
    dots.forEach((d, k) => d.addEventListener("click", () => go(k)));
    const prevBtn = $("[data-prev]"), nextBtn = $("[data-next]");
    prevBtn && prevBtn.addEventListener("click", () => go(i - 1));
    nextBtn && nextBtn.addEventListener("click", () => go(i + 1));
    let sx = null;
    root.addEventListener("pointerdown", e => { sx = e.clientX; });
    root.addEventListener("pointerup", e => {
      if (sx == null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1);
    });
    restart();
  }

  /* =============================================================
     Nav: hide on scroll down, mobile menu
     ============================================================= */
  function initNav() {
    const nav = $("[data-nav]"), burger = $("[data-burger]"), menu = $("[data-menu]");
    let last = scrollY;
    window.addEventListener("scroll", () => {
      const y = scrollY;
      if (nav && !(menu && menu.classList.contains("is-open"))) nav.classList.toggle("is-hidden", y > last && y > 160);
      last = y;
    }, { passive: true });
    if (burger && menu) {
      const set = open => {
        menu.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", String(open));
        menu.setAttribute("aria-hidden", String(!open));
        document.body.style.overflow = open ? "hidden" : "";
      };
      burger.addEventListener("click", () => set(!menu.classList.contains("is-open")));
      $$("a", menu).forEach(a => a.addEventListener("click", () => set(false)));
    }
    const y = $("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* =============================================================
     Cursor + magnetic button
     ============================================================= */
  function initCursor() {
    if (!fineHover) return;
    const cur = $("[data-cursor]");
    if (!cur) return;
    let x = 0, y = 0, rx = 0, ry = 0, first = false;
    window.addEventListener("mousemove", e => {
      x = e.clientX; y = e.clientY;
      if (!first) { first = true; rx = x; ry = y; cur.classList.add("is-ready"); }
    }, { passive: true });
    document.addEventListener("mouseover", e => {
      cur.classList.toggle("is-hover", !!e.target.closest("a, button, .svc, input, textarea, label"));
    });
    (function loop() {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      cur.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(loop);
    })();
  }

  function initMagnetic() {
    if (!fineHover) return;
    $$("[data-magnetic]").forEach(el => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + dx * 0.25 + "px," + dy * 0.35 + "px)";
      });
      el.addEventListener("mouseout", e => { if (!el.contains(e.relatedTarget)) el.style.transform = ""; });
    });
  }

  /* =============================================================
     Hero scroll-out (GSAP)
     ============================================================= */
  function initHeroScroll() {
    gsap.to(".hero-copy", {
      yPercent: -18, opacity: 0, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 20%", scrub: 0.6 }
    });
    gsap.utils.toArray(".stats-title, .services-head .h-lg").forEach(el => {
      gsap.fromTo(el, { x: -30 }, {
        x: 0, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "top 40%", scrub: 0.8 }
      });
    });
  }

  /* =============================================================
     Form → sends to Netlify Forms (falls back to email if it fails)
     ============================================================= */
  function initForm() {
    const form = $("[data-form]");
    if (!form) return;
    const status = $("[data-form-status]");
    const submit = $("[type=submit]", form);
    const isLocal = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

    // Contact preference: show only the chosen field (phone or email).
    // The hidden one is disabled so it isn't sent empty.
    const byEmail = () => form.elements.contacto.value === "Email";
    function syncContact() {
      const mail = byEmail();
      $$("[data-contact-field]", form).forEach(label => {
        const active = label.dataset.contactField === (mail ? "email" : "telefono");
        label.hidden = !active;
        const input = $("input", label);
        input.disabled = !active;
        if (!active) input.classList.remove("is-invalid");
      });
    }
    $$("[name=contacto]", form).forEach(r => r.addEventListener("change", () => {
      syncContact();
      status.textContent = "";
      const field = form.elements[byEmail() ? "email" : "telefono"];
      if (field) field.focus();
    }));
    syncContact();

    function openMail(d) {
      const contact = d.get("email") ? "Email: " + d.get("email") : "Teléfono: " + d.get("telefono");
      const body = "Nombre: " + d.get("nombre") + "\n" + contact + "\nCoche: " + (d.get("coche") || "-") +
        "\nServicio: " + d.get("servicio") + "\n\n" + (d.get("mensaje") || "");
      window.location.href = "mailto:hola@bahiaperformance.es?subject=" + encodeURIComponent("Cita - " + d.get("servicio")) + "&body=" + encodeURIComponent(body);
    }

    form.addEventListener("submit", e => {
      e.preventDefault();
      const mail = byEmail();
      const name = form.elements.nombre;
      const contact = form.elements[mail ? "email" : "telefono"];
      const badName = !name.value.trim();
      const badContact = !contact.value.trim() || (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.value.trim()));
      name.classList.toggle("is-invalid", badName);
      contact.classList.toggle("is-invalid", badContact);
      if (badName || badContact) {
        status.textContent = mail
          ? "Necesitamos tu nombre y un email válido para responderte."
          : "Necesitamos tu nombre y un teléfono para llamarte.";
        return;
      }
      const d = new FormData(form);

      // Demo de LocalDev: el formulario no envía datos
      status.textContent = "Esta es una web de ejemplo: el formulario no envía datos.";
      return;

      submit.disabled = true;
      status.textContent = "Enviando…";
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(d).toString()
      })
        .then(res => {
          if (!res.ok) throw new Error("HTTP " + res.status);
          status.textContent = "Gracias, " + d.get("nombre") + ". Hemos recibido tu solicitud; " +
            (d.get("email") ? "te escribimos" : "te llamamos") + " en menos de 24 h.";
          form.reset();
          syncContact();
        })
        .catch(err => {
          console.warn("[form]", err);
          status.textContent = "No hemos podido enviarla. Abrimos tu correo para que nos la mandes por email.";
          openMail(d);
        })
        .finally(() => { submit.disabled = false; });
    });
  }

  /* =============================================================
     Boot
     ============================================================= */
  function boot() {
    safe(initSplits, "initSplits");
    safe(initNav, "initNav");
    safe(initField, "initField");
    safe(initTracking, "initTracking");
    safe(initManifesto, "initManifesto");
    safe(initServices, "initServices");
    safe(initProcess, "initProcess");
    safe(initCounters, "initCounters");
    safe(initSlider, "initSlider");
    safe(initCursor, "initCursor");
    safe(initMagnetic, "initMagnetic");
    safe(initForm, "initForm");
    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initHeroScroll, "initHeroScroll");
    }
    safe(() => initSplash(() => safe(initReveals, "initReveals")), "initSplash");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
