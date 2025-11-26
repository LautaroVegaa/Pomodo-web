// ===========================
// IMPORTS
// ===========================
import { PomodoroTimer } from './pomodoro.js';
import { TimerMode } from './timer.js';
import { Stopwatch } from './stopwatch.js';
import { saveSession } from './saveSession.js';
import { supabase } from './supabase.js';


// AUDIO (NUEVO)
// ===========================
// Asegúrate de que el archivo esté en assets/sounds/alarm.mp3
const alarmAudio = new Audio('assets/sounds/pomodoro_ring.mp3.wav');

// ===========================
// FUNCIÓN PARA PLAY/PAUSE
// ===========================
function updatePlayButton(button, isRunning) {
    button.textContent = isRunning ? "⏸" : "▶";
}


// ===========================
// ELEMENTOS DE LA UI
// ===========================

// Tabs
const tabs = document.querySelectorAll(".tab");
const viewPomodoro = document.getElementById('view-pomodoro');
const viewTimer = document.getElementById('view-timer');
const viewStopwatch = document.getElementById('view-stopwatch');

// Displays
const displayPomodoro = document.getElementById('pomodoro-time');
const displayTimer = document.getElementById('timer-time');
const displayStopwatch = document.getElementById('stopwatch-time');

// Botones dentro de cada card
const pomoBtns = viewPomodoro.querySelector('.actions');
const timerBtns = viewTimer.querySelector('.actions');
const swBtns = viewStopwatch.querySelector('.actions');

// Slider del Timer
const timerSlider = document.getElementById("timer-slider");
const timerSliderValue = document.getElementById("timer-slider-value");


// ==========================================
//          SISTEMA DE AUTENTICACIÓN
// ==========================================

const btnLoginHeader = document.getElementById("btn-login");

// Modales
const modalLogin = document.getElementById("modal-login");
const modalRegister = document.getElementById("modal-register");
const modalAlert = document.getElementById("modal-alert");
const modalProfile = document.getElementById("modal-profile"); // Perfil
const modalTasks = document.getElementById("modal-tasks");     // Tareas (NUEVO)

// Elementos de la Alerta
const alertTitle = document.getElementById("alert-title");
const alertMsg = document.getElementById("alert-message");
const btnAlertOk = document.getElementById("btn-alert-ok");

// Elementos del Perfil
const btnCloseProfile = document.getElementById("close-profile");
const profileNameEl = document.getElementById("profile-name");
const profileEmailEl = document.getElementById("profile-email");
const profileAvatarEl = document.getElementById("profile-avatar-text");

// Formularios
const formLogin = document.getElementById("form-login");
const formRegister = document.getElementById("form-register");

// Links de cambio (toggle)
const linkToRegister = document.getElementById("link-to-register");
const linkToLogin = document.getElementById("link-to-login");

// Backdrops
const backdrops = document.querySelectorAll(".auth-backdrop");


// --- 0. Función de Alerta Personalizada ---
function showNotification(message, title = "Pomodō") {
    alertTitle.textContent = title;
    alertMsg.textContent = message;
    modalAlert.classList.remove("auth-modal-hidden");
}

btnAlertOk.addEventListener("click", () => {
    modalAlert.classList.add("auth-modal-hidden");
});


// --- 1. Verificar Usuario ---
async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const fullName = user.user_metadata?.full_name || "Usuario";
        btnLoginHeader.textContent = `👤 ${fullName}`;
    } else {
        btnLoginHeader.textContent = "👤 Login";
    }
}
checkUser();


// --- 2. Abrir / Cerrar Modales ---

function showLogin() {
    modalRegister.classList.add("auth-modal-hidden");
    modalLogin.classList.remove("auth-modal-hidden");
}

function showRegister() {
    modalLogin.classList.add("auth-modal-hidden");
    modalRegister.classList.remove("auth-modal-hidden");
}

function closeAuthModals() {
    // Cerrar TODOS los modales
    modalLogin.classList.add("auth-modal-hidden");
    modalRegister.classList.add("auth-modal-hidden");
    modalAlert.classList.add("auth-modal-hidden");
    modalProfile.classList.add("auth-modal-hidden");
    modalTasks.classList.add("auth-modal-hidden");
}

// Click en Nombre de Usuario (Header)
btnLoginHeader.addEventListener("click", async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // SI ESTÁ LOGUEADO: Mostrar Perfil
        const fullName = user.user_metadata?.full_name || "Usuario";
        profileNameEl.textContent = fullName;
        profileEmailEl.textContent = user.email;

        // Generar iniciales
        const initials = fullName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
        profileAvatarEl.textContent = initials || "U";

        modalProfile.classList.remove("auth-modal-hidden");
    } else {
        // SI NO ESTÁ LOGUEADO: Abrir Login
        showLogin();
    }
});

// Cerrar Perfil
btnCloseProfile.addEventListener("click", () => {
    modalProfile.classList.add("auth-modal-hidden");
});

// Toggles entre Login y Registro
linkToRegister.addEventListener("click", showRegister);
linkToLogin.addEventListener("click", showLogin);

