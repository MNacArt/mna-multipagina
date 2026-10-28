// Publicaciones de Instagram de la página Principios, editables desde el panel (content/instagram.json).
// Lo escrito en principios.html queda como respaldo si el archivo no carga. Si el administrador
// borra todas las publicaciones, se oculta la sección completa.
document.addEventListener("DOMContentLoaded", async () => {
  const seccion = document.querySelector("#seccion-instagram");
  const lista = document.querySelector("#publicaciones-instagram");
  if (!seccion || !lista) return;

  let datos = null;
  try {
    const respuesta = await fetch("content/instagram.json", { cache: "no-cache" });
    if (respuesta.ok) datos = await respuesta.json();
  } catch (e) {
    datos = null;
  }
  if (!datos || !Array.isArray(datos.items)) {
    cargarEmbed(); // sin datos: se muestran las publicaciones de respaldo del HTML
    return;
  }

  // Solo enlaces de publicaciones de Instagram (p, reel o tv); el resto se ignora.
  const enlaces = datos.items
    .map((item) => {
      const m = String((item && item.url) || "").trim().match(/^https?:\/\/(?:www\.)?instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/i);
      return m ? `https://www.instagram.com/${m[1].toLowerCase()}/${m[2]}/` : null;
    })
    .filter(Boolean);

  if (!enlaces.length) {
    seccion.style.display = "none";
    return;
  }

  lista.innerHTML = enlaces.map((url) => `
        <blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14" style="background:#FFF; border:1px solid #dbdbdb; border-radius:10px; margin:0 auto; max-width:540px; width:100%;">
          <a href="${url}" target="_blank" rel="noopener">Ver esta publicación en Instagram</a>
        </blockquote>`).join("");
  cargarEmbed();

  // Código oficial de Instagram: convierte cada enlace en la publicación incrustada.
  function cargarEmbed() {
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
      return;
    }
    if (document.querySelector('script[src*="instagram.com/embed.js"]')) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.instagram.com/embed.js";
    document.head.appendChild(script);
  }
});
