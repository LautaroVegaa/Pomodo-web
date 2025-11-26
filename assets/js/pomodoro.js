// Frases opcionales
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
        this.isRunning = false;

        this.phase = "work";      // work, shortBreak, longBreak
        this.cycle = 1;

        this.defaultWork = 25 * 60;
        this.defaultShort = 5 * 60;
        this.defaultLong = 15 * 60;

        this.totalSeconds = this.defaultWork;
    }

    startStop() {
        if (this.isRunning) this.pause();
        else this.start();
    }

    start() {
        this.isRunning = true;

        // 🔥 IMPORTANTE: ahora enviamos isRunning al callback
        this.updateUI(this.formatTime(), true, this.getPhaseLabel());

        this.timer = setInterval(() => {
            if (this.totalSeconds > 0) {
                this.totalSeconds--;
                this.updateUI(this.formatTime(), true, this.getPhaseLabel());
            } else {
                this.completePhase();
            }
        }, 1000);
    }

    pause() {
        this.isRunning = false;

        // 🔥 También informamos que está detenido
        this.updateUI(this.formatTime(), false, this.getPhaseLabel());

        clearInterval(this.timer);
    }

    reset() {
        this.pause();
        this.phase = "work";
        this.cycle = 1;
        this.totalSeconds = this.defaultWork;

        // 🔥 Seguimos informando isRunning = false
        this.updateUI(this.formatTime(), false, this.getPhaseLabel());
    }

    completePhase() {
        this.pause();
        this.nextPhase();
    }

    nextPhase() {
        // ======================
        // CAMBIO AUTOMÁTICO DE FASES
        // ======================
        if (this.phase === "work") {

            // Cada 4 ciclos → descanso largo
            if (this.cycle % 4 === 0) {
                this.phase = "longBreak";
                this.totalSeconds = this.defaultLong;
            } else {
                this.phase = "shortBreak";
                this.totalSeconds = this.defaultShort;
            }

        } else {
            // Volver a trabajo
            this.phase = "work";
            this.totalSeconds = this.defaultWork;
            this.cycle++; // aumenta ciclo solo al volver a enfoque
        }

        // 🔥 Se envía isRunning = false porque inicia detenido
        this.updateUI(this.formatTime(), false, this.getPhaseLabel());
    }

    formatTime() {
        const m = Math.floor(this.totalSeconds / 60).toString().padStart(2, '0');
        const s = (this.totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    getPhaseLabel() {
        if (this.phase === "work") {
            return `Enfoque - Ciclo ${this.cycle}`;
        }
        if (this.phase === "shortBreak") {
            return `Descanso Corto - Ciclo ${this.cycle}`;
        }
        if (this.phase === "longBreak") {
            return `Descanso Largo - Ciclo ${this.cycle}`;
        }
    }

    getPhrase() {
        if (this.phase !== "work") return "";
        return focusPhrases[Math.floor(Math.random() * focusPhrases.length)];
    }
}
