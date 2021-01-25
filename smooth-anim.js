class SmoothAnime {
    constructor(durationTimesDeceleration = 100, /* duration * deceleration  = durationTimesDeceleration | see the readme for more details */
        goNextOnProgress = 10, consLog = () => { }) {

        this.durationTimesDeceleration = durationTimesDeceleration;
        this.goNextOnProgress = goNextOnProgress;
        this.timeManager = new TimeManager();
        this.queueIsFull = false; // or slowDownInProgress
        this.animes = [];
        this.queuedAnim = () => { };
        this.deceleration = 0.02;

        let start = Date.now()
        this.consLog = (msg) => consLog(Date.now() - start + ": " + msg);
    }

    morph(anims) {
        let anim = () => {
            this.timeManager.reset();
            this.consLog("running anim");
            for (let i = 0; i < anims.length; i++) {
                try { // FIXME
                    this.animes[i] = anime(anims[i]);
                } catch { }
            }
            this.queueIsFull = false;
        }
        if (!this.animes.length || this.animes[0].progress == 100) { anim(); return; }
        if (this.queueIsFull) {
            this.queuedAnim = anim;
            this.consLog("replace queue with new anim");
        } else {
            this.consLog("queue anim and start slowdown");
            this.queuedAnim = anim;
            this.deceleration = this.durationTimesDeceleration / this.animes[0].duration;
            requestAnimationFrame(this.loop.bind(this));
            this.queueIsFull = true;
        }
    }

    loop(t) {
        // this.consLog(this.timeManager.speed);
        this.timeManager.decelerate(this.deceleration);
        var slowedTime = this.timeManager.update(t);
        this.animes.forEach(an => an.tick(slowedTime));
        if (50 - Math.abs(this.animes[0].progress - 50) > this.goNextOnProgress && this.timeManager.speed > 0)
            requestAnimationFrame(this.loop.bind(this));
        else {
            this.consLog("slowDown finished");
            this.animes.forEach(an => an.pause());
            this.queuedAnim();
        }
    }
}

class TimeManager {
    constructor() {
        this.reset();
    }
    reset() {
        this.t = -1;
        this.lastTime = -1;
        this.speed = 1;
    }
    decelerate(a) {
        this.speed -= a;
        if (this.speed < 0) this.speed = 0;
    }
    update(t) {
        if (this.t === -1) this.t = t;
        else this.t += (t - this.lastTime) * this.speed;
        this.lastTime = t;
        return this.t
    }
}