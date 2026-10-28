// Botón "Compartir": cualquier elemento con el atributo data-compartir abre una ventana para elegir
// a dónde enviar el enlace (WhatsApp, Telegram, Facebook, X, correo, copiar enlace).
//   data-compartir                       → comparte la página actual
//   data-compartir-url="..."             → comparte otro enlace (por ejemplo, el de una publicación)
//   data-compartir-titulo="..."          → título que acompaña al enlace (por defecto, el de la página)
// Funciona también con botones creados después de cargar la página (tarjetas de publicaciones).
(function () {
  const ICONOS = {
    whatsapp: '<path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>',
    telegram: '<path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>',
    facebook: '<path fill="currentColor" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>',
    x: '<path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>',
    correo: '<path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>',
    copiar: '<path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>',
    mas: '<path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>',
  };
  const icono = (nombre) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[nombre]}</svg>`;

  let dialogo = null;
  let datosActuales = null;
  let temporizador = null;

  // Enlace de la página actual: el canónico si existe; si no, la dirección sin el "#".
  function enlacePagina() {
    const canonico = document.querySelector('link[rel="canonical"]');
    return canonico && canonico.href ? canonico.href : location.href.split("#")[0];
  }

  function leerDatos(el) {
    const url = el.dataset.compartirUrl ? new URL(el.dataset.compartirUrl, location.href).href : enlacePagina();
    const titulo = (el.dataset.compartirTitulo || document.title || "").trim();
    return { url, titulo };
  }

  const codificar = encodeURIComponent;
  const REDES = [
    { id: "whatsapp", nombre: "WhatsApp", icono: "whatsapp", enlace: (d) => `https://wa.me/?text=${codificar(d.titulo + " " + d.url)}` },
    { id: "telegram", nombre: "Telegram", icono: "telegram", enlace: (d) => `https://t.me/share/url?url=${codificar(d.url)}&text=${codificar(d.titulo)}` },
    { id: "facebook", nombre: "Facebook", icono: "facebook", enlace: (d) => `https://www.facebook.com/sharer/sharer.php?u=${codificar(d.url)}` },
    { id: "x", nombre: "X", icono: "x", enlace: (d) => `https://x.com/intent/post?text=${codificar(d.titulo)}&url=${codificar(d.url)}` },
    { id: "correo", nombre: "Correo", icono: "correo", enlace: (d) => `mailto:?subject=${codificar(d.titulo)}&body=${codificar(d.titulo + "\n" + d.url)}` },
  ];

  async function copiar(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch (e) {
      // Respaldo para navegadores sin permiso de portapapeles.
      const campo = document.createElement("textarea");
      campo.value = texto;
      campo.setAttribute("readonly", "");
      campo.style.position = "fixed";
      campo.style.opacity = "0";
      document.body.appendChild(campo);
      campo.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
      campo.remove();
      return ok;
    }
  }

  function crearDialogo() {
    const d = document.createElement("dialog");
    d.className = "compartir";
    d.setAttribute("aria-labelledby", "compartir-titulo");
    d.innerHTML = `
      <div class="compartir__caja">
        <div class="compartir__cabecera">
          <h2 id="compartir-titulo">Compartir</h2>
          <button type="button" class="compartir__cerrar" aria-label="Cerrar">&times;</button>
        </div>
        <p class="compartir__texto"></p>
        <div class="compartir__opciones"></div>
        <input type="text" class="compartir__url" readonly aria-label="Enlace para compartir">
        <p class="compartir__aviso" role="status" aria-live="polite"></p>
      </div>`;
    document.body.appendChild(d);

    d.querySelector(".compartir__cerrar").addEventListener("click", () => d.close());
    // Clic en el fondo oscuro: cerrar.
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
    d.querySelector(".compartir__url").addEventListener("focus", (e) => e.target.select());
    d.addEventListener("close", () => {
      clearTimeout(temporizador);
      d.querySelector(".compartir__aviso").textContent = "";
    });

    d.querySelector(".compartir__opciones").addEventListener("click", async (e) => {
      const boton = e.target.closest("[data-accion]");
      if (!boton || !datosActuales) return;
      const aviso = d.querySelector(".compartir__aviso");
      if (boton.dataset.accion === "copiar") {
        const ok = await copiar(datosActuales.url);
        aviso.textContent = ok ? "¡Enlace copiado!" : "No se pudo copiar. Selecciona el enlace de abajo y cópialo.";
        if (!ok) d.querySelector(".compartir__url").select();
        clearTimeout(temporizador);
        temporizador = setTimeout(() => { aviso.textContent = ""; }, 2500);
      } else if (boton.dataset.accion === "nativo" && navigator.share) {
        try {
          await navigator.share({ title: datosActuales.titulo, url: datosActuales.url });
          d.close();
        } catch (err) { /* el usuario canceló */ }
      }
    });
    return d;
  }

  function abrir(origen) {
    datosActuales = leerDatos(origen);
    if (!dialogo) dialogo = crearDialogo();
    const { url, titulo } = datosActuales;

    dialogo.querySelector(".compartir__texto").textContent = titulo;
    dialogo.querySelector(".compartir__url").value = url;
    const opciones = REDES.map((r) => {
      const href = r.enlace(datosActuales);
      const externo = !href.startsWith("mailto:");
      return `<a class="compartir__opcion" href="${href.replace(/"/g, "&quot;")}"${externo ? ' target="_blank" rel="noopener noreferrer"' : ""}>${icono(r.icono)}<span>${r.nombre}</span></a>`;
    });
    opciones.push(`<button type="button" class="compartir__opcion" data-accion="copiar">${icono("copiar")}<span>Copiar enlace</span></button>`);
    if (navigator.share) {
      opciones.push(`<button type="button" class="compartir__opcion" data-accion="nativo">${icono("mas")}<span>Más opciones…</span></button>`);
    }
    dialogo.querySelector(".compartir__opciones").innerHTML = opciones.join("");

    if (typeof dialogo.showModal === "function") {
      if (!dialogo.open) dialogo.showModal();
    } else {
      // Navegador sin <dialog>: se copia el enlace como mínimo.
      copiar(url).then(() => window.alert("Enlace copiado: " + url));
    }
  }

  document.addEventListener("click", (e) => {
    const origen = e.target.closest("[data-compartir]");
    if (!origen) return;
    e.preventDefault();
    abrir(origen);
  });
})();
