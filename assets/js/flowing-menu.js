// Flowing Menu invertido (vanilla): en reposo cada fila muestra una franja azul con el título
// desplazándose hacia la izquierda.
//  - Con mouse: al pasar el cursor la franja sale por el borde más cercano y queda el texto plano.
//  - En pantallas táctiles (sin hover): la franja sale sola cuando la fila entra en pantalla al
//    hacer scroll (una tras otra), y un toque la quita o la vuelve a poner.
//  - Con "reducir movimiento" no se anima nada: se ve la lista simple.
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".fm-item");
  if (!items.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const conMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  items.forEach((item) => {
    const titulo = item.querySelector("h3");
    const marquee = document.createElement("div");
    marquee.className = "fm-marquee";
    marquee.setAttribute("aria-hidden", "true");
    marquee.innerHTML = '<div class="fm-marquee__inner"><div class="fm-marquee__track"></div></div>';
    item.classList.add("fm-invertido");
    item.appendChild(marquee);

    const inner = marquee.querySelector(".fm-marquee__inner");
    const track = marquee.querySelector(".fm-marquee__track");

    function rellenarTrack() {
      const texto = titulo.textContent.trim();
      track.innerHTML = `<span>${texto}</span><img class="fm-marquee__estrella" src="assets/img/estrella-roja.png" alt="">`.repeat(12);
    }
    rellenarTrack();
    new MutationObserver(rellenarTrack).observe(titulo, { childList: true, characterData: true, subtree: true });

    if (!conMouse) return;

    function borde(evento) {
      const caja = item.getBoundingClientRect();
      return evento.clientY - caja.top < caja.height / 2 ? "top" : "bottom";
    }

    function mover(y, yInv) {
      marquee.style.transform = `translateY(${y})`;
      inner.style.transform = `translateY(${yInv})`;
    }

    item.addEventListener("mouseenter", (evento) => {
      const arriba = borde(evento) === "top";
      mover(arriba ? "-101%" : "101%", arriba ? "101%" : "-101%");
    });

    item.addEventListener("mouseleave", () => mover("0", "0"));
  });

  if (conMouse) return;

  // Modo táctil: solo se destapan las filas que tienen texto debajo del título.
  const tieneTexto = (item) => {
    const detalle = item.querySelector("p, ul");
    return !!detalle && detalle.textContent.trim() !== "";
  };

  items.forEach((item) => {
    item.classList.add("fm-tactil");
    item.addEventListener("click", () => {
      if (tieneTexto(item)) item.classList.toggle("fm-revelado");
    });
  });

  if (!("IntersectionObserver" in window)) return;
  const observador = new IntersectionObserver((entradas, obs) => {
    let orden = 0;
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      const item = entrada.target;
      obs.unobserve(item);
      setTimeout(() => {
        if (tieneTexto(item)) item.classList.add("fm-revelado");
      }, orden * 140);
      orden += 1;
    });
  }, { threshold: 0.7 });
  items.forEach((item) => observador.observe(item));
});