// Cerrar al hacer click en el fondo oscuro
backdrops.forEach(bd => {
    bd.addEventListener("click", closeAuthModals);
});


// --- 3. Lógica de Login ---
formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const btn = formLogin.querySelector("button");

    try {
        btn.textContent = "Entrando...";
        btn.disabled = true;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        closeAuthModals();
        checkUser();
        showNotification("¡Bienvenido de nuevo!");

    } catch (err) {
        showNotification(err.message, "Error");
    } finally {
        btn.textContent = "Iniciar Sesión";
        btn.disabled = false;
    }
});


// --- 4. Lógica de Registro ---
formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const confirmPass = document.getElementById("reg-password-confirm").value;
    const btn = formRegister.querySelector("button");

    if (password !== confirmPass) {
        showNotification("Las contraseñas no coinciden", "Error");
        return;
    }

    try {
        btn.textContent = "Creando cuenta...";
        btn.disabled = true;

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name }
            }
        });

        if (error) throw error;

        closeAuthModals();
        checkUser();
        showNotification(`¡Hola ${name}! Tu cuenta ha sido creada.`);

    } catch (err) {
        showNotification(err.message, "Error");
    } finally {
        btn.textContent = "Crear Cuenta";
        btn.disabled = false;
    }
});


// ==========================================
//          SISTEMA DE TAREAS (PERSISTENTE)
// ==========================================
const btnTasks = document.getElementById("btn-tasks");
const closeTasks = document.getElementById("close-tasks");
const formAddTask = document.getElementById("form-add-task");
const inputTask = document.getElementById("input-task");
const tasksList = document.getElementById("tasks-list");

// 1. Cargar tareas guardadas al iniciar (o array vacío si no existen)
let tasks = JSON.parse(localStorage.getItem('pomodo_tasks')) || [];

// 2. Función para guardar en localStorage
function saveTasks() {
    localStorage.setItem('pomodo_tasks', JSON.stringify(tasks));
}

// Abrir Modal de Tareas
btnTasks.addEventListener("click", () => {
    renderTasks();
    modalTasks.classList.remove("auth-modal-hidden");
    inputTask.focus(); // Poner foco en el input
});

// Cerrar Modal
closeTasks.addEventListener("click", () => {
    modalTasks.classList.add("auth-modal-hidden");
});

// Agregar Tarea
formAddTask.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = inputTask.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveTasks(); // <--- GUARDAR CAMBIOS
    
    inputTask.value = "";
    renderTasks();
});

// Renderizar Lista
function renderTasks() {
    tasksList.innerHTML = "";

    if (tasks.length === 0) {
        tasksList.innerHTML = '<div class="empty-state">No hay tareas pendientes</div>';
        return;
    }

    tasks.forEach(task => {
        const item = document.createElement("div");
        item.className = `task-item ${task.completed ? "completed" : ""}`;

        item.innerHTML = `
            <div class="task-check ${task.completed ? "checked" : ""}" onclick="toggleTask(${task.id})">
                ${task.completed ? "✓" : ""}
            </div>
            <span class="task-text">${task.text}</span>
            <button class="btn-delete-task" onclick="deleteTask(${task.id})">🗑</button>
        `;
        
        tasksList.appendChild(item);
    });
}

// Funciones Globales (para acceder desde el HTML onclick)
window.toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks(); // <--- GUARDAR CAMBIOS
        renderTasks();
    }
};

window.deleteTask = (id) => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(); // <--- GUARDAR CAMBIOS
    renderTasks();
};


// ===========================
// QUICK SETTINGS MODAL
// ===========================
const qsModal = document.getElementById("qs-modal");
const qsModalTitle = document.getElementById("qs-modal-title");
const qsModalValue = document.getElementById("qs-modal-value");
const qsModalSlider = document.getElementById("qs-modal-slider");
const qsModalSave = document.getElementById("qs-modal-save");

const qsFocusBox = document.querySelector(".qs-box:nth-child(1)");
const qsBreakBox = document.querySelector(".qs-box:nth-child(2)");

let qsMode = "focus";


// ==========================
// EVENTOS QUICK SETTINGS
// ==========================

function openSettingsModal(title, max, currentVal) {
    qsModalTitle.textContent = title;
    qsModalSlider.max = max;
    qsModalSlider.value = currentVal;
    qsModalValue.textContent = `${Math.floor(currentVal)} min`;
    qsModal.classList.remove("qs-modal-hidden");
}

qsFocusBox.addEventListener("click", () => {
    qsMode = "focus";
    openSettingsModal("Focus Time", 60, pomodoro.defaultWork / 60);
});

qsBreakBox.addEventListener("click", () => {
    qsMode = "break";
    openSettingsModal("Short Break", 30, pomodoro.defaultShort / 60);
});

qsModalSlider.addEventListener("input", () => {
    qsModalValue.textContent = `${qsModalSlider.value} min`;
});

