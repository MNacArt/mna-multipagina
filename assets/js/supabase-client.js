// Completar con los datos del proyecto de Supabase (Project Settings → API).
// La "anon key" es pública por diseño: la protección real la dan las políticas
// RLS definidas en supabase/schema.sql, no el secreto de esta clave.
const SUPABASE_URL = "SUPABASE_URL";
const SUPABASE_ANON_KEY = "SUPABASE_ANON_KEY";

const MNA_SUPABASE = (SUPABASE_URL !== "SUPABASE_URL" && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
