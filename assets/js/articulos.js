// Lectura pública de las publicaciones cargadas desde el panel (content/*.json).
// Usado por propuestas.html ("Novedades", categoría "doctrina"). Las noticias del carrusel las pinta noticias.js.
const MNA_ARTICULOS = (function () {
  const ARCHIVOS = {
    doctrina: "content/propuestas-novedades.json",
    noticias: "content/noticias.json",
  };

  const TARJETA_VACIA = `<div class="tarjeta tarjeta--vacia">Espacio disponible para el próximo artículo.</div>`;

  async function renderArticulos(categoria, selector) {
    const contenedor = document.querySelector(selector);
    if (!contenedor) return;

    const datos = await MNA_DATOS.leer(ARCHIVOS[categoria]);
    const items = datos && Array.isArray(datos.items) ? MNA_DATOS.ordenarPorFecha(datos.items) : [];
    if (!items.length) {
      contenedor.innerHTML = TARJETA_VACIA;
      return;
    }

    // Tarjetas resumidas con botón "Leer más"; el artículo completo (texto, imagen, video, PDF) está en articulo.html.
    contenedor.innerHTML = items.map((a) => MNA_DATOS.tarjetaResumen(categoria, a, "tarjeta--anima")).join("");

    // Entrada escalonada: se activa cuando la lista entra en pantalla (las tarjetas se crean
    // después de cargar la página, por eso se observa acá y no en main.js).
    if ("IntersectionObserver" in window) {
      const observador = new IntersectionObserver((entradas, obs) => {
        if (entradas.some((e) => e.isIntersecting)) {
          contenedor.classList.add("en-vista");
          obs.disconnect();
        }
      }, { threshold: 0.1 });
      observador.observe(contenedor);
    } else {
      contenedor.classList.add("en-vista");
    }
  }

  return { renderArticulos };
})();
