// La frase de Artigas del Inicio se "escribe a mano": cada palabra se destapa de izquierda a
// derecha, una tras otra, y al final aparece la firma. Pasa una sola vez por visita.
//  - Espera a que contenido.js aplique el texto guardado (evento "contenido-aplicado").
//  - Al terminar se devuelve el HTML original, así el modo edición guarda texto limpio.
//  - Con "reducir movimiento" solo hay un fundido suave, sin barrido.
(function () {
  const cita = document.querySelector(".hero__cita");
  const frase = cita && cita.querySelector(".hero__lead");
  if (!frase) return;

  const firma = cita.querySelector(".hero__firma");
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sinAnimacion = !frase.animate || localStorage.getItem("mna_modo_edicion") === "1";
  if (sinAnimacion) return;

  // Oculta la frase y la firma desde el primer momento para que no parpadeen antes de escribirse.
  cita.classList.add("escritura-pendiente");

  const PAUSA_PALABRA = 60;
  const MS_POR_LETRA = 65;
  const CURVA = "cubic-bezier(.4, 0, .6, 1)";
  let iniciada = false;

  function liberar() {
    frase.style.visibility = "";
    cita.classList.remove("escritura-pendiente");
  }

  function fundido(elemento, retraso) {
    return elemento.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 450, delay: retraso, easing: "ease-out", fill: "both"
    });
  }

  function escribir() {
    if (iniciada) return;
    iniciada = true;

    const original = frase.innerHTML;
    const palabras = frase.textContent.trim().split(/\s+/).filter(Boolean);
    if (!palabras.length) { liberar(); return; }

    if (reducido) {
      const animaciones = [fundido(frase, 0)];
      if (firma) {
        firma.style.clipPath = "none";
        animaciones.push(fundido(firma, 250));
      }
      frase.style.visibility = "visible";
      Promise.all(animaciones.map((a) => a.finished)).catch(() => {}).then(() => {
        animaciones.forEach((a) => a.cancel());
        if (firma) firma.style.clipPath = "";
        liberar();
      });
      return;
    }

    frase.textContent = "";
    let reloj = 0;
    let ultima = null;
    palabras.forEach((texto, i) => {
      if (i) frase.appendChild(document.createTextNode(" "));
      const span = document.createElement("span");
      span.className = "esc-palabra";
      span.textContent = texto;
      frase.appendChild(span);
      const duracion = Math.max(280, texto.length * MS_POR_LETRA);
      ultima = span.animate(
        [
          { clipPath: "inset(-25% 100% -25% -10%)" },
          { clipPath: "inset(-25% -10% -25% -10%)" }
        ],
        { duration: duracion, delay: reloj, easing: CURVA, fill: "both" }
      );
      reloj += duracion + PAUSA_PALABRA;
    });
    frase.style.visibility = "visible";

    // La firma entra justo después de la última palabra, con el mismo barrido.
    let animFirma = null;
    if (firma) {
      animFirma = firma.animate(
        [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
        { duration: 900, delay: reloj + 120, easing: "cubic-bezier(.4, 0, .2, 1)", fill: "both" }
      );
    }

    (animFirma || ultima).finished.catch(() => {}).then(() => {
      // Si contenido.js cambió el texto a mitad de camino, no se pisa con el original.
      if (frase.querySelector(".esc-palabra")) frase.innerHTML = original;
      if (animFirma) animFirma.cancel();
      liberar();
    });
  }

  function cuandoEsteListo() {
    const fuentes = document.fonts && document.fonts.ready
      ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 800))])
      : Promise.resolve();
    fuentes.then(() => {
      if (!("IntersectionObserver" in window)) { escribir(); return; }
      const observador = new IntersectionObserver((entradas, obs) => {
        if (entradas.some((e) => e.isIntersecting)) {
          obs.disconnect();
          escribir();
        }
      }, { threshold: 0.6 });
      observador.observe(cita);
    });
  }

  // Si por algún motivo no llega el aviso de contenido.js, igual se escribe a los 2,5 s.
  document.addEventListener("contenido-aplicado", cuandoEsteListo, { once: true });
  setTimeout(cuandoEsteListo, 2500);
})();
