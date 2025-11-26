import { supabase } from "./supabase.js";

async function loadStats() {

    // Obtener usuario
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
        console.warn("No hay usuario autenticado.");
        return;
    }
    const user = userData.user;

    // Obtener sesiones
    const { data: sessions, error } = await supabase
        .from("pomodoro_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

    if (error) {
        console.error("Error cargando sesiones:", error);
        return;
    }

    if (!sessions) return;

    // ================================
    // Fechas base
    // ================================
    const todayStr = new Date().toISOString().slice(0, 10);

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Domingo

    const currentMonth = now.getMonth() + 1;

    // ================================
    // Acumuladores Pomodoro (solo focus)
    // ================================
    let daily = [0, 0, 0, 0, 0, 0, 0];

    let todaySessions = 0;
    let todayMinutes = 0;

    let weekSessions = 0;
    let weekMinutes = 0;

    let monthSessions = 0;
    let monthMinutes = 0;

    // ================================
    // Timer + Stopwatch
    // ================================
    let timerMinutes = 0;
    let timerSessions = 0;

    let swMinutes = 0;
    let swSessions = 0;
    let swLongest = 0;

    // ================================
    // Procesar sesiones
    // ================================
    sessions.forEach((s) => {
        const d = new Date(s.completed_at);
        const dayIndex = d.getDay();
        const dayStr = d.toISOString().slice(0, 10);

        const minutes = s.duration_minutes;
        const type = s.session_type;   // 🔥 TIPO CORRECTO DE LA BASE

        // --- POMODORO (solo focus) ---
        if (type === "focus") {

            daily[dayIndex] += minutes;

            if (dayStr === todayStr) {
                todaySessions++;
                todayMinutes += minutes;
            }

            if (d >= weekStart) {
                weekSessions++;
                weekMinutes += minutes;
            }

            if (d.getMonth() + 1 === currentMonth) {
                monthSessions++;
                monthMinutes += minutes;
            }
        }

        // --- TIMER ---
        if (type === "timer") {
            timerSessions++;
            timerMinutes += minutes;
        }

        // --- STOPWATCH ---
        if (type === "stopwatch") {
            swSessions++;
            swMinutes += minutes;
            if (minutes > swLongest) swLongest = minutes;
        }
    });

    // ================================
    // UI Pomodoro
    // ================================

    document.getElementById("today-sessions").textContent = todaySessions;
    document.getElementById("today-minutes").textContent = todayMinutes;

    document.getElementById("week-sessions").textContent = weekSessions;
    document.getElementById("week-minutes").textContent = weekMinutes;

    document.getElementById("month-sessions").textContent = monthSessions;
    document.getElementById("month-minutes").textContent = monthMinutes;

    // Barras del gráfico
    const barIDs = [
        "bar-sun",
        "bar-mon",
        "bar-tue",
        "bar-wed",
        "bar-thu",
        "bar-fri",
        "bar-sat",
    ];

    const max = Math.max(...daily, 1);

    daily.forEach((min, i) => {
        const bar = document.getElementById(barIDs[i]);
        if (!bar) return;
        bar.style.height = `${(min / max) * 120}px`;
    });

    // Mejor día
    const dias = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    const bestIndex = daily.indexOf(Math.max(...daily));

    document.getElementById("best-day-text").textContent =
        `Tu mejor día fue el ${dias[bestIndex]} (${daily[bestIndex]} min).`;

    // Promedio semanal / 7 (Opción A)
    const weeklyTotal = daily.reduce((a, b) => a + b, 0);
    const weeklyAvg = weeklyTotal / 7;

    document.getElementById("weekly-average-text").textContent =
        `Promedio semanal: ${weeklyAvg.toFixed(1)} min.`;

    const dailyAverageSpan = document.getElementById("daily-average");
    if (dailyAverageSpan) {
        dailyAverageSpan.textContent = weeklyAvg.toFixed(1);
    }

    // ================================
    // UI Timer
    // ================================
    const timerTotalEl = document.getElementById("timer-total-minutes");
    const timerAvgEl = document.getElementById("timer-avg-minutes");

    if (timerTotalEl && timerAvgEl) {
        const avg = timerSessions ? timerMinutes / timerSessions : 0;

        timerTotalEl.textContent = timerMinutes;
        timerAvgEl.textContent = avg.toFixed(1);
    }

    // ================================
    // UI Stopwatch
    // ================================
    const swTotalEl = document.getElementById("sw-total-minutes");
    const swLongestEl = document.getElementById("sw-longest");
    const swAvgEl = document.getElementById("sw-avg-minutes");

    if (swTotalEl && swLongestEl && swAvgEl) {
        const avg = swSessions ? swMinutes / swSessions : 0;

        swTotalEl.textContent = swMinutes;
        swLongestEl.textContent = swLongest;
        swAvgEl.textContent = avg.toFixed(1);
    }
}

// Ejecutar
loadStats();
