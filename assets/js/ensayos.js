// Noticias: "Ensayos de interés" y "Video de interés" se cargan desde el panel de administración
// (tabla "ensayos" y clave "noticias.video.url" de contenido_sitio en Supabase).
// Lo que está escrito en noticias.html queda como respaldo: solo se reemplaza si Supabase responde.
document.addEventListener("DOMContentLoaded", () => {
  if (typeof MNA_SUPABASE === "undefined" || !MNA_SUPABASE) return;

  const escapar = (texto) => String(texto == null ? "" : texto).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  function fechaLegible(fecha) {
    if (!fecha) return "";
    try {
      // Las fechas sin hora llegan como "2026-06-11": se leen en UTC para que no se corran un día.
      return new Date(fecha + "T00:00:00Z").toLocaleDateString("es-UY", {
        day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
      });
    } catch (e) {
      return "";
    }
  }

  async function cargarEnsayos() {
    const lista = document.querySelector("#lista-ensayos-publico");
    if (!lista) return;
    const { data, error } = await MNA_SUPABASE
      .from("ensayos")
      .select("*")
      .eq("publicado", true)
      .order("fecha", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error || !data) return;

    if (!data.length) {
      lista.innerHTML = `<p class="vacio">Pronto publicaremos nuevos ensayos.</p>`;
      return;
    }

    lista.innerHTML = data.map((e) => {
      const enlace = /^https?:\/\//i.test(e.url) ? e.url : "#";
      const detalle = [e.autor, fechaLegible(e.fecha)].filter(Boolean).join(" · ");
      return `
        <div class="documento-item tarjeta--anima">
          <div class="documento-item__icono">📄</div>
          <div class="documento-item__cuerpo">
            <h4>${escapar(e.titulo)}</h4>
            ${detalle ? `<p>${escapar(detalle)}</p>` : ""}
            <a href="${escapar(enlace)}" target="_blank" rel="noopener">Leer ensayo <span class="documento-item__flecha" aria-hidden="true">→</span></a>
          </div>
        </div>
      `;
    }).join("");
  }

  function idDeYoutube(url) {
    const m = String(url || "").match(
      /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/
    );
    return m ? m[1] : null;
  }

  async function cargarVideo() {
    const seccion = document.querySelector("#seccion-video-interes");
    const marco = document.querySelector("#video-interes");
    if (!seccion || !marco) return;
    const { data, error } = await MNA_SUPABASE
      .from("contenido_sitio")
      .select("valor")
      .eq("clave", "noticias.video.url")
      .maybeSingle();
    if (error || !data) return;

    const valor = (data.valor || "").trim();
    if (!valor) {
      seccion.style.display = "none";
      return;
    }
    const id = idDeYoutube(valor);
    if (id) marco.src = `https://www.youtube-nocookie.com/embed/${id}`;
  }

  cargarEnsayos();
  cargarVideo();
});
