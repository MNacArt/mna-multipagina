document.addEventListener("DOMContentLoaded", async () => {
  const raiz = document.querySelector("#carrusel-novedades");
  const stage = raiz ? raiz.querySelector(".depth-carousel__stage") : null;
  const puntos = raiz ? raiz.querySelector(".depth-carousel__dots") : null;
  if (!raiz || !stage) return;

  function mostrarVacio() {
    stage.innerHTML = `<div class="depth-carousel__card activa" style="transform:translate(-50%,-50%);opacity:1;"><div class="tarjeta tarjeta--vacia">Espacio disponible para la próxima novedad.</div></div>`;
  }

  // Las 3 más recientes (content/noticias.json, editable desde el panel).
  const datos = await MNA_DATOS.leer("content/noticias.json");
  const items = datos && Array.isArray(datos.items) ? MNA_DATOS.ordenarPorFecha(datos.items).slice(0, 3) : [];
  if (!items.length) {
    mostrarVacio();
    return;
  }

  stage.innerHTML = items.map((a) => `
    <div class="depth-carousel__card">${MNA_DATOS.tarjetaResumen("noticias", a)}</div>
  `).join("");

  if (puntos) {
    puntos.innerHTML = items.map((_, i) => `<button type="button" class="depth-carousel__dot" aria-label="Ir a la novedad ${i + 1}"></button>`).join("");
  }

  if (items.length > 1) {
    initDepthCarousel(raiz, { loop: true });
  } else {
    raiz.querySelector(".depth-carousel__card").classList.add("activa");
    raiz.querySelector(".depth-carousel__card").style.transform = "translate(-50%,-50%)";
    const flechas = raiz.querySelectorAll(".depth-carousel__flecha");
    flechas.forEach((f) => f.style.display = "none");
  }
});
