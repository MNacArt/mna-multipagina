// "Depth Carousel": stack de tarjetas en 3D, con profundidad/tilt/blur progresivos,
// flechas, puntos, click-to-focus, flechas de teclado y swipe. Vanilla JS (sin dependencias),
// reutilizable para cualquier carrusel del sitio: initDepthCarousel(root, opciones).
function initDepthCarousel(root, opts) {
  var cfg = Object.assign({
    depth: 90,
    spread: 70,
    tilt: 6,
    tiltDirection: 1,
    visibleCards: 5,
    falloff: 0.82,
    blur: 4,
    duration: 500,
    loop: true,
    cardWidth: 300,
    autoplay: false,
    autoplayDelay: 4500,
  }, opts || {});

  var cards = Array.prototype.slice.call(root.querySelectorAll(".depth-carousel__card"));
  var n = cards.length;
  if (!n) return;

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var focused = 0;
  var scale = 1;
  var animando = false;

  function power3Out(t) { return 1 - Math.pow(1 - t, 3); }

  function distanciaCorta(i, f) {
    if (!cfg.loop) return i - f;
    var raw = i - f;
    var wrapped = ((raw % n) + n) % n;
    if (wrapped > n / 2) wrapped -= n;
    return wrapped;
  }

  function layout(f) {
    var medio = Math.floor(cfg.visibleCards / 2);
    cards.forEach(function (card, i) {
      var d = distanciaCorta(i, f);
      var abs = Math.abs(d);
      var visible = abs <= medio;
      var tx = d * cfg.spread * scale;
      var tz = -abs * cfg.depth;
      var ry = d * cfg.tilt * cfg.tiltDirection;
      var op = visible ? Math.pow(cfg.falloff, abs) : 0;
      var br = Math.max(1 - abs * 0.14, 0.35);
      var bl = abs * cfg.blur;
      card.style.transform = "translate(-50%,-50%) translateX(" + tx.toFixed(1) + "px) translateZ(" + tz.toFixed(1) + "px) rotateY(" + ry.toFixed(1) + "deg) scale(" + scale.toFixed(3) + ")";
      card.style.opacity = op.toFixed(3);
      card.style.filter = "brightness(" + br.toFixed(2) + ") blur(" + bl.toFixed(1) + "px)";
      card.style.zIndex = String(100 - abs);
      card.style.pointerEvents = visible ? "auto" : "none";
      card.classList.toggle("activa", d === 0);
    });
  }

  var dots = Array.prototype.slice.call(root.querySelectorAll(".depth-carousel__dot"));
  function actualizarDots() {
    var idx = ((focused % n) + n) % n;
    dots.forEach(function (dot, i) { dot.classList.toggle("activo", i === idx); });
  }

  function irA(destino) {
    if (!cfg.loop) destino = Math.min(Math.max(destino, 0), n - 1);
    var inicio = focused;
    var delta = cfg.loop ? distanciaCorta(Math.round(destino), Math.round(inicio)) : destino - inicio;
    var destinoReal = inicio + delta;

    if (reduced) {
      focused = ((destinoReal % n) + n) % n;
      layout(focused);
      actualizarDots();
      return;
    }
    if (animando) return;
    animando = true;
    var t0 = performance.now();
    function tick(t) {
      var p = Math.min(1, (t - t0) / cfg.duration);
      var e = power3Out(p);
      layout(inicio + delta * e);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        focused = ((destinoReal % n) + n) % n;
        layout(focused);
        actualizarDots();
        animando = false;
      }
    }
    requestAnimationFrame(tick);
  }

  var btnPrev = root.querySelector(".depth-carousel__flecha--prev");
  var btnNext = root.querySelector(".depth-carousel__flecha--next");
  if (btnPrev) btnPrev.addEventListener("click", function () { irA(focused - 1); });
  if (btnNext) btnNext.addEventListener("click", function () { irA(focused + 1); });

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () { irA(i); });
  });

  cards.forEach(function (card, i) {
    card.addEventListener("click", function () {
      var d = distanciaCorta(i, focused);
      if (d !== 0) irA(focused + d);
    });
  });

  root.setAttribute("tabindex", "0");
  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); irA(focused - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); irA(focused + 1); }
  });

  var inicioX = null;
  root.addEventListener("pointerdown", function (e) { inicioX = e.clientX; });
  root.addEventListener("pointerup", function (e) {
    if (inicioX === null) return;
    var dx = e.clientX - inicioX;
    if (Math.abs(dx) > 40) irA(focused + (dx < 0 ? 1 : -1));
    inicioX = null;
  });

  function ajustarEscala() {
    var ancho = root.clientWidth || cfg.cardWidth * 3;
    scale = Math.min(1, ancho / (cfg.cardWidth * 2.6));
    layout(focused);
  }
  window.addEventListener("resize", ajustarEscala);

  var temporizador = null;
  if (cfg.autoplay && !reduced) {
    var iniciar = function () { temporizador = setInterval(function () { irA(focused + 1); }, cfg.autoplayDelay); };
    var detener = function () { if (temporizador) clearInterval(temporizador); };
    root.addEventListener("mouseenter", detener);
    root.addEventListener("mouseleave", iniciar);
    iniciar();
  }

  ajustarEscala();
  layout(focused);
  actualizarDots();
}
