// assets/js/supabase.js

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configuración de Supabase
const SUPABASE_URL = "https://orncjnegojcpkibnuipd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybmNqbmVnb2pjcGtpYm51aXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTE1NDEsImV4cCI6MjA3OTYyNzU0MX0.z_wVjB-7MQJnB4XDfkuNJ_fAK_g8PqlpgT0E9sq-rn8";

// Cliente de Supabase (única exportación)
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
