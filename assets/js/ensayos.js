// Noticias: "Ensayos de interés" y "Video de interés" se cargan desde el panel de administración
// (content/ensayos.json y content/video.json). Lo escrito en noticias.html queda como respaldo:
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
            <h4>${MNA_DATOS.escapar(e.titulo)}</h4>
            ${detalle ? `<p>${MNA_DATOS.escapar(detalle)}</p>` : ""}
            <a href="${MNA_DATOS.escapar(MNA_DATOS.enlaceSeguro(e.url))}" target="_blank" rel="noopener">Leer ensayo <span class="documento-item__flecha" aria-hidden="true">→</span></a>
          </div>
        </div>
      `;
    }).join("");
  }

  async function cargarVideo() {
    const seccion = document.querySelector("#seccion-video-interes");
    const marco = document.querySelector("#video-interes");
    if (!seccion || !marco) return;
    const datos = await MNA_DATOS.leer("content/video.json");
    if (!datos) return;

    const url = String(datos.url || "").trim();
    if (!url) {
      seccion.style.display = "none";
      return;
    }
    const embed = MNA_DATOS.embedYoutube(url);
    if (embed) marco.src = embed;
  }

  cargarEnsayos();
  cargarVideo();
});
