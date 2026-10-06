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

    contenedor.innerHTML = items.map((a) => {
      const embed = MNA_DATOS.embedYoutube(a.youtube);
      const fecha = MNA_DATOS.fechaLegible(a.fecha);
      return `
        <article class="tarjeta tarjeta--noticia tarjeta--anima">
          ${fecha ? `<span class="fecha">${fecha}</span>` : ""}
          <h3>${MNA_DATOS.escapar(a.titulo)}</h3>
          ${a.texto ? `<p>${MNA_DATOS.conSaltos(a.texto)}</p>` : ""}
          ${a.imagen ? `<img src="${MNA_DATOS.escapar(MNA_DATOS.media(a.imagen))}" alt="" style="border-radius:10px;width:100%;">` : ""}
          ${embed ? `<div class="video-incrustado"><iframe src="${embed}" title="Video" loading="lazy" allowfullscreen></iframe></div>` : ""}
          ${a.video ? `<a href="${MNA_DATOS.escapar(MNA_DATOS.media(a.video))}" download class="tarjeta__enlace">🎬 Descargar video</a>` : ""}
          ${a.pdf ? `<a href="${MNA_DATOS.escapar(MNA_DATOS.media(a.pdf))}" download class="tarjeta__enlace">📄 Descargar PDF</a>` : ""}
        </article>
      `;
    }).join("");

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
