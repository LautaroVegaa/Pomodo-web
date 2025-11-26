export class TimerMode {
    constructor(uiCallback) {
        this.updateUI = uiCallback;

        this.interval = null;
        this.totalSeconds = 60 * 25;  // default 25 min
        this.isRunning = false;
    }

    setDuration(minutes) {
        this.pause();
        this.totalSeconds = minutes * 60;

        // enviar completed = null
        this.updateUI(this.formatTime(), false, null);
    }

    startStop() {
        if (this.isRunning) this.pause();
        else this.start();
    }

    start() {
        if (this.totalSeconds <= 0) return;

        this.isRunning = true;

        // running + completed = null
        this.updateUI(this.formatTime(), true, null);

        this.interval = setInterval(() => {
            if (this.totalSeconds > 0) {
                this.totalSeconds--;

                // mantener UI en "running"
                this.updateUI(this.formatTime(), true, null);

            } else {
                this.complete();
            }
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);

        // pausa normal → completed = null
        this.updateUI(this.formatTime(), false, null);
    }

    reset() {
        this.pause();
        this.totalSeconds = 25 * 60;

        this.updateUI(this.formatTime(), false, null);
    }

    complete() {
        this.pause();

        // completed = true → main.js guarda sesión
        this.updateUI(this.formatTime(), false, true);
    }

    formatTime() {
        const m = Math.floor(this.totalSeconds / 60).toString().padStart(2, '0');
        const s = (this.totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // minutos totales usados para estadísticas
    get totalMinutes() {
        return Math.floor((25 * 60 - this.totalSeconds) / 60);
    }
}
