-- Esquema para el backend de contenido del sitio MNA (Supabase/Postgres).
-- Ejecutar completo en: Supabase → SQL Editor → New query → Run.
-- Después, crear el bucket de Storage "media" como público (ver instrucciones
-- aparte) y un usuario en Authentication → Users para el login del panel admin.

-- ---------- Tabla articulos (Doctrina/Actualidad y Noticias) ----------
create table if not exists public.articulos (
  id uuid primary key default gen_random_uuid(),
  categoria text not null check (categoria in ('doctrina', 'noticias')),
  titulo text not null,
  texto text,
  imagen_url text,
  video_youtube_url text,
  video_archivo_url text,
  video_archivo_nombre text,
  pdf_url text,
  pdf_nombre text,
  publicado boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.articulos enable row level security;

create policy "articulos_lectura_publica"
  on public.articulos for select
  using (publicado = true);

create policy "articulos_escritura_admin"
  on public.articulos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------- Tabla documentos (documentos oficiales, sección Noticias) ----------
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  archivo_url text not null,
  archivo_nombre text not null,
  publicado boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.documentos enable row level security;

create policy "documentos_lectura_publica"
  on public.documentos for select
  using (publicado = true);

create policy "documentos_escritura_admin"
  on public.documentos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------- Tabla contenido_sitio (texto e imágenes editables de las páginas) ----------
create table if not exists public.contenido_sitio (
  clave text primary key,
  tipo text not null check (tipo in ('texto', 'imagen')),
  valor text not null,
  updated_at timestamptz not null default now()
);

alter table public.contenido_sitio enable row level security;

create policy "contenido_lectura_publica"
  on public.contenido_sitio for select
  using (true);

create policy "contenido_escritura_admin"
  on public.contenido_sitio for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------- Storage: bucket "media" ----------
-- No se puede crear el bucket por SQL con una cuenta normal; se crea a mano
-- desde Storage → New bucket → nombre "media" → marcar "Public bucket".
-- Las políticas de abajo son las que hay que agregar sobre ese bucket
-- (Storage → media → Policies), o correr esto después de crearlo:

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_lectura_publica"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "media_escritura_admin"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "media_actualizacion_admin"
  on storage.objects for update
  using (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "media_borrado_admin"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'authenticated');


-- ---------- Tabla ensayos (Ensayos de interés, sección Noticias) ----------
-- Para una base ya creada, usar supabase/ensayos-y-video.sql (incluye los ensayos iniciales).
-- El video de interés se guarda en contenido_sitio con la clave "noticias.video.url".
create table if not exists public.ensayos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  autor text,
  fecha date,
  url text not null,
  publicado boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.ensayos enable row level security;

create policy "ensayos_lectura_publica"
  on public.ensayos for select
  using (publicado = true);

create policy "ensayos_escritura_admin"
  on public.ensayos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
