// Textos e imágenes fijos de las páginas, editables desde el panel (/admin/).
// Cada elemento con data-contenido="pagina.seccion.campo" toma su valor de content/textos/<pagina>.json
// (el panel guarda ahí los cambios). Lo escrito en el HTML queda como respaldo si el archivo no carga.
(async function () {
  const elementos = Array.from(document.querySelectorAll("[data-contenido]"));
  const avisar = () => document.dispatchEvent(new Event("contenido-aplicado"));
  if (!elementos.length) { avisar(); return; }

  const prefijos = new Set(elementos.map((el) => el.dataset.contenido.split(".")[0]));
  const valores = {};
  await Promise.all(Array.from(prefijos).map(async (prefijo) => {
    try {
      const respuesta = await fetch(`content/textos/${prefijo}.json`, { cache: "no-cache" });
      if (respuesta.ok) Object.assign(valores, await respuesta.json());
    } catch (e) { /* se queda el texto del HTML */ }
  }));

  const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  elementos.forEach((el) => {
    const clave = el.dataset.contenido.replace(/\./g, "_");
    if (!(clave in valores)) return;
    const valor = String(valores[clave]);
    if (el.dataset.tipo === "imagen") {
      if (valor) el.src = valor.replace(/^\//, "");
    } else {
      // Sin etiquetas HTML: los saltos de línea del panel pasan a <br>. Con etiquetas (enlaces, etc.) se respeta tal cual.
      el.innerHTML = /<[a-z!\/]/i.test(valor) ? valor : escapar(valor).replace(/\r?\n/g, "<br>");
    }
  });

  avisar();
})();
