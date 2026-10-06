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

  // Formularios de contacto: se envían por correo con FormSubmit (gratis, sin cuenta) a
  // mna1811.uy@gmail.com. Solo se muestra el "¡Gracias!" si el envío salió bien.
  const CORREO_DESTINO = "mna1811.uy@gmail.com";
  const ERROR_ENVIO = `No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos a ${CORREO_DESTINO}.`;

  const conectarFormulario = (idFormulario, idMensaje, prefijo, origen) => {
    const formulario = document.querySelector(idFormulario);
    const mensaje = document.querySelector(idMensaje);
    if (!formulario) return;
    const boton = formulario.querySelector('button[type="submit"]');
    const textoGracias = mensaje ? mensaje.textContent : "";
    const textoBoton = boton ? boton.textContent : "";

    const avisar = (texto, error) => {
      if (!mensaje) return;
      mensaje.textContent = texto;
      mensaje.classList.toggle("mensaje-envio--error", !!error);
      mensaje.classList.add("visible");
      mensaje.setAttribute("tabindex", "-1");
      mensaje.focus();
    };

    formulario.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      if (boton && boton.disabled) return;

      // Casilla escondida contra el spam: una persona nunca la llena.
      const trampa = formulario.querySelector('input[name="_honey"]');
      if (trampa && trampa.value) {
        formulario.reset();
        avisar(textoGracias, false);
        return;
      }

      const valor = (campo) => (document.querySelector(`#${prefijo}-${campo}`) || {}).value || "";
      if (boton) { boton.disabled = true; boton.textContent = "Enviando…"; }
      try {
        const respuesta = await fetch(`https://formsubmit.co/ajax/${CORREO_DESTINO}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            nombre: valor("nombre"),
            email: valor("email"),
            ciudad: valor("ciudad"),
            mensaje: valor("mensaje"),
            _subject: `Nuevo mensaje desde la web del MNA (${origen})`,
            _template: "table",
            _captcha: "false"
          })
        });
        const datos = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok || String(datos.success) !== "true") throw new Error(datos.message || "envio");
        formulario.reset();
        avisar(textoGracias, false);
      } catch (e) {
        avisar(ERROR_ENVIO, true);
      } finally {
        if (boton) { boton.disabled = false; boton.textContent = textoBoton; }
      }
    });
  };

  conectarFormulario("#form-participa", "#mensaje-envio", "participa", "Participa");
  conectarFormulario("#form-contacto-inicio", "#inicio-mensaje-envio", "inicio", "Inicio");

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
      if (enlace.classList.contains("tarjeta--pronto")) {
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

});
