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
    <div class="articulo__pie">
      <button type="button" class="boton boton-primario" data-compartir data-compartir-titulo="${MNA_DATOS.escapar(a.titulo)}"><svg class="icono-compartir" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg> Compartir</button>
      <a href="${categoria.volver}" class="tarjeta__enlace articulo__volver">← ${categoria.volverTexto}</a>
    </div>
  `;
});
