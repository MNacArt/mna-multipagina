document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-principal");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("abierto");
      const expandido = nav.classList.contains("abierto");
      toggle.setAttribute("aria-expanded", String(expandido));
    });
    nav.querySelectorAll("a").forEach((enlace) => {
      enlace.addEventListener("click", () => nav.classList.remove("abierto"));
    });
  }

  const seccionAccion = document.querySelector(".seccion--accion");
  if (seccionAccion && "IntersectionObserver" in window) {
    const observador = new IntersectionObserver(
      (entradas, obs) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            seccionAccion.classList.add("en-vista");
            obs.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observador.observe(seccionAccion);
  } else if (seccionAccion) {
    seccionAccion.classList.add("en-vista");
  }

  const gruposAnimados = document.querySelectorAll("[data-animar-grupo]");
  if (gruposAnimados.length && "IntersectionObserver" in window) {
    const observadorGrupos = new IntersectionObserver(
      (entradas, obs) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("en-vista");
            obs.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    gruposAnimados.forEach((grupo) => observadorGrupos.observe(grupo));
  } else {
    gruposAnimados.forEach((grupo) => grupo.classList.add("en-vista"));
  }

  const formulario = document.querySelector("#form-participa");
  if (formulario) {
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const mensaje = document.querySelector("#mensaje-envio");
      formulario.reset();
      if (mensaje) {
        mensaje.classList.add("visible");
        mensaje.setAttribute("tabindex", "-1");
        mensaje.focus();
      }
    });
  }

  const formularioContactoInicio = document.querySelector("#form-contacto-inicio");
  if (formularioContactoInicio) {
    formularioContactoInicio.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const mensaje = document.querySelector("#inicio-mensaje-envio");
      formularioContactoInicio.reset();
      if (mensaje) {
        mensaje.classList.add("visible");
        mensaje.setAttribute("tabindex", "-1");
        mensaje.focus();
      }
    });
  }
});
