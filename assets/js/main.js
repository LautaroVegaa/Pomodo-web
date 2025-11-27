// ===========================
// IMPORTS
// ===========================
import { PomodoroTimer } from './pomodoro.js';
import { TimerMode } from './timer.js';
import { Stopwatch } from './stopwatch.js';
import { saveSession } from './saveSession.js';
import { supabase } from './supabase.js';


// AUDIO
// ===========================
const alarmAudio = new Audio('assets/sounds/pomodoro_ring.mp3.wav');

// Variable global para la tarea activa
let currentActiveTask = null; 

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
const modalProfile = document.getElementById("modal-profile");
const modalTasks = document.getElementById("modal-tasks");
const modalLogout = document.getElementById("modal-logout-confirm"); // NUEVO

// Menú Dropdown
const dropdown = document.getElementById("user-dropdown");

// Elementos de la Alerta
const alertTitle = document.getElementById("alert-title");
const alertMsg = document.getElementById("alert-message");
const btnAlertOk = document.getElementById("btn-alert-ok");

// Elementos del Perfil
const btnCloseProfile = document.getElementById("close-profile");
const profileNameEl = document.getElementById("profile-name");
const profileEmailEl = document.getElementById("profile-email");
const profileAvatarEl = document.getElementById("profile-avatar-text");

// Elementos Confirmación Logout (NUEVO)
const btnCancelLogout = document.getElementById("btn-cancel-logout");
const btnConfirmLogout = document.getElementById("btn-confirm-logout");

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


// --- 1. Verificar Usuario (Modo Avatar) ---
async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        const fullName = user.user_metadata?.full_name || "U";
        
        // Obtener iniciales
        const names = fullName.split(" ");
        let initials = names[0][0];
        if (names.length > 1) {
            initials += names[names.length - 1][0];
        }
        
        // Aplicar modo Avatar
        btnLoginHeader.textContent = initials.toUpperCase();
        btnLoginHeader.classList.add("avatar-mode");
        btnLoginHeader.title = fullName;

    } else {
        // Modo Invitado
        btnLoginHeader.textContent = "👤 Login";
        btnLoginHeader.classList.remove("avatar-mode");
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
    modalLogin.classList.add("auth-modal-hidden");
    modalRegister.classList.add("auth-modal-hidden");
    modalAlert.classList.add("auth-modal-hidden");
    modalProfile.classList.add("auth-modal-hidden");
    modalTasks.classList.add("auth-modal-hidden");
    modalLogout.classList.add("auth-modal-hidden"); // Cerrar también el de logout
}

// ---------------------------------------------------------
// LÓGICA DEL BOTÓN LOGIN / AVATAR
// ---------------------------------------------------------

btnLoginHeader.addEventListener("click", async (e) => {
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        toggleDropdown();
    } else {
        showLogin();
    }
});

