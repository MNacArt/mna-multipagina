// Flowing Menu (vanilla): al pasar el mouse, una franja entra desde el borde (superior o inferior)
// más cercano al cursor, con el título repetido en un marquee. Solo en dispositivos con hover.
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".fm-item");
  if (!items.length) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  items.forEach((item) => {
    const marquee = document.createElement("div");
    marquee.className = "fm-marquee";
    marquee.setAttribute("aria-hidden", "true");
    marquee.innerHTML = '<div class="fm-marquee__inner"><div class="fm-marquee__track"></div></div>';
    item.appendChild(marquee);

    const inner = marquee.querySelector(".fm-marquee__inner");
    const track = marquee.querySelector(".fm-marquee__track");

    function rellenarTrack() {
      const titulo = item.querySelector("h3").textContent.trim();
      const bloque = `<span>${titulo}</span><span class="fm-marquee__sep">✦</span>`;
      track.innerHTML = bloque.repeat(12);
    }

    function borde(evento) {
      const caja = item.getBoundingClientRect();
      return evento.clientY - caja.top < caja.height / 2 ? "top" : "bottom";
    }

    function posicionar(lado) {
      const y = lado === "top" ? "-101%" : "101%";
      const yInv = lado === "top" ? "101%" : "-101%";
      marquee.style.transition = "none";
      inner.style.transition = "none";
      marquee.style.transform = `translateY(${y})`;
      inner.style.transform = `translateY(${yInv})`;
      void marquee.offsetHeight;
      marquee.style.transition = "";
      inner.style.transition = "";
    }

    item.addEventListener("mouseenter", (evento) => {
      if (document.body.classList.contains("modo-edicion")) return;
      rellenarTrack();
      posicionar(borde(evento));
      marquee.style.transform = "translateY(0)";
      inner.style.transform = "translateY(0)";
    });

    item.addEventListener("mouseleave", (evento) => {
      const lado = borde(evento);
      const y = lado === "top" ? "-101%" : "101%";
      const yInv = lado === "top" ? "101%" : "-101%";
      marquee.style.transform = `translateY(${y})`;
      inner.style.transform = `translateY(${yInv})`;
    });
  });
});
