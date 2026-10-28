// Utilidades para leer el contenido que se edita desde el panel (archivos JSON de la carpeta content/).
const MNA_DATOS = (function () {
  const escapar = (texto) => String(texto == null ? "" : texto).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  // Texto del panel -> HTML seguro: los saltos de línea pasan a <br>.
  const conSaltos = (texto) => escapar(texto).replace(/\r?\n/g, "<br>");

  // El panel guarda rutas como "/assets/uploads/x.webp"; sin la barra inicial funcionan igual
  // en mnacart.github.io/mna-multipagina/ y en mnacionalartiguista.org.
  const media = (ruta) => (ruta ? String(ruta).replace(/^\//, "") : "");

  async function leer(archivo) {
    try {
      const respuesta = await fetch(archivo, { cache: "no-cache" });
      if (!respuesta.ok) return null;
      return await respuesta.json();
    } catch (e) {
      return null;
    }
  }

  function fechaLegible(valor) {
    if (!valor) return "";
    const fecha = new Date(String(valor).slice(0, 10) + "T00:00:00Z");
    if (isNaN(fecha)) return "";
    return fecha.toLocaleDateString("es-UY", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  }

  // Más reciente primero; lo que no tiene fecha va al final (se mantiene el orden del archivo).
  const ordenarPorFecha = (items) =>
    [...(items || [])].sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));

  function idYoutube(url) {
    const m = String(url || "").match(
      /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/
    );
    return m ? m[1] : null;
  }

  const embedYoutube = (url) => {
    const id = idYoutube(url);
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  };

  const enlaceSeguro = (url) => (/^https?:\/\//i.test(url) ? url : "#");

  // Identificador estable de una publicación (fecha + título sin tildes), para su página "articulo.html".
  const slug = (a) =>
    (String(a.fecha || "").slice(0, 10) + "-" + String(a.titulo || ""))
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  // Tarjeta resumida de una publicación: el texto se recorta y el botón "Leer más" lleva al artículo completo.
  // Las tarjetas nunca pasan de 372 px de alto (ver .tarjeta--resumen en styles.css).
  const tarjetaResumen = (categoria, a, clase) => {
    const fecha = fechaLegible(a.fecha);
    const enlace = `articulo.html?c=${encodeURIComponent(categoria)}&a=${encodeURIComponent(slug(a))}`;
    return `
      <article class="tarjeta tarjeta--noticia tarjeta--resumen${clase ? " " + clase : ""}${a.imagen ? " tarjeta--con-imagen" : ""}">
        ${fecha ? `<span class="fecha">${fecha}</span>` : ""}
        <h3><a href="${enlace}" class="tarjeta__enlace-total">${escapar(a.titulo)}</a></h3>
        ${a.texto ? `<p>${conSaltos(a.texto)}</p>` : ""}
        ${a.imagen ? `<img src="${escapar(media(a.imagen))}" alt="" class="tarjeta__imagen">` : ""}
        <div class="tarjeta__acciones">
          <a href="${enlace}" class="boton boton-primario boton-chico tarjeta__leer" aria-label="Leer más: ${escapar(a.titulo)}">Leer más</a>
          <button type="button" class="tarjeta__compartir" data-compartir data-compartir-url="${enlace}" data-compartir-titulo="${escapar(a.titulo)}" aria-label="Compartir: ${escapar(a.titulo)}" title="Compartir"><svg class="icono-compartir" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg></button>
        </div>
      </article>`;
  };

  return { escapar, conSaltos, media, leer, fechaLegible, ordenarPorFecha, idYoutube, embedYoutube, enlaceSeguro, slug, tarjetaResumen };
})();
