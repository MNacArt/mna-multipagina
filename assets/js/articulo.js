// Página de una publicación completa (articulo.html?c=<categoría>&a=<identificador>).
// Las tarjetas de "Novedades" (propuestas.html) y del carrusel de noticias.html enlazan acá con "Leer más".
document.addEventListener("DOMContentLoaded", async () => {
  const CATEGORIAS = {
    doctrina: { archivo: "content/propuestas-novedades.json", etiqueta: "Novedades", volver: "propuestas.html", volverTexto: "Volver a Propuestas y Novedades" },
    noticias: { archivo: "content/noticias.json", etiqueta: "Noticias", volver: "noticias.html", volverTexto: "Volver a Noticias" },
  };

  const eyebrow = document.querySelector("#articulo-eyebrow");
  const titulo = document.querySelector("#articulo-titulo");
  const fecha = document.querySelector("#articulo-fecha");
  const cuerpo = document.querySelector("#articulo-contenido");
  if (!cuerpo) return;

  const params = new URLSearchParams(location.search);
  const categoria = CATEGORIAS[params.get("c")];
  const clave = params.get("a");

  function noEncontrado() {
    document.title = "Publicación no encontrada — Movimiento Nacional Artiguista";
    titulo.textContent = "No encontramos esta publicación";
    fecha.textContent = "";
    cuerpo.innerHTML = `<p>Puede que se haya retirado o que el enlace esté incompleto.</p>
      <a href="${categoria ? categoria.volver : "propuestas.html"}" class="boton boton-primario">${categoria ? categoria.volverTexto : "Ver propuestas y novedades"}</a>`;
  }

  if (!categoria || !clave) return noEncontrado();

  const datos = await MNA_DATOS.leer(categoria.archivo);
  const items = datos && Array.isArray(datos.items) ? datos.items : [];
  const a = items.find((x) => MNA_DATOS.slug(x) === clave);
  if (!a) return noEncontrado();

  document.title = `${a.titulo} — Movimiento Nacional Artiguista`;
  eyebrow.textContent = categoria.etiqueta;
  titulo.textContent = a.titulo;
  fecha.textContent = MNA_DATOS.fechaLegible(a.fecha);

  // Texto completo: una línea en blanco separa párrafos; un salto simple pasa a <br>.
  const parrafos = String(a.texto || "")
    .split(/\r?\n\s*\r?\n/)
    .filter((p) => p.trim())
    .map((p) => `<p>${MNA_DATOS.conSaltos(p.trim())}</p>`)
    .join("");
  const embed = MNA_DATOS.embedYoutube(a.youtube);

  cuerpo.innerHTML = `
    ${a.imagen ? `<img src="${MNA_DATOS.escapar(MNA_DATOS.media(a.imagen))}" alt="" class="articulo__imagen">` : ""}
    ${parrafos}
    ${embed ? `<div class="video-incrustado"><iframe src="${embed}" title="Video" loading="lazy" allowfullscreen></iframe></div>` : ""}
    ${a.video || a.pdf ? `<div class="articulo__descargas">
      ${a.video ? `<a href="${MNA_DATOS.escapar(MNA_DATOS.media(a.video))}" download class="boton boton-secundario">🎬 Descargar video</a>` : ""}
      ${a.pdf ? `<a href="${MNA_DATOS.escapar(MNA_DATOS.media(a.pdf))}" download class="boton boton-secundario">📄 Descargar PDF</a>` : ""}
    </div>` : ""}
    <a href="${categoria.volver}" class="tarjeta__enlace articulo__volver">← ${categoria.volverTexto}</a>
  `;
});
