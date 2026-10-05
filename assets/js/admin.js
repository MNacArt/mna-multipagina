document.addEventListener("DOMContentLoaded", () => {
  const vistaLogin = document.querySelector("#vista-login");
  const vistaPanel = document.querySelector("#vista-panel");
  const formLogin = document.querySelector("#form-login-admin");
  const loginError = document.querySelector("#login-error");
  const botonSalir = document.querySelector("#boton-salir");

  if (!MNA_SUPABASE) {
    loginError.textContent = "Falta configurar Supabase en assets/js/supabase-client.js.";
    loginError.classList.add("visible");
    formLogin.querySelector("button[type=submit]").disabled = true;
    return;
  }

  document.querySelectorAll(".admin-subnav button").forEach((boton) => {
    boton.addEventListener("click", () => {
      document.querySelectorAll(".admin-subnav button").forEach((b) => b.classList.remove("activa"));
      boton.classList.add("activa");
      document.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("activo"));
      document.querySelector(`#${boton.dataset.panel}`).classList.add("activo");
    });
  });

  async function mostrarPanel() {
    vistaLogin.style.display = "none";
    vistaPanel.style.display = "block";
    botonSalir.style.display = "inline-block";
    await Promise.all([cargarArticulos("doctrina"), cargarArticulos("noticias"), cargarDocumentos()]);
  }

  function mostrarLogin() {
    vistaLogin.style.display = "block";
    vistaPanel.style.display = "none";
    botonSalir.style.display = "none";
  }

  async function verificarSesion() {
    const { data } = await MNA_SUPABASE.auth.getSession();
    if (data.session) mostrarPanel(); else mostrarLogin();
  }

  formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    loginError.classList.remove("visible");
    const email = document.querySelector("#admin-email").value.trim();
    const clave = document.querySelector("#admin-clave").value;
    const { error } = await MNA_SUPABASE.auth.signInWithPassword({ email, password: clave });
    if (error) {
      loginError.classList.add("visible");
      return;
    }
    mostrarPanel();
  });

  botonSalir.addEventListener("click", async () => {
    await MNA_SUPABASE.auth.signOut();
    mostrarLogin();
  });

  async function subirArchivo(file, carpeta) {
    if (!file) return null;
    const ruta = `${carpeta}/${Date.now()}-${file.name}`;
    const { error } = await MNA_SUPABASE.storage.from("media").upload(ruta, file);
    if (error) throw error;
    const { data } = MNA_SUPABASE.storage.from("media").getPublicUrl(ruta);
    return { url: data.publicUrl, nombre: file.name };
  }

  document.querySelectorAll("form[data-form-articulo]").forEach((form) => {
    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const categoria = form.dataset.formArticulo;
      const estado = form.querySelector(".form-estado");
      estado.textContent = "Publicando...";
      try {
        const titulo = form.querySelector("[name=titulo]").value.trim();
        const texto = form.querySelector("[name=texto]").value.trim();
        const videoYoutube = form.querySelector("[name=video_youtube]").value.trim();
        const imagenFile = form.querySelector("[name=imagen]").files[0];
        const videoFile = form.querySelector("[name=video_archivo]").files[0];
        const pdfFile = form.querySelector("[name=pdf]").files[0];

        const [imagen, video, pdf] = await Promise.all([
          subirArchivo(imagenFile, "imagenes"),
          subirArchivo(videoFile, "videos"),
          subirArchivo(pdfFile, "pdfs"),
        ]);

        const { error } = await MNA_SUPABASE.from("articulos").insert({
          categoria,
          titulo,
          texto,
          imagen_url: imagen ? imagen.url : null,
          video_youtube_url: videoYoutube || null,
          video_archivo_url: video ? video.url : null,
          video_archivo_nombre: video ? video.nombre : null,
          pdf_url: pdf ? pdf.url : null,
          pdf_nombre: pdf ? pdf.nombre : null,
        });
        if (error) throw error;

        form.reset();
        estado.textContent = "¡Publicado!";
        await cargarArticulos(categoria);
      } catch (e) {
        estado.textContent = "Error al publicar: " + e.message;
      }
    });
  });

  async function cargarArticulos(categoria) {
    const lista = document.querySelector(`#lista-admin-${categoria}`);
    if (!lista) return;
    const { data, error } = await MNA_SUPABASE
      .from("articulos")
      .select("*")
      .eq("categoria", categoria)
      .order("created_at", { ascending: false });
    if (error || !data || !data.length) {
      lista.innerHTML = `<p class="vacio">Todavía no hay artículos.</p>`;
      return;
    }
    lista.innerHTML = data.map((a) => `
      <div class="novedad-admin-item" data-id="${a.id}">
        <div>
          <h4>${a.titulo}</h4>
          <p>${new Date(a.created_at).toLocaleDateString("es-UY")}</p>
        </div>
        <button type="button" class="boton-chico boton-eliminar" data-eliminar-articulo="${a.id}">Eliminar</button>
      </div>
    `).join("");
  }

  document.addEventListener("click", async (evento) => {
    const boton = evento.target.closest("[data-eliminar-articulo]");
    if (!boton) return;
    if (!confirm("¿Eliminar este artículo?")) return;
    const id = boton.dataset.eliminarArticulo;
    const { error } = await MNA_SUPABASE.from("articulos").delete().eq("id", id);
    if (!error) {
      await cargarArticulos("doctrina");
      await cargarArticulos("noticias");
    }
  });

  const formDocumento = document.querySelector("#form-documento");
  formDocumento.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const estado = formDocumento.querySelector(".form-estado");
    estado.textContent = "Publicando...";
    try {
      const titulo = formDocumento.querySelector("[name=titulo]").value.trim();
      const descripcion = formDocumento.querySelector("[name=descripcion]").value.trim();
      const archivoFile = formDocumento.querySelector("[name=archivo]").files[0];
      if (!archivoFile) throw new Error("Falta el archivo.");
      const archivo = await subirArchivo(archivoFile, "pdfs");
      const { error } = await MNA_SUPABASE.from("documentos").insert({
        titulo,
        descripcion,
        archivo_url: archivo.url,
        archivo_nombre: archivo.nombre,
      });
      if (error) throw error;
      formDocumento.reset();
      estado.textContent = "¡Publicado!";
      await cargarDocumentos();
    } catch (e) {
      estado.textContent = "Error al publicar: " + e.message;
    }
  });

  async function cargarDocumentos() {
    const lista = document.querySelector("#lista-admin-documentos");
    if (!lista) return;
    const { data, error } = await MNA_SUPABASE
      .from("documentos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data || !data.length) {
      lista.innerHTML = `<p class="vacio">Todavía no hay documentos.</p>`;
      return;
    }
    lista.innerHTML = data.map((d) => `
      <div class="novedad-admin-item" data-id="${d.id}">
        <div>
          <h4>${d.titulo}</h4>
          <p>${new Date(d.created_at).toLocaleDateString("es-UY")}</p>
        </div>
        <button type="button" class="boton-chico boton-eliminar" data-eliminar-documento="${d.id}">Eliminar</button>
      </div>
    `).join("");
  }

  document.addEventListener("click", async (evento) => {
    const boton = evento.target.closest("[data-eliminar-documento]");
    if (!boton) return;
    if (!confirm("¿Eliminar este documento?")) return;
    const id = boton.dataset.eliminarDocumento;
    const { error } = await MNA_SUPABASE.from("documentos").delete().eq("id", id);
    if (!error) await cargarDocumentos();
  });

  verificarSesion();
});
