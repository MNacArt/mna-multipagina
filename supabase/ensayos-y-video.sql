-- Ensayos de interés (Noticias): tabla nueva + los 5 ensayos que ya estaban publicados.
-- El video de interés NO necesita tabla nueva: usa la tabla contenido_sitio que ya existe.
-- Ejecutar completo en: Supabase → SQL Editor → New query → Run.

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

drop policy if exists "ensayos_lectura_publica" on public.ensayos;
create policy "ensayos_lectura_publica"
  on public.ensayos for select
  using (publicado = true);

drop policy if exists "ensayos_escritura_admin" on public.ensayos;
create policy "ensayos_escritura_admin"
  on public.ensayos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Los 5 ensayos actuales (solo se cargan si la tabla está vacía, así no se duplican).
insert into public.ensayos (titulo, autor, fecha, url, created_at)
select * from (values
  ('Matar a la hidra: La tradición como herramienta contra el pacto moderno. Pt. I',
   'G. Zaballa', date '2026-06-11',
   'https://gzaballa.blogspot.com/2026/06/ensayos-matar-la-hidra-la-tradicion.html',
   now() - interval '1 minute'),
  ('La muerte de las democracias liberales y el auge de las democracias iliberales en el mundo',
   'G. Zaballa', date '2025-09-28',
   'https://gzaballa.blogspot.com/2025/09/ensayos-la-muerte-de-las-democracias.html',
   now() - interval '2 minutes'),
  ('Sobre la sociedad tecno-industrial, Pte. 3',
   'G. Zaballa', date '2025-09-28',
   'https://gzaballa.blogspot.com/2025/09/ensayos-sobre-la-sociedad-tecno_71.html',
   now() - interval '3 minutes'),
  ('Sobre la sociedad tecno-industrial, Pte. 2',
   'G. Zaballa', date '2025-09-28',
   'https://gzaballa.blogspot.com/2025/09/ensayos-sobre-la-sociedad-tecno_28.html',
   now() - interval '4 minutes'),
  ('Sobre la sociedad tecno-industrial, Pte. 1',
   'G. Zaballa', date '2025-09-28',
   'https://gzaballa.blogspot.com/2025/09/ensayos-sobre-la-sociedad-tecno.html',
   now() - interval '5 minutes')
) as v(titulo, autor, fecha, url, created_at)
where not exists (select 1 from public.ensayos);
