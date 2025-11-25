import { PomodoroTimer } from './pomodoro.js';
import { Stopwatch } from './stopwatch.js';

// --- ELEMENTOS DOM ---
const viewPomo = document.getElementById('view-pomodoro');
const viewTimer = document.getElementById('view-timer');
const viewSw = document.getElementById('view-stopwatch');
const statsSection = document.getElementById('stats-section');

// Botones de Modo
const modeBtns = document.querySelectorAll('.mode-btn');

// --- INSTANCIAS ---

// 1. Pomodoro Logic
const pomoDisplay = document.getElementById('pomo-time');
const pomoBtn = document.getElementById('pomo-main-btn');
const pomoLabel = document.getElementById('pomo-phase-label');
const pomoPhrase = document.getElementById('pomo-phrase');

const pomodoro = new PomodoroTimer((time, isRunning, label, phrase) => {
    pomoDisplay.textContent = time;
    pomoBtn.textContent = isRunning ? "PAUSAR" : "INICIAR";
    pomoBtn.style.backgroundColor = isRunning ? "#EF4444" : "#3B82F6"; // Rojo al pausar
    pomoBtn.style.boxShadow = isRunning ? "0 6px 0 #B91C1C" : "0 6px 0 rgb(29, 78, 216)";
    
    if (label) pomoLabel.textContent = label;
    if (phrase) pomoPhrase.textContent = `"${phrase}"`;
    document.title = `${time} - Pomodō`;
});

document.getElementById('pomo-main-btn').addEventListener('click', () => pomodoro.startStop());
document.getElementById('pomo-skip-btn').addEventListener('click', () => pomodoro.skip());

// 2. Stopwatch Logic
const swDisplay = document.getElementById('stopwatch-time');
const swBtn = document.getElementById('sw-main-btn');

const stopwatch = new Stopwatch((time, isRunning) => {
    swDisplay.textContent = time;
    swBtn.textContent = isRunning ? "DETENER" : "INICIAR";
});

document.getElementById('sw-main-btn').addEventListener('click', () => stopwatch.startStop());
document.getElementById('sw-reset-btn').addEventListener('click', () => stopwatch.reset());

// 3. Navigation Logic
modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Switch Tabs visual
        modeBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Hide all views
        viewPomo.classList.remove('active-view');
        viewTimer.classList.remove('active-view');
        viewSw.classList.remove('active-view');

        // Show selected
        const mode = e.target.dataset.mode;
        if (mode === 'pomodoro') viewPomo.classList.add('active-view');
        if (mode === 'timer') viewTimer.classList.add('active-view');
        if (mode === 'stopwatch') viewSw.classList.add('active-view');
    });
});

// Toggle Stats
document.getElementById('btn-stats').addEventListener('click', () => {
    if (statsSection.style.display === 'block') {
        statsSection.style.display = 'none';
    } else {
        statsSection.style.display = 'block';
        // Aquí podrías llamar a getStats() y actualizar el DOM
    }
});

// Timer Slider Logic (Demo simple)
const slider = document.getElementById('timer-slider');
const sliderVal = document.getElementById('slider-val');
const timerDisplay = document.getElementById('timer-time');
slider.addEventListener('input', (e) => {
    sliderVal.textContent = e.target.value;
    timerDisplay.textContent = `${e.target.value.padStart(2,'0')}:00`;
});