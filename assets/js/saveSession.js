import { supabase } from "./supabase.js";

export async function saveSession({ duration, type }) {
    try {
        // Evitar guardar basura
        if (!duration || duration <= 0) {
            console.warn("⛔ Sesión ignorada: duración inválida.");
            return;
        }

        // Solo guardamos tipos válidos
        const allowed = ["focus", "timer", "stopwatch"];
        if (!allowed.includes(type)) {
            console.warn(`⛔ Sesión ignorada: tipo no permitido (${type}).`);
            return;
        }

        // Obtener usuario autenticado
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;

        if (!user) {
            console.warn("⛔ No hay usuario autenticado, no se guardará la sesión.");
            return;
        }

        // Guardar en la tabla REAL
        const { error } = await supabase
            .from("pomodoro_sessions")
            .insert([
                {
                    user_id: user.id,
                    duration_minutes: duration,
                    session_type: type,
                }
            ]);

        if (error) {
            console.error("❌ Error guardando sesión:", error);
        } else {
            console.log(`✓ Sesión guardada correctamente → ${duration} min (${type})`);
        }

    } catch (err) {
        console.error("❌ Error general guardando sesión:", err);
    }
}
