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
        
        // 🔥 enviar isRunning = false
        this.updateUI(this.formatTime(), false);
    }

    startStop() {
        if (this.isRunning) this.pause();
        else this.start();
    }

    start() {
        if (this.totalSeconds <= 0) return;

        this.isRunning = true;

        // 🔥 ahora enviamos isRunning = true
        this.updateUI(this.formatTime(), true);

        this.interval = setInterval(() => {
            if (this.totalSeconds > 0) {
                this.totalSeconds--;
                
                // 🔥 mantener UI en modo "running"
                this.updateUI(this.formatTime(), true);

            } else {
                this.complete();
            }
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);

        // 🔥 enviar isRunning = false
        this.updateUI(this.formatTime(), false);
    }

    reset() {
        this.pause();
        this.totalSeconds = 25 * 60;

        // 🔥 enviar isRunning = false
        this.updateUI(this.formatTime(), false);
    }

    complete() {
        this.pause();
        alert("¡Tiempo finalizado!");
    }

    formatTime() {
        const m = Math.floor(this.totalSeconds / 60).toString().padStart(2, '0');
        const s = (this.totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
}
