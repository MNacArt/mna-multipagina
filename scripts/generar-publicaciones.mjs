// Genera una página HTML estática por cada publicación (para que Google las indexe) y actualiza sitemap.xml.
// Lo ejecuta el flujo .github/workflows/publicar-sitio.yml al publicar el sitio; no hay que correrlo a mano.
//   node scripts/generar-publicaciones.mjs <carpeta-de-salida>
// Lee content/noticias.json y content/propuestas-novedades.json y usa articulo.html como plantilla.
// Escribe:  <salida>/noticias/<id>.html   <salida>/novedades/<id>.html   <salida>/sitemap.xml
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const SITIO = "https://mnacionalartiguista.org";
const salida = process.argv[2];
if (!salida) {
  console.error("Falta la carpeta de salida.");
  process.exit(1);
}

const CATEGORIAS = [
  { carpeta: "noticias", archivo: "content/noticias.json", etiqueta: "Noticias", volver: "noticias.html", volverTexto: "Volver a Noticias" },
  { carpeta: "novedades", archivo: "content/propuestas-novedades.json", etiqueta: "Novedades", volver: "propuestas.html", volverTexto: "Volver a Propuestas y Novedades" },
];

const escapar = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const conSaltos = (t) => escapar(t).replace(/\r?\n/g, "<br>");
const media = (r) => (r ? String(r).replace(/^\//, "") : "");
// Igual que MNA_DATOS.slug en assets/js/datos.js: los enlaces de las tarjetas dependen de que coincidan.
const slug = (a) =>
  (String(a.fecha || "").slice(0, 10) + "-" + String(a.titulo || ""))
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const fechaLegible = (v) => {
  if (!v) return "";
  const f = new Date(String(v).slice(0, 10) + "T00:00:00Z");
  return isNaN(f) ? "" : f.toLocaleDateString("es-UY", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};
const fechaIso = (v) => (/^\d{4}-\d{2}-\d{2}/.test(String(v || "")) ? String(v).slice(0, 10) : "");
const idYoutube = (url) => {
  const m = String(url || "").match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};
const resumen = (texto) => {
  const plano = String(texto || "").replace(/[•▪·]\s*/g, "").replace(/\s+/g, " ").trim();
  if (plano.length <= 155) return plano;
  const corte = plano.slice(0, 155);
  return corte.slice(0, corte.lastIndexOf(" ")) + "…";
};
const absoluta = (ruta) => (/^https?:\/\//i.test(ruta) ? ruta : `${SITIO}/${media(ruta)}`);

let plantilla;
try {
  plantilla = readFileSync("articulo.html", "utf8").replace(/\r\n/g, "\n");
} catch (e) {
  console.error("No se encontró articulo.html (plantilla).");
  process.exit(1);
}
const inicioMain = plantilla.indexOf("<main>");
const finMain = plantilla.indexOf("</main>");
if (inicioMain < 0 || finMain < 0) {
  console.error("La plantilla articulo.html no tiene <main>.");
  process.exit(1);
}
let cabecera = plantilla.slice(0, inicioMain);
let pie = plantilla.slice(finMain);

// Cabecera base: sin título, descripción, canonical, robots, Open Graph ni Twitter (se agregan por publicación).
cabecera = cabecera
  .replace(/<title>[^<]*<\/title>\n?/g, "")
  .replace(/<meta name="description"[^>]*>\n?/g, "")
  .replace(/<meta name="robots"[^>]*>\n?/g, "")
  .replace(/<link rel="canonical"[^>]*>\n?/g, "")
  .replace(/<meta (?:property|name)="(?:og|twitter):[^>]*>\n?/g, "")
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, "")
  .replace('<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<base href="/">');
pie = pie
  .replace(/<script src="assets\/js\/datos\.js"><\/script>\n?/g, "")
  .replace(/<script src="assets\/js\/articulo\.js"><\/script>\n?/g, "");

function pagina(cat, a, url) {
  const titulo = String(a.titulo || "Publicación");
  const descripcion = resumen(a.texto) || "Publicación del Movimiento Nacional Artiguista.";
  const iso = fechaIso(a.fecha);
  const imagen = a.imagen ? absoluta(a.imagen) : `${SITIO}/assets/img/og-imagen.jpg`;
  const tituloPagina = `${titulo} — Movimiento Nacional Artiguista de Uruguay`;

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        headline: titulo.slice(0, 110),
        description: descripcion,
        inLanguage: "es-UY",
        mainEntityOfPage: url,
        image: [imagen],
        ...(iso ? { datePublished: iso, dateModified: iso } : {}),
        author: { "@type": "Organization", name: "Movimiento Nacional Artiguista", url: `${SITIO}/` },
        publisher: {
          "@type": "Organization",
          name: "Movimiento Nacional Artiguista",
          url: `${SITIO}/`,
          logo: { "@type": "ImageObject", url: `${SITIO}/assets/img/logo-nuevo.png` },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITIO}/` },
          { "@type": "ListItem", position: 2, name: cat.etiqueta, item: `${SITIO}/${cat.volver}` },
          { "@type": "ListItem", position: 3, name: titulo, item: url },
        ],
      },
    ],
  };

  const meta = [
    `<title>${escapar(tituloPagina)}</title>`,
    `<meta name="description" content="${escapar(descripcion)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:locale" content="es_UY">`,
    `<meta property="og:site_name" content="Movimiento Nacional Artiguista">`,
    `<meta property="og:title" content="${escapar(titulo)}">`,
    `<meta property="og:description" content="${escapar(descripcion)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${escapar(imagen)}">`,
    ...(iso ? [`<meta property="article:published_time" content="${iso}">`] : []),
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapar(tituloPagina)}">`,
    `<meta name="twitter:description" content="${escapar(descripcion)}">`,
    `<meta name="twitter:image" content="${escapar(imagen)}">`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`,
  ].join("\n");

  const parrafos = String(a.texto || "")
    .split(/\r?\n\s*\r?\n/)
    .filter((p) => p.trim())
    .map((p) => `<p>${conSaltos(p.trim())}</p>`)
    .join("\n    ");
  const yt = idYoutube(a.youtube);
  const descargas = [
    a.video ? `<a href="${escapar(media(a.video))}" download class="boton boton-secundario">🎬 Descargar video</a>` : "",
    a.pdf ? `<a href="${escapar(media(a.pdf))}" download class="boton boton-secundario">📄 Descargar PDF</a>` : "",
  ].filter(Boolean).join("\n      ");

  const main = `<main>
  <section class="pagina-hero">
    <div class="contenedor">
      <p class="eyebrow">${escapar(cat.etiqueta)}</p>
      <h1>${escapar(titulo)}</h1>
      <p class="articulo__fecha">${escapar(fechaLegible(a.fecha))}</p>
    </div>
  </section>

  <section class="seccion">
    <div class="contenedor articulo">
    ${a.imagen ? `<img src="${escapar(media(a.imagen))}" alt="" class="articulo__imagen">\n    ` : ""}${parrafos}
    ${yt ? `<div class="video-incrustado"><iframe src="https://www.youtube-nocookie.com/embed/${yt}" title="Video" loading="lazy" allowfullscreen></iframe></div>\n    ` : ""}${descargas ? `<div class="articulo__descargas">\n      ${descargas}\n    </div>\n    ` : ""}<a href="${cat.volver}" class="tarjeta__enlace articulo__volver">← ${escapar(cat.volverTexto)}</a>
    </div>
  </section>
`;
  return cabecera.replace("</head>", `${meta}\n</head>`) + main + pie;
}

const nuevas = [];
for (const cat of CATEGORIAS) {
  let datos;
  try {
    datos = JSON.parse(readFileSync(cat.archivo, "utf8"));
  } catch (e) {
    console.warn(`Se omite ${cat.archivo}: ${e.message}`);
    continue;
  }
  const items = Array.isArray(datos && datos.items) ? datos.items : [];
  const vistos = new Set();
  mkdirSync(join(salida, cat.carpeta), { recursive: true });
  for (const a of items) {
    try {
      if (!a || !a.titulo) continue;
      const id = slug(a);
      if (!id || vistos.has(id)) continue;
      vistos.add(id);
      const url = `${SITIO}/${cat.carpeta}/${id}.html`;
      writeFileSync(join(salida, cat.carpeta, `${id}.html`), pagina(cat, a, url), "utf8");
      nuevas.push({ url, lastmod: fechaIso(a.fecha) });
    } catch (e) {
      console.warn(`No se pudo generar "${a && a.titulo}": ${e.message}`);
    }
  }
  console.log(`${cat.carpeta}: ${vistos.size} página(s)`);
}

// sitemap.xml: las páginas fijas del repositorio + las publicaciones generadas.
try {
  const base = existsSync("sitemap.xml") ? readFileSync("sitemap.xml", "utf8") : "";
  const fijas = (base.match(/<url>[\s\S]*?<\/url>/g) || []).filter((u) => !/\/(noticias|novedades)\//.test(u));
  const extra = nuevas.map((n) => `  <url>\n    <loc>${n.url}</loc>${n.lastmod ? `\n    <lastmod>${n.lastmod}</lastmod>` : ""}\n  </url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...fijas.map((u) => (u.startsWith("  ") ? u : "  " + u)), ...extra].join("\n")}\n</urlset>\n`;
  writeFileSync(join(salida, "sitemap.xml"), xml, "utf8");
  console.log(`sitemap.xml: ${fijas.length} fija(s) + ${extra.length} publicación(es)`);
} catch (e) {
  console.warn(`No se pudo actualizar sitemap.xml: ${e.message}`);
}
