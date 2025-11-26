import { supabase } from './supabase.js';

// Elementos del DOM
const toggleDarkMode = document.getElementById('toggle-darkmode');
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


// 2. Manejo de Preferencias
if (localStorage.getItem('theme') === 'light') {
    toggleDarkMode.checked = true;
}

toggleDarkMode.addEventListener('change', (e) => {
    console.log("Tema cambiado:", e.target.checked);
});


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