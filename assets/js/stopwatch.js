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

        // 🔥 ahora enviamos isRunning = true
        this.updateUI(this.formatTime(), true);

        this.timer = setInterval(() => {
            this.seconds++;
            
            // 🔥 mantener UI actualizada en modo running
            this.updateUI(this.formatTime(), true);
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.timer);

        // 🔥 isRunning = false
        this.updateUI(this.formatTime(), false);
    }

    reset() {
        this.pause();
        this.seconds = 0;

        // 🔥 isRunning = false
        this.updateUI(this.formatTime(), false);
    }

    formatTime() {
        const m = Math.floor(this.seconds / 60).toString().padStart(2, '0');
        const s = (this.seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
}
