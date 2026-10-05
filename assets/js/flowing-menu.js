// Flowing Menu invertido (vanilla): en reposo cada fila muestra una franja azul con el título
// desplazándose hacia la izquierda; al pasar el mouse la franja sale por el borde más cercano
// al cursor y queda el texto plano. Solo en dispositivos con hover y sin movimiento reducido.
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".fm-item");
  if (!items.length) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  items.forEach((item) => {
    const titulo = item.querySelector("h3");
    const marquee = document.createElement("div");
    marquee.className = "fm-marquee";
    marquee.setAttribute("aria-hidden", "true");
    marquee.innerHTML = '<div class="fm-marquee__inner"><div class="fm-marquee__track"></div></div>';
    if (item.dataset.video) {
      marquee.insertAdjacentHTML(
        "afterbegin",
        `<video class="fm-marquee__video" autoplay muted loop playsinline><source src="${item.dataset.video}" type="video/mp4"></video><div class="fm-marquee__capa"></div>`
      );
    }
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

    function borde(evento) {
      const caja = item.getBoundingClientRect();
      return evento.clientY - caja.top < caja.height / 2 ? "top" : "bottom";
    }

    function mover(y, yInv) {
      marquee.style.transform = `translateY(${y})`;
      inner.style.transform = `translateY(${yInv})`;
    }

    item.addEventListener("mouseenter", (evento) => {
      if (document.body.classList.contains("modo-edicion")) return;
      const arriba = borde(evento) === "top";
      mover(arriba ? "-101%" : "101%", arriba ? "101%" : "-101%");
    });

    item.addEventListener("mouseleave", () => mover("0", "0"));
  });
});