// Lógica del Dropdown
function toggleDropdown() {
    const isHidden = dropdown.classList.contains("dropdown-hidden");
    
    if (isHidden) {
        const rect = btnLoginHeader.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + window.scrollY}px`;
        dropdown.style.left = `${rect.right - 180}px`;
        
        dropdown.classList.remove("dropdown-hidden");
    } else {
        dropdown.classList.add("dropdown-hidden");
    }
}

// Cerrar menú al hacer click fuera
document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== btnLoginHeader) {
        dropdown.classList.add("dropdown-hidden");
    }
});


// ---------------------------------------------------------
// ACCIONES DEL MENÚ DESPLEGABLE
// ---------------------------------------------------------

// 1. Account -> Abre el Modal de Perfil
const menuAccount = document.getElementById("menu-account");
if (menuAccount) {
    menuAccount.addEventListener("click", async () => {
        dropdown.classList.add("dropdown-hidden");
        
        const { data: { user } } = await supabase.auth.getUser();
        if(user) {
            const fullName = user.user_metadata?.full_name || "Usuario";
            profileNameEl.textContent = fullName;
            profileEmailEl.textContent = user.email;
            
            const initials = fullName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
            profileAvatarEl.textContent = initials;
            
            modalProfile.classList.remove("auth-modal-hidden");
        }
    });
}

// 2. Premium
const menuPremium = document.getElementById("menu-premium");
if (menuPremium) {
    menuPremium.addEventListener("click", () => {
        dropdown.classList.add("dropdown-hidden");
        showNotification("¡Pronto disponible la versión Premium!", "👑 Premium");
    });
}

// 3. Logout -> AHORA ABRE EL MODAL DE CONFIRMACIÓN
const menuLogout = document.getElementById("menu-logout");
if (menuLogout) {
    menuLogout.addEventListener("click", () => {
        dropdown.classList.add("dropdown-hidden");
        modalLogout.classList.remove("auth-modal-hidden"); // <--- MUESTRA MODAL
    });
}

// --- Lógica del Modal Logout ---

if (btnCancelLogout) {
    btnCancelLogout.addEventListener("click", () => {
        modalLogout.classList.add("auth-modal-hidden");
    });
}

if (btnConfirmLogout) {
    btnConfirmLogout.addEventListener("click", async () => {
        modalLogout.classList.add("auth-modal-hidden");
        // Ejecutar Logout Real
        await supabase.auth.signOut();
        window.location.reload();
    });
}


// Cerrar Modal Perfil (X)
btnCloseProfile.addEventListener("click", () => {
    modalProfile.classList.add("auth-modal-hidden");
});

// Toggles Login/Registro
linkToRegister.addEventListener("click", showRegister);
linkToLogin.addEventListener("click", showLogin);

// Backdrops
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
//          SISTEMA DE TAREAS
// ==========================================
const btnTasks = document.getElementById("btn-tasks");
const closeTasks = document.getElementById("close-tasks");
const formAddTask = document.getElementById("form-add-task");
const inputTask = document.getElementById("input-task");
const tasksList = document.getElementById("tasks-list");

let tasks = JSON.parse(localStorage.getItem('pomodo_tasks')) || [];

function saveTasks() {
    localStorage.setItem('pomodo_tasks', JSON.stringify(tasks));
}

btnTasks.addEventListener("click", () => {
    renderTasks();
    modalTasks.classList.remove("auth-modal-hidden");
    inputTask.focus();
});

closeTasks.addEventListener("click", () => {
    modalTasks.classList.add("auth-modal-hidden");
});

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
    saveTasks();
    inputTask.value = "";
    renderTasks();
});

function renderTasks() {
    tasksList.innerHTML = "";

    if (tasks.length === 0) {
        tasksList.innerHTML = '<div class="empty-state">No hay tareas pendientes</div>';
        return;
    }

    tasks.forEach(task => {
        const item = document.createElement("div");
        const isActive = currentActiveTask && currentActiveTask.id === task.id;
        item.className = `task-item ${task.completed ? "completed" : ""} ${isActive ? "active-border" : ""}`;

        item.innerHTML = `
            <div class="task-left">
                <div class="task-check ${task.completed ? "checked" : ""}" onclick="toggleTask(${task.id})">
                    ${task.completed ? "✓" : ""}
                </div>
                <span class="task-text">${task.text}</span>
            </div>
            
            <div class="task-actions">
                <button class="btn-play-task" onclick="activateTask(${task.id})" title="Trabajar en esta tarea">
                    ▶
                </button>
                <button class="btn-delete-task" onclick="deleteTask(${task.id})">🗑</button>
            </div>
        `;
        
        tasksList.appendChild(item);
    });
}

window.toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
};

window.deleteTask = (id) => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
};

window.activateTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        currentActiveTask = task;
        const pill = viewPomodoro.querySelector(".pill");
        const currentPhaseLabel = pomodoro.getPhaseLabel(); 
        pill.textContent = `${currentPhaseLabel} • ${task.text}`;
        modalTasks.classList.add("auth-modal-hidden");
        renderTasks();
    }
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
        if (currentActiveTask) {
             pill.textContent = `${phaseLabel} • ${currentActiveTask.text}`;
        } else {
            pill.textContent = phaseLabel;
        }

        updatePlayButton(pomoBtns.children[0], isRunning);

        if (finishedPhase) {
            const soundEnabled = localStorage.getItem('pref_sound') !== 'false';
            if (soundEnabled) {
                alarmAudio.currentTime = 0; 
                alarmAudio.play().catch(e => console.error("Error reproduciendo audio:", e));
            }
            const notifEnabled = localStorage.getItem('pref_notifications') !== 'false';
            if (notifEnabled) {
                if (Notification.permission === "granted") {
                    new Notification("Pomodō", { body: `¡${phaseLabel} completado!` });
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            new Notification("Pomodō", { body: "¡Tiempo completado!" });
                        }
                    });
                }
            }
        }
    },

    (minutesStudied) => {
        if (!minutesStudied || minutesStudied <= 0) return;
        saveSession({
            duration: minutesStudied,
            type: "focus",
            taskId: currentActiveTask ? currentActiveTask.id : null,
            taskName: currentActiveTask ? currentActiveTask.text : null
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

pomoBtns.children[0].addEventListener('click', () => pomodoro.startStop());
pomoBtns.children[1].addEventListener('click', () => pomodoro.reset());

timerBtns.children[0].addEventListener('click', () => customTimer.startStop());
timerBtns.children[1].addEventListener('click', () => customTimer.reset());

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