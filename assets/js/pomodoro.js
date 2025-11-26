// Frases opcionales
const focusPhrases = [
    "El foco es un músculo: si no lo usás, se atrofia.",
    "La dopamina fácil secuestra tu curiosidad natural.",
    "Tu atención no se perdió, se entrenó para cambiar.",
    "La calma activa tu corteza prefrontal."
];

export class PomodoroTimer {
    constructor(uiCallback, onWorkCompleteCallback = null) {
        this.updateUI = uiCallback;

        // 🔥 Nuevo: callback externo para guardar estadísticas
        this.onWorkComplete = onWorkCompleteCallback;

        this.timer = null;
        this.isRunning = false;

        this.phase = "work"; // work, shortBreak, longBreak
        this.cycle = 1;

        this.defaultWork = 25 * 60;
        this.defaultShort = 5 * 60;
        this.defaultLong = 15 * 60;

        this.totalSeconds = this.defaultWork;

        // 🔥 Nuevo: registrar tiempo REAL de enfoque
        this.focusSecondsAccumulated = 0;
    }

    startStop() {
        if (this.isRunning) this.pause();
        else this.start();
    }

    start() {
        this.isRunning = true;

        this.updateUI(this.formatTime(), true, this.getPhaseLabel(), null);

        this.timer = setInterval(() => {
            if (this.totalSeconds > 0) {

                this.totalSeconds--;

                // 🔥 Registrar tiempo real SOLO si es enfoque
                if (this.phase === "work") {
                    this.focusSecondsAccumulated++;
                }

                this.updateUI(this.formatTime(), true, this.getPhaseLabel(), null);

            } else {
                this.completePhase();
            }
        }, 1000);
    }

    pause() {
        this.isRunning = false;

        this.updateUI(this.formatTime(), false, this.getPhaseLabel(), null);

        clearInterval(this.timer);
    }

    reset() {
        this.pause();

        this.phase = "work";
        this.cycle = 1;
        this.totalSeconds = this.defaultWork;

        // 🔥 Reiniciar acumulador de enfoque
        this.focusSecondsAccumulated = 0;

        this.updateUI(this.formatTime(), false, this.getPhaseLabel(), null);
    }

    completePhase() {
        const finishedPhase = this.phase;

        this.pause();

        // 🔥 Guardar SOLO si terminó una sesión de enfoque real
        if (finishedPhase === "work" && this.focusSecondsAccumulated > 0) {

            const minutesStudied = Math.floor(this.focusSecondsAccumulated / 60);

            if (minutesStudied > 0 && this.onWorkComplete) {
                this.onWorkComplete(minutesStudied);
            }
        }

        this.updateUI(this.formatTime(), false, this.getPhaseLabel(), finishedPhase);

        // 🔥 Reiniciar acumulador antes del próximo ciclo
        this.focusSecondsAccumulated = 0;

        this.nextPhase();
    }

    nextPhase() {
        if (this.phase === "work") {

            if (this.cycle % 4 === 0) {
                this.phase = "longBreak";
                this.totalSeconds = this.defaultLong;
            } else {
                this.phase = "shortBreak";
                this.totalSeconds = this.defaultShort;
            }

        } else {
            this.phase = "work";
            this.totalSeconds = this.defaultWork;
            this.cycle++;
        }

        this.updateUI(this.formatTime(), false, this.getPhaseLabel(), null);
    }

    formatTime() {
        const m = Math.floor(this.totalSeconds / 60).toString().padStart(2, "0");
        const s = (this.totalSeconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    getPhaseLabel() {
        if (this.phase === "work") return `Enfoque - Ciclo ${this.cycle}`;
        if (this.phase === "shortBreak") return `Descanso Corto - Ciclo ${this.cycle}`;
        if (this.phase === "longBreak") return `Descanso Largo - Ciclo ${this.cycle}`;
    }

    getPhrase() {
        if (this.phase !== "work") return "";
        return focusPhrases[Math.floor(Math.random() * focusPhrases.length)];
    }
}
