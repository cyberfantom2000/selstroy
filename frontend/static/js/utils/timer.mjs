
export class Timer {
    constructor(delay, singleshot = false) {
        this.delay = delay;
        this.singleshot = singleshot;
        this.timer_id = null;
    }

    start(callback) {
        if (this.is_running())
            throw new Error('Timer already running');

        this.timer_id = setInterval(() => {
            if (this.singleshot)
                this.stop();

            callback();            
        }, this.delay);
    }

    stop() {
        if (this.is_running()) {
            clearInterval(this.timer_id);
            this.timer_id = null;
        }
    }

    is_running() {
        return this.timer_id !== null;
    }
}