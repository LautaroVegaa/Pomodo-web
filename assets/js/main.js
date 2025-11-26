// ===========================
// IMPORTS
// ===========================
import { PomodoroTimer } from './pomodoro.js';
import { TimerMode } from './timer.js';
import { Stopwatch } from './stopwatch.js';
import { saveSession } from './saveSession.js';


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
const tabPomodoro = tabs[0];
const tabTimer = tabs[1];
const tabStopwatch = tabs[2];

// Vistas
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

qsFocusBox.addEventListener("click", () => {
    qsMode = "focus";
    qsModalTitle.textContent = "Focus Time";
    qsModalSlider.max = 60;
    qsModalSlider.value = pomodoro.defaultWork / 60;
    qsModalValue.textContent = `${qsModalSlider.value} min`;

    qsModal.classList.remove("qs-modal-hidden");
});

qsBreakBox.addEventListener("click", () => {
    qsMode = "break";
    qsModalTitle.textContent = "Short Break";
    qsModalSlider.max = 30;
    qsModalSlider.value = pomodoro.defaultShort / 60;
    qsModalValue.textContent = `${qsModalSlider.value} min`;

    qsModal.classList.remove("qs-modal-hidden");
});

qsModalSlider.addEventListener("input", () => {
    qsModalValue.textContent = `${qsModalSlider.value} min`;
});

qsModalSave.addEventListener("click", () => {
    const minutes = Number(qsModalSlider.value);

    if (qsMode === "focus") {
        pomodoro.defaultWork = minutes * 60;
        pomodoro.totalSeconds = pomodoro.defaultWork;
        qsFocusBox.querySelector(".qs-number").textContent = minutes;

        if (currentMode === "pomodoro") {
            displayPomodoro.textContent = pomodoro.formatTime();
        }
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

        updatePlayButton(pomoPlayBtn, isRunning);
        // finishedPhase lo podríamos usar más adelante si querés animaciones, etc.
    },

    // 🔥 Callback para guardar minutos reales de ENFOQUE
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

    updatePlayButton(timerPlayBtn, isRunning);

    // 💾 Guardar solo cuando Timer avisa que se completó
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

    updatePlayButton(swPlayBtn, isRunning);

    // 💾 Guardar al pausar, si hay minutos suficientes
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

    updatePlayButton(pomoPlayBtn, false);
    updatePlayButton(timerPlayBtn, false);
    updatePlayButton(swPlayBtn, false);

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
const pomoPlayBtn = pomoBtns.children[0];
const pomoResetBtn = pomoBtns.children[1];
pomoPlayBtn.addEventListener('click', () => pomodoro.startStop());
pomoResetBtn.addEventListener('click', () => pomodoro.reset());

// Timer
const timerPlayBtn = timerBtns.children[0];
const timerResetBtn = timerBtns.children[1];
timerPlayBtn.addEventListener('click', () => customTimer.startStop());
timerResetBtn.addEventListener('click', () => customTimer.reset());

// Stopwatch
const swPlayBtn = swBtns.children[0];
const swResetBtn = swBtns.children[1];
swPlayBtn.addEventListener('click', () => stopwatch.startStop());
swResetBtn.addEventListener('click', () => stopwatch.reset());


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
