// Redes sociales del pie de página (content/redes.json, editable desde el panel).
// Cada botón del pie lleva data-red="<nombre>". Un botón solo se ve si su enlace está cargado;
// Instagram trae su enlace en el HTML y solo se oculta si el administrador lo vacía en el panel.
document.addEventListener("DOMContentLoaded", async () => {
  const botones = document.querySelectorAll(".pie__redes a[data-red]");
  if (!botones.length) return;

  let redes = null;
  try {
    const respuesta = await fetch("content/redes.json", { cache: "no-cache" });
    if (respuesta.ok) redes = await respuesta.json();
  } catch (e) {
    redes = null;
  }
  if (!redes) return; // sin datos: queda lo que trae el HTML (Instagram visible, el resto oculto)

  botones.forEach((boton) => {
    const url = String(redes[boton.dataset.red] || "").trim();
    if (/^https?:\/\//i.test(url)) {
      boton.href = url;
      boton.hidden = false;
    } else {
      boton.hidden = true;
    }
  });
});
