export class Stopwatch {
    constructor(uiCallback) {
        this.updateUI = uiCallback;

        this.timer = null;
        this.seconds = 0;
        this.isRunning = false;
    }

    startStop() {
        if (this.isRunning) this.pause();
        else this.start();
    }

    start() {
        this.isRunning = true;

        // completedMinutes = null
        this.updateUI(this.formatTime(), true, null);

        this.timer = setInterval(() => {
            this.seconds++;
            this.updateUI(this.formatTime(), true, null);
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.timer);

        const minutes = Math.floor(this.seconds / 60);

        // completedMinutes = minutos acumulados
        this.updateUI(this.formatTime(), false, minutes);
    }

    reset() {
        this.pause();
        this.seconds = 0;

        this.updateUI(this.formatTime(), false, null);
    }

    formatTime() {
        const m = Math.floor(this.seconds / 60).toString().padStart(2, '0');
        const s = (this.seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
}
