// Cliente PostgreSQL para substituir Supabase
import { postgres } from '@/lib/postgres-client';

// Para compatibilidade, exportar postgres como supabase
export const supabase = postgres;

// Se quiser usar Supabase original, descomente as linhas abaixo:
/*
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pmvbdzzlylfsltwcdfqg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtdmJkenpseWxmc2x0d2NkZnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwOTk3NTAsImV4cCI6MjA2OTY3NTc1MH0.EByinYcdhBei-IqBQSFItZ5FQKZwpNp4w6Jr2oleETw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
*/