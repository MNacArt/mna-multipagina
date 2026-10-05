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

  // Videos de fondo: silenciosos y livianos (menos de 1 MB), así que se reproducen siempre.
  // Si el navegador bloquea el autoplay (por ejemplo, ahorro de batería en el móvil),
  // se reintenta en el primer toque o desplazamiento del usuario.
  const reintentos = new Set();
  const reproducir = (video) => {
    video.muted = true;
    const promesa = video.play();
    if (promesa && promesa.catch) promesa.catch(() => reintentos.add(video));
  };
  const reintentar = () => {
    reintentos.forEach((video) => {
      const promesa = video.play();
      if (promesa && promesa.then) promesa.then(() => reintentos.delete(video)).catch(() => {});
    });
  };
  ["touchstart", "pointerdown", "scroll", "click"].forEach((tipo) =>
    window.addEventListener(tipo, reintentar, { passive: true })
  );

  document.querySelectorAll("video.seccion__video-fondo").forEach((video) => {
    const fuente = video.querySelector("source[data-src]");
    if (!fuente) {
      reproducir(video);
      return;
    }
    const cargar = () => {
      fuente.src = fuente.dataset.src;
      video.load();
      reproducir(video);
    };
    if ("IntersectionObserver" in window) {
      const observadorVideo = new IntersectionObserver((entradas, obs) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            cargar();
            obs.unobserve(video);
          }
        });
      }, { rootMargin: "300px" });
      observadorVideo.observe(video);
    } else {
      cargar();
    }
  });

  document.querySelectorAll('a[href="mailto:mna1811.uy@gmail.com"]').forEach((enlace) => {
    enlace.addEventListener("click", (evento) => {
      if (!navigator.clipboard) return;
      evento.preventDefault();
      const original = enlace.innerHTML;
      const esIcono = !!enlace.querySelector("svg");
      navigator.clipboard.writeText("mna1811.uy@gmail.com").then(() => {
        if (esIcono) {
          enlace.classList.add("copiado");
          setTimeout(() => enlace.classList.remove("copiado"), 1500);
        } else {
          enlace.textContent = "¡Copiado!";
          setTimeout(() => { enlace.innerHTML = original; }, 1500);
        }
      }).catch(() => {
        window.location.href = "mailto:mna1811.uy@gmail.com";
      });
    });
  });

  document.querySelectorAll("[data-copiar]").forEach((elemento) => {
    elemento.addEventListener("click", (evento) => {
      evento.preventDefault();
      if (!navigator.clipboard) return;
      const original = elemento.innerHTML;
      navigator.clipboard.writeText(elemento.dataset.copiar).then(() => {
        elemento.textContent = "¡Número copiado!";
        setTimeout(() => { elemento.innerHTML = original; }, 1500);
      });
    });
  });

  // Enlaces a PDF que todavía pueden no estar subidos: si el archivo no existe se muestra
  // "Próximamente" en lugar de llevar a un error 404.
  document.querySelectorAll("a[data-pdf]").forEach((enlace) => {
    const etiqueta = enlace.querySelector(".tarjeta__etiqueta");
    enlace.addEventListener("click", (evento) => {
      if (document.body.classList.contains("modo-edicion") || enlace.classList.contains("tarjeta--pronto")) {
        evento.preventDefault();
      }
    });
    fetch(enlace.getAttribute("href"), { method: "HEAD" })
      .then((respuesta) => {
        if (respuesta.ok) return;
        enlace.classList.add("tarjeta--pronto");
        if (etiqueta) etiqueta.textContent = "Próximamente";
      })
      .catch(() => {});
  });

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
