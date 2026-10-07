document.addEventListener("DOMContentLoaded", async () => {
  const raiz = document.querySelector("#carrusel-novedades");
  const pista = raiz ? raiz.querySelector(".carrusel-paralelo__pista") : null;
  if (!raiz || !pista) return;
  const anterior = raiz.querySelector(".carrusel-paralelo__flecha--prev");
  const siguiente = raiz.querySelector(".carrusel-paralelo__flecha--next");

  // Las 3 más recientes (content/noticias.json, editable desde el panel).
  const datos = await MNA_DATOS.leer("content/noticias.json");
  const items = datos && Array.isArray(datos.items) ? MNA_DATOS.ordenarPorFecha(datos.items).slice(0, 3) : [];
  if (!items.length) {
    pista.innerHTML = `<div class="carrusel-paralelo__item"><div class="tarjeta tarjeta--vacia">Espacio disponible para la próxima novedad.</div></div>`;
    return;
  }

  // Hasta 3 tarjetas en paralelo (2 en tablet, 1 en celular: ahí se avanza con las flechas o deslizando).
  pista.innerHTML = items.map((a) => `
    <div class="carrusel-paralelo__item">${MNA_DATOS.tarjetaResumen("noticias", a)}</div>
  `).join("");

  const paso = () => {
    const item = pista.querySelector(".carrusel-paralelo__item");
    return item ? item.getBoundingClientRect().width + (parseFloat(getComputedStyle(pista).columnGap) || 0) : pista.clientWidth;
  };

  function actualizarFlechas() {
    const desborda = pista.scrollWidth - pista.clientWidth > 2;
    // La pista tiene 4 px de relleno a cada lado, por eso el "inicio" es scrollLeft ≈ 4.
    anterior.hidden = !desborda || pista.scrollLeft <= 8;
    siguiente.hidden = !desborda || pista.scrollLeft >= pista.scrollWidth - pista.clientWidth - 8;
  }

  anterior.addEventListener("click", () => pista.scrollBy({ left: -paso(), behavior: "smooth" }));
  siguiente.addEventListener("click", () => pista.scrollBy({ left: paso(), behavior: "smooth" }));
  pista.addEventListener("scroll", actualizarFlechas, { passive: true });
  window.addEventListener("resize", actualizarFlechas);
  actualizarFlechas();
});
