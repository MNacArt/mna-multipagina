document.addEventListener("DOMContentLoaded", async () => {
  MNA_ARTICULOS.renderDocumentos("#lista-documentos-publico");

  const raiz = document.querySelector("#carrusel-novedades");
  const stage = raiz ? raiz.querySelector(".depth-carousel__stage") : null;
  const puntos = raiz ? raiz.querySelector(".depth-carousel__dots") : null;
  if (!raiz || !stage) return;

  function fechaLegible(iso) {
    try {
      return new Date(iso).toLocaleDateString("es-UY", { day: "2-digit", month: "long", year: "numeric" });
    } catch (e) {
      return "";
    }
  }

  function mostrarVacio() {
    stage.innerHTML = `<div class="depth-carousel__card activa" style="transform:translate(-50%,-50%);opacity:1;"><div class="tarjeta tarjeta--vacia">Espacio disponible para la próxima novedad.</div></div>`;
  }

  if (!MNA_SUPABASE) {
    mostrarVacio();
    return;
  }

  const { data, error } = await MNA_SUPABASE
    .from("articulos")
    .select("*")
    .eq("categoria", "noticias")
    .eq("publicado", true)
    .order("created_at", { ascending: false });

  if (error || !data || !data.length) {
    mostrarVacio();
    return;
  }

  stage.innerHTML = data.map((a) => `
    <div class="depth-carousel__card">
      <article class="tarjeta tarjeta--noticia">
        <span class="fecha">${fechaLegible(a.created_at)}</span>
        <h3>${a.titulo}</h3>
        ${a.texto ? `<p>${a.texto}</p>` : ""}
        ${a.imagen_url ? `<img src="${a.imagen_url}" alt="" style="border-radius:10px;width:100%;">` : ""}
      </article>
    </div>
  `).join("");

  if (puntos) {
    puntos.innerHTML = data.map((_, i) => `<button type="button" class="depth-carousel__dot" aria-label="Ir a la novedad ${i + 1}"></button>`).join("");
  }

  if (data.length > 1) {
    initDepthCarousel(raiz, { loop: true });
  } else {
    raiz.querySelector(".depth-carousel__card").classList.add("activa");
    raiz.querySelector(".depth-carousel__card").style.transform = "translate(-50%,-50%)";
    const flechas = raiz.querySelectorAll(".depth-carousel__flecha");
    flechas.forEach((f) => f.style.display = "none");
  }
});
