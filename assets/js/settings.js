import { supabase } from './supabase.js';

// Elementos del DOM
const toggleDarkMode = document.getElementById('toggle-darkmode');
// --- NUEVOS ELEMENTOS PARA SONIDO Y NOTIFICACIONES ---
const toggleNotifications = document.getElementById('toggle-notifications');
const toggleSound = document.getElementById('toggle-sound');

const btnLogout = document.getElementById('btn-logout-settings');

// Elementos del Modal Logout
const modalLogout = document.getElementById('modal-logout-confirm');
const btnConfirmLogout = document.getElementById('btn-confirm-logout');
const btnCancelLogout = document.getElementById('btn-cancel-logout');

// Elementos del Perfil
const elAvatar = document.getElementById('profile-avatar');
const elName = document.getElementById('profile-name');
const elSessions = document.getElementById('profile-sessions');
const elLevel = document.getElementById('profile-level');


// 1. Cargar Datos del Usuario al iniciar
async function loadUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // A) Nombre
        const fullName = user.user_metadata?.full_name || "Usuario";
        elName.textContent = fullName;

        // B) Iniciales
        const initials = fullName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
        elAvatar.textContent = initials;

        // C) Calcular Stats
        await calculateStats(user.id);
        
        btnLogout.innerHTML = 'Cerrar sesión';
    } else {
        // Modo Invitado
        elName.textContent = "Invitado";
        elAvatar.textContent = "?";
        elSessions.textContent = "-";
        elLevel.textContent = "-";
        
        // Cambiar texto a "Iniciar sesión" y color azul
        btnLogout.textContent = 'Iniciar sesión';
        btnLogout.style.background = "rgba(59, 130, 246, 0.1)";
        btnLogout.style.color = "#60a5fa";
        btnLogout.style.borderColor = "rgba(59, 130, 246, 0.2)";
    }
}

async function calculateStats(userId) {
    try {
        const { count, error } = await supabase
            .from('pomodoro_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) throw error;

        const totalSessions = count || 0;
        elSessions.textContent = `${totalSessions} sesiones`;

        const level = Math.floor(totalSessions / 10) + 1;
        elLevel.textContent = `Nivel ${level}`;

    } catch (err) {
        console.error("Error cargando stats:", err);
    }
}

loadUserProfile();


// ==========================================
// 2. MANEJO DE PREFERENCIAS (MODIFICADO)
// ==========================================

// --- A) MODO OSCURO ---
if (localStorage.getItem('theme') === 'light') {
    if (toggleDarkMode) toggleDarkMode.checked = true;
}
if (toggleDarkMode) {
    toggleDarkMode.addEventListener('change', (e) => {
        console.log("Tema cambiado:", e.target.checked);
        // Aquí podrías agregar lógica para guardar 'theme' si quisieras
    });
}

// --- B) SONIDO ---
// Cargar estado (por defecto true si no existe 'false')
const isSoundOn = localStorage.getItem('pref_sound') !== 'false';
if (toggleSound) toggleSound.checked = isSoundOn;

// Guardar al cambiar
if (toggleSound) {
    toggleSound.addEventListener('change', (e) => {
        localStorage.setItem('pref_sound', e.target.checked);
    });
}

// --- C) NOTIFICACIONES ---
// Cargar estado (por defecto true si no existe 'false')
const isNotifOn = localStorage.getItem('pref_notifications') !== 'false';
if (toggleNotifications) toggleNotifications.checked = isNotifOn;

// Guardar al cambiar y pedir permiso
if (toggleNotifications) {
    toggleNotifications.addEventListener('change', (e) => {
        localStorage.setItem('pref_notifications', e.target.checked);
        
        // Si el usuario activa el switch, pedimos permiso al navegador
        if (e.target.checked && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    });
}


// 3. Lógica de Botón Principal (Cerrar/Iniciar)
btnLogout.addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Si hay usuario -> ABRIR MODAL
        modalLogout.classList.remove('auth-modal-hidden');
    } else {
        // Si NO hay usuario -> Ir al login (Home)
        window.location.href = "index.html"; 
    }
});


// 4. Eventos del Modal de Logout

// Cancelar
btnCancelLogout.addEventListener('click', () => {
    modalLogout.classList.add('auth-modal-hidden');
});

// Confirmar Salida
btnConfirmLogout.addEventListener('click', async () => {
    modalLogout.classList.add('auth-modal-hidden');
    
    // Ejecutar Logout
    await supabase.auth.signOut();
    window.location.href = "index.html";
});

// Cerrar al hacer clic fuera del modal (backdrop)
modalLogout.querySelector('.auth-backdrop').addEventListener('click', () => {
    modalLogout.classList.add('auth-modal-hidden');
});