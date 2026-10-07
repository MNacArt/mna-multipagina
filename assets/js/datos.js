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
        <h3>${escapar(a.titulo)}</h3>
        ${a.texto ? `<p>${conSaltos(a.texto)}</p>` : ""}
        ${a.imagen ? `<img src="${escapar(media(a.imagen))}" alt="" class="tarjeta__imagen">` : ""}
        <a href="${enlace}" class="boton boton-primario boton-chico tarjeta__leer" aria-label="Leer más: ${escapar(a.titulo)}">Leer más</a>
      </article>`;
  };

  return { escapar, conSaltos, media, leer, fechaLegible, ordenarPorFecha, idYoutube, embedYoutube, enlaceSeguro, slug, tarjetaResumen };
})();
