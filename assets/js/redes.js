// Redes sociales del pie de página (content/redes.json, editable desde el panel).
// Cada botón del pie lleva data-red="<nombre>" y empieza oculto: solo se ve cuando su enlace está cargado
// en el panel (si se vacía, vuelve a ocultarse).
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
  if (!redes) return; // sin datos: todos los botones quedan ocultos

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
