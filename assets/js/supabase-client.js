// Completar con los datos del proyecto de Supabase (Project Settings → API).
// La "anon key" es pública por diseño: la protección real la dan las políticas
// RLS definidas en supabase/schema.sql, no el secreto de esta clave.
const SUPABASE_URL = "https://wkiwdcaefhjwfdghnmor.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraXdkY2FlZmhqd2ZkZ2hubW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNjY3MDgsImV4cCI6MjEwNjc0MjcwOH0.BbICtk2NcSMeoBWyTEjO8mKHZ_hlO5IMzw7Fwrgt1uo";

const MNA_SUPABASE = (SUPABASE_URL !== "SUPABASE_URL" && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
