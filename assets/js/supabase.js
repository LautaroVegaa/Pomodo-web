// Configuración de Supabase
const SUPABASE_URL = 'https://orncjnegojcpkibnuipd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybmNqbmVnb2pjcGtpYm51aXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTE1NDEsImV4cCI6MjA3OTYyNzU0MX0.z_wVjB-7MQJnB4XDfkuNJ_fAK_g8PqlpgT0E9sq-rn8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function saveSession(minutes, type) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return; // Si no hay auth, podrías guardar en localStorage temporalmente

    const { error } = await supabase.from('pomodoro_sessions').insert({
        user_id: user.id,
        duration_minutes: minutes,
        type: type,
        completed_at: new Date().toISOString()
    });

    if (error) console.error('Error guardando sesión:', error);
}

export async function getStats() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return null;

    // Aquí implementarías la misma lógica de "PomodoroDataService"
    // Usando .rpc() si creas una función SQL o .select() directo.
    // Para simplificar, devolvemos un mock si no hay backend activo
    return {
        todaySessions: 0,
        todayMinutes: 0,
        streak: 0
    };
}

export { supabase };