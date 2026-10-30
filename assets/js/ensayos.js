// Noticias: "Ensayos de interés" y "Video de interés" se cargan desde el panel de administración
// (content/ensayos.json y content/video.json: hasta 5 videos). Lo escrito en noticias.html queda como respaldo:
// solo se reemplaza si los archivos cargan.
document.addEventListener("DOMContentLoaded", () => {
  async function cargarEnsayos() {
    const lista = document.querySelector("#lista-ensayos-publico");
    if (!lista) return;
    const datos = await MNA_DATOS.leer("content/ensayos.json");
    if (!datos || !Array.isArray(datos.items)) return;

    const items = MNA_DATOS.ordenarPorFecha(datos.items);
    if (!items.length) {
      lista.innerHTML = `<p class="vacio">Pronto publicaremos nuevos ensayos.</p>`;
      return;
    }

    lista.innerHTML = items.map((e) => {
      const detalle = [e.autor, MNA_DATOS.fechaLegible(e.fecha)].filter(Boolean).join(" · ");
      return `
        <div class="documento-item tarjeta--anima">
          <div class="documento-item__icono">📄</div>
          <div class="documento-item__cuerpo">
            <h3>${MNA_DATOS.escapar(e.titulo)}</h3>
            ${detalle ? `<p>${MNA_DATOS.escapar(detalle)}</p>` : ""}
            <a href="${MNA_DATOS.escapar(MNA_DATOS.enlaceSeguro(e.url))}" target="_blank" rel="noopener">Leer ensayo <span class="documento-item__flecha" aria-hidden="true">→</span></a>
          </div>
        </div>
      `;
    }).join("");
  }

  // Hasta 5 videos de YouTube (content/video.json). También acepta el formato anterior { "url": "..." }.
  async function cargarVideo() {
    const seccion = document.querySelector("#seccion-video-interes");
    const lista = document.querySelector("#videos-interes");
    if (!seccion || !lista) return;
    const datos = await MNA_DATOS.leer("content/video.json");
    if (!datos) return;

    const crudos = Array.isArray(datos.items) ? datos.items : (datos.url ? [{ url: datos.url }] : []);
    const videos = crudos
      .map((v) => ({ embed: MNA_DATOS.embedYoutube(String((v && v.url) || "").trim()), titulo: String((v && v.titulo) || "").trim() }))
      .filter((v) => v.embed)
      .slice(0, 5);

    if (!videos.length) {
      seccion.style.display = "none";
      return;
    }
    lista.classList.toggle("videos-interes--uno", videos.length === 1);
    lista.innerHTML = videos.map((v, i) => `
      <figure class="video-interes">
        <div class="video-incrustado" style="box-shadow:var(--sombra);">
          <iframe src="${v.embed}" title="${MNA_DATOS.escapar(v.titulo || "Video de interés " + (i + 1))}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
        ${v.titulo ? `<figcaption>${MNA_DATOS.escapar(v.titulo)}</figcaption>` : ""}
      </figure>`).join("");
  }

  cargarEnsayos();
  cargarVideo();
});
