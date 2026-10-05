// Edición en vivo de textos e imágenes de contenido ("clic sobre la página para editar").
// Se incluye en todas las páginas públicas. Sin sesión de Supabase no cambia nada
// visualmente: solo aplica el contenido guardado (si lo hay) sobre los valores
// por defecto que ya están escritos en el HTML.
document.addEventListener("DOMContentLoaded", async () => {
  const CLAVE_MODO = "mna_modo_edicion";

  async function aplicarContenidoGuardado() {
    if (!MNA_SUPABASE) return;
    const { data, error } = await MNA_SUPABASE.from("contenido_sitio").select("*");
    if (error || !data) return;
    const porClave = Object.fromEntries(data.map((fila) => [fila.clave, fila]));
    document.querySelectorAll("[data-contenido]").forEach((el) => {
      const fila = porClave[el.dataset.contenido];
      if (!fila) return;
      if (fila.tipo === "imagen") {
        el.src = fila.valor;
      } else {
        el.innerHTML = fila.valor;
      }
    });
  }

  async function subirArchivo(file, carpeta) {
    const ruta = `${carpeta}/${Date.now()}-${file.name}`;
    const { error } = await MNA_SUPABASE.storage.from("media").upload(ruta, file);
    if (error) throw error;
    const { data } = MNA_SUPABASE.storage.from("media").getPublicUrl(ruta);
    return data.publicUrl;
  }

  async function guardarContenido(clave, tipo, valor) {
    await MNA_SUPABASE.from("contenido_sitio").upsert(
      { clave, tipo, valor, updated_at: new Date().toISOString() },
      { onConflict: "clave" }
    );
  }

  function crearBotonFlotante() {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.id = "boton-modo-edicion";
    boton.textContent = "✏️ Editar esta página";
    document.body.appendChild(boton);
    return boton;
  }

  function crearFranjaEdicion() {
    const franja = document.createElement("div");
    franja.id = "franja-modo-edicion";
    franja.innerHTML = `
      <span>Modo edición activo: tocá cualquier texto o imagen marcados para editarlos.</span>
      <button type="button" id="boton-salir-edicion">Salir del modo edición</button>
    `;
    document.body.prepend(franja);
    return franja;
  }

  function activarEdicionTexto(el) {
    el.setAttribute("contenteditable", "true");
    el.addEventListener("blur", async () => {
      await guardarContenido(el.dataset.contenido, "texto", el.innerHTML.trim());
    });
  }

  function activarEdicionImagen(el) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    el.insertAdjacentElement("afterend", input);

    el.addEventListener("click", (evento) => {
      if (!document.body.classList.contains("modo-edicion")) return;
      evento.preventDefault();
      input.click();
    });

    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      const url = await subirArchivo(file, "contenido");
      el.src = url;
      await guardarContenido(el.dataset.contenido, "imagen", url);
    });
  }

  function habilitarEdicionEnElementos() {
    document.querySelectorAll('[data-contenido][data-tipo="texto"]').forEach(activarEdicionTexto);
    document.querySelectorAll('[data-contenido][data-tipo="imagen"]').forEach(activarEdicionImagen);
  }

  function activarModoEdicion() {
    document.body.classList.add("modo-edicion");
    localStorage.setItem(CLAVE_MODO, "1");
  }

  function desactivarModoEdicion() {
    document.body.classList.remove("modo-edicion");
    localStorage.setItem(CLAVE_MODO, "0");
  }

  async function iniciar() {
    try {
      await aplicarContenidoGuardado();
    } finally {
      // Avisa a otros scripts (por ejemplo, la escritura a mano de la frase) que el texto ya es el definitivo.
      document.dispatchEvent(new Event("contenido-aplicado"));
    }
    if (!MNA_SUPABASE) return;

    const { data } = await MNA_SUPABASE.auth.getSession();
    if (!data.session) return;

    habilitarEdicionEnElementos();
    const franja = crearFranjaEdicion();
    const boton = crearBotonFlotante();

    boton.addEventListener("click", activarModoEdicion);
    franja.querySelector("#boton-salir-edicion").addEventListener("click", desactivarModoEdicion);

    if (localStorage.getItem(CLAVE_MODO) === "1") activarModoEdicion();
  }

  iniciar();
});
