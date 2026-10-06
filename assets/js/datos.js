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

  return { escapar, conSaltos, media, leer, fechaLegible, ordenarPorFecha, idYoutube, embedYoutube, enlaceSeguro };
})();