qsModalSave.addEventListener("click", () => {
    const minutes = Number(qsModalSlider.value);

    if (qsMode === "focus") {
        pomodoro.defaultWork = minutes * 60;
        if (pomodoro.phase === "work" && !pomodoro.isRunning) {
            pomodoro.totalSeconds = pomodoro.defaultWork;
            if (currentMode === "pomodoro") {
                displayPomodoro.textContent = pomodoro.formatTime();
            }
        }
        qsFocusBox.querySelector(".qs-number").textContent = minutes;
    }

    if (qsMode === "break") {
        pomodoro.defaultShort = minutes * 60;
        qsBreakBox.querySelector(".qs-number").textContent = minutes;
    }

    qsModal.classList.add("qs-modal-hidden");
});

qsModal.addEventListener("click", (e) => {
    if (e.target === qsModal) {
        qsModal.classList.add("qs-modal-hidden");
    }
});


// ===========================
// ESTADO GLOBAL
// ===========================
let currentMode = "pomodoro";


// ===========================
// INSTANCIAS
// ===========================

// POMODORO
const pomodoro = new PomodoroTimer(
    (time, isRunning, phaseLabel, finishedPhase) => {
        if (currentMode !== "pomodoro") return;

        displayPomodoro.textContent = time;

        const pill = viewPomodoro.querySelector(".pill");
        pill.textContent = phaseLabel;

        updatePlayButton(pomoBtns.children[0], isRunning);

        // 🔥 LOGICA DE AUDIO AGREGADA AQUI
        if (finishedPhase) {
            alarmAudio.currentTime = 0; // Reiniciar audio
            alarmAudio.play().catch(e => console.error("Error reproduciendo audio:", e));
        }
    },

    (minutesStudied) => {
        if (!minutesStudied || minutesStudied <= 0) return;
        saveSession({
            duration: minutesStudied,
            type: "focus"
        });
    }
);

// TIMER
const customTimer = new TimerMode((time, isRunning, completedMinutes = null) => {
    if (currentMode !== "timer") return;

    displayTimer.textContent = time;
    timerSliderValue.textContent = time;

    updatePlayButton(timerBtns.children[0], isRunning);

    if (typeof completedMinutes === "number" && completedMinutes > 0) {
        saveSession({
            duration: completedMinutes,
            type: "timer"
        });
    }
});

// STOPWATCH
const stopwatch = new Stopwatch((time, isRunning, completedMinutes = null) => {
    if (currentMode !== "stopwatch") return;

    displayStopwatch.textContent = time;

    updatePlayButton(swBtns.children[0], isRunning);

    if (typeof completedMinutes === "number" && completedMinutes > 0) {
        saveSession({
            duration: completedMinutes,
            type: "stopwatch"
        });
    }
});


// ===========================
// CAMBIAR ENTRE VISTAS
// ===========================
function activateView(mode) {
    currentMode = mode;

    viewPomodoro.classList.remove("active-view");
    viewTimer.classList.remove("active-view");
    viewStopwatch.classList.remove("active-view");

    pomodoro.pause();
    customTimer.pause();
    stopwatch.pause();

    updatePlayButton(pomoBtns.children[0], false);
    updatePlayButton(timerBtns.children[0], false);
    updatePlayButton(swBtns.children[0], false);

    if (mode === "pomodoro") {
        viewPomodoro.classList.add("active-view");
        displayPomodoro.textContent = pomodoro.formatTime();
    } 
    else if (mode === "timer") {
        viewTimer.classList.add("active-view");

        timerSlider.value = customTimer.totalSeconds / 60;
        timerSliderValue.textContent = customTimer.formatTime();
        displayTimer.textContent = customTimer.formatTime();
    } 
    else {
        viewStopwatch.classList.add("active-view");
        displayStopwatch.textContent = stopwatch.formatTime();
    }
}


// ===========================
// EVENTOS DE TABS
// ===========================
tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        if (index === 0) activateView("pomodoro");
        if (index === 1) activateView("timer");
        if (index === 2) activateView("stopwatch");
    });
});


// ===========================
// BOTONES PLAY / RESET
// ===========================

// Pomodoro
pomoBtns.children[0].addEventListener('click', () => pomodoro.startStop());
pomoBtns.children[1].addEventListener('click', () => pomodoro.reset());

// Timer
timerBtns.children[0].addEventListener('click', () => customTimer.startStop());
timerBtns.children[1].addEventListener('click', () => customTimer.reset());

// Stopwatch
swBtns.children[0].addEventListener('click', () => stopwatch.startStop());
swBtns.children[1].addEventListener('click', () => stopwatch.reset());


// ===========================
// SLIDER DEL TIMER
// ===========================
timerSlider.addEventListener("input", () => {
    const minutes = Number(timerSlider.value);
    customTimer.setDuration(minutes);
    timerSliderValue.textContent = customTimer.formatTime();

    if (currentMode === "timer") {
        displayTimer.textContent = customTimer.formatTime();
    }
});


// ===========================
// INICIAR EN POMODORO
// ===========================
activateView("pomodoro");