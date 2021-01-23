
const loadSvg = async file => {
    const response = await fetch(file);
    var svgStr = await response.text();
    var parser = new DOMParser();
    return {
        str: svgStr,
        doc: parser.parseFromString(svgStr, "image/svg+xml")
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

class MorphSvg {
    constructor(container, stateNames, svgFileNames, animatedIds, /* svg ids to be animated | see the readme for more details */
        easing = 'easeInOutQuad') {

        this.stateNames = stateNames;
        this.animatedIds = animatedIds;
        this.numAnimatedIds = animatedIds.length;
        this.easing = easing;

        this.svgs = []
        for (let i = 0; i < stateNames.length; i++) this.svgs.push([]);

        // this.svgDocs = []; // for debug only
        for (let stateIdx = 0; stateIdx < stateNames.length; stateIdx++) {
            loadSvg(svgFileNames[stateIdx]).then(svg => {
                // this.svgDocs.push(svg.doc);
                if (stateIdx == 0) { // set the default
                    let group = svg.doc.children[0].children[0];
                    group.removeAttribute("stroke");
                    container.innerHTML = group.innerHTML;
                }

                for (let eIdx = 0; eIdx < this.numAnimatedIds; eIdx++) {
                    let e = svg.doc.getElementById(this.animatedIds[eIdx]);
                    let getAnim = () => { };
                    let type = e.localName;
                    let target = document.getElementById(this.animatedIds[eIdx]);
                    if (type === 'path') {
                        getAnim = (dur) => {
                            return {
                                targets: target,
                                d: { value: e.getAttribute("d") },
                                duration: dur,
                                easing: this.easing
                            }
                        }
                    }
                    else if (type === 'svg' || type === 'g') { // svg buggy on phone
                        getAnim = (dur) => {
                            return {
                                targets: target,
                                transform: e.getAttribute("transform"), // x:, y: buggy on phone
                                duration: dur,
                                easing: this.easing
                            }
                        }
                    }
                    else if (type === 'circle' || type === 'ellipse') {
                        getAnim = (dur) => {
                            return {
                                targets: target,
                                cx: { value: e.getAttribute("cx") },
                                cy: { value: e.getAttribute("cy") },
                                duration: dur,
                                easing: this.easing
                            }
                        }
                    }
                    this.svgs[stateIdx].push({ e: e, anim: getAnim });
                }
            });
        }
    }

    anims(stateName, duration) {
        let stateIdx = this.stateNames.indexOf(stateName);
        let anims = [];
        for (let eIdx = 0; eIdx < this.numAnimatedIds; eIdx++)
            anims.push(this.svgs[stateIdx][eIdx].anim(duration));
        return anims;
    }
}
