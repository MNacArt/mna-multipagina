// Lectura pública de contenido cargado desde el panel admin (Supabase).
// Usado por principios.html (categoría "doctrina") y noticias.html (categoría "noticias").
const MNA_ARTICULOS = (function () {
  function idVideoEmbebible(url) {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  }

  function fechaLegible(iso) {
    try {
      return new Date(iso).toLocaleDateString("es-UY", { day: "2-digit", month: "long", year: "numeric" });
    } catch (e) {
      return "";
    }
  }

  const TARJETA_VACIA = `<div class="tarjeta tarjeta--vacia">Espacio disponible para el próximo artículo.</div>`;

  async function renderArticulos(categoria, selector) {
    const contenedor = document.querySelector(selector);
    if (!contenedor) return;
    if (!MNA_SUPABASE) {
      contenedor.innerHTML = TARJETA_VACIA;
      return;
    }

    const { data, error } = await MNA_SUPABASE
      .from("articulos")
      .select("*")
      .eq("categoria", categoria)
      .eq("publicado", true)
      .order("created_at", { ascending: false });

    if (error || !data || !data.length) {
      contenedor.innerHTML = TARJETA_VACIA;
      return;
    }

    contenedor.innerHTML = data.map((a) => {
      const embed = idVideoEmbebible(a.video_youtube_url);
      return `
        <article class="tarjeta tarjeta--noticia">
          <span class="fecha">${fechaLegible(a.created_at)}</span>
          <h3>${a.titulo}</h3>
          ${a.texto ? `<p>${a.texto}</p>` : ""}
          ${a.imagen_url ? `<img src="${a.imagen_url}" alt="" style="border-radius:10px;width:100%;">` : ""}
          ${embed ? `<div class="video-incrustado"><iframe src="${embed}" title="Video" allowfullscreen></iframe></div>` : ""}
          ${a.video_archivo_url ? `<a href="${a.video_archivo_url}" download="${a.video_archivo_nombre || ""}" class="tarjeta__enlace">🎬 Descargar video</a>` : ""}
          ${a.pdf_url ? `<a href="${a.pdf_url}" download="${a.pdf_nombre || ""}" class="tarjeta__enlace">📄 Descargar PDF</a>` : ""}
        </article>
      `;
    }).join("");
  }

  async function renderDocumentos(selector) {
    const contenedor = document.querySelector(selector);
    if (!contenedor) return;
    if (!MNA_SUPABASE) {
      contenedor.innerHTML = `<p class="vacio">Todavía no hay documentos publicados.</p>`;
      return;
    }

    const { data, error } = await MNA_SUPABASE
      .from("documentos")
      .select("*")
      .eq("publicado", true)
      .order("created_at", { ascending: false });

    if (error || !data || !data.length) {
      contenedor.innerHTML = `<p class="vacio">Todavía no hay documentos publicados.</p>`;
      return;
    }

    contenedor.innerHTML = data.map((d) => `
      <div class="documento-item">
        <div class="documento-item__icono">📄</div>
        <div class="documento-item__cuerpo">
          <h4>${d.titulo}</h4>
          ${d.descripcion ? `<p>${d.descripcion}</p>` : ""}
          <a href="${d.archivo_url}" download="${d.archivo_nombre}">Descargar</a>
        </div>
      </div>
    `).join("");
  }

  return { renderArticulos, renderDocumentos };
})();
