import { saveSession } from './supabase.js';

// Frases extraídas de tu código Flutter
const focusPhrases = [
    "El foco es un músculo: si no lo usás, se atrofia.",
    "La dopamina fácil secuestra tu curiosidad natural.",
    "Tu atención no se perdió, se entrenó para cambiar.",
    "La calma activa tu corteza prefrontal."
];

export class PomodoroTimer {
    constructor(uiCallback) {
        this.updateUI = uiCallback;
        this.timer = null;
        this.minutes = 25;
        this.seconds = 0;
        this.isRunning = false;
        this.phase = 'work'; // work, shortBreak, longBreak
        this.cycle = 1;
        this.totalSeconds = 25 * 60;
    }

    startStop() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        this.isRunning = true;
        this.updateUI(this.formatTime(), this.isRunning, this.getPhaseLabel(), this.getPhrase());
        
        this.timer = setInterval(() => {
            if (this.totalSeconds > 0) {
                this.totalSeconds--;
                this.updateUI(this.formatTime(), this.isRunning);
            } else {
                this.completePhase();
            }
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.timer);
        this.updateUI(this.formatTime(), this.isRunning);
    }

    completePhase() {
        this.pause();
        // Guardar sesión si es trabajo
        if (this.phase === 'work') {
            saveSession(25, 'work'); // Asumiendo duración fija por ahora
        }
        this.nextPhase();
        // Autostart logic could go here
    }

    nextPhase() {
        if (this.phase === 'work') {
            if (this.cycle % 4 === 0) {
                this.phase = 'longBreak';
                this.totalSeconds = 15 * 60;
            } else {
                this.phase = 'shortBreak';
                this.totalSeconds = 5 * 60;
            }
        } else {
            this.phase = 'work';
            this.totalSeconds = 25 * 60;
            this.cycle++;
        }
        this.updateUI(this.formatTime(), false, this.getPhaseLabel(), this.getPhrase());
    }

    skip() {
        this.pause();
        this.nextPhase();
    }

    formatTime() {
        const m = Math.floor(this.totalSeconds / 60).toString().padStart(2, '0');
        const s = (this.totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    getPhaseLabel() {
        if (this.phase === 'work') return `Enfoque • Ciclo ${this.cycle}`;
        if (this.phase === 'shortBreak') return "Descanso Corto";
        return "Descanso Largo";
    }

    getPhrase() {
        return focusPhrases[Math.floor(Math.random() * focusPhrases.length)];
    }
}