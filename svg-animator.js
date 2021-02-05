class SvgAnimator {
    constructor(container, stateNames, svgFileNames, animatedIds, /* svg ids to be animated | see the readme for more details */
        easing = 'easeInOutQuad', onSvgLoad = () => { }) {

        this.stateNames = stateNames;
        this.animatedIds = animatedIds;
        this.numAnimatedIds = animatedIds.length;
        this.easing = easing;

        this.svgs = []
        for (let i = 0; i < stateNames.length; i++) this.svgs.push([]);

        let svgLoadPromises = [];
        for (let stateIdx = 0; stateIdx < stateNames.length; stateIdx++)
            svgLoadPromises.push(loadSvg(svgFileNames[stateIdx]));

        this.svgDocs = [];
        Promise.allSettled(svgLoadPromises).then(svgs => svgs.forEach((svgRes, stateIdx) => {
            let svg = svgRes.value;
            this.svgDocs.push(svg);
            if (stateIdx == 0) { // set the default
                let group = svg.children[0];
                group.removeAttribute("stroke");
                container.innerHTML = group.innerHTML;
                onSvgLoad();
            }

            for (let eIdx = 0; eIdx < this.numAnimatedIds; eIdx++) {
                let e = svg.getElementById(this.animatedIds[eIdx]);
                let getAnim = () => { };
                let type = e.localName;
                let target = document.getElementById(this.animatedIds[eIdx]);
                if (type === 'path') {
                    getAnim = dur => {
                        return {
                            targets: target,
                            d: { value: e.getAttribute("d") },
                            duration: dur,
                            easing: this.easing
                        }
                    }
                }
                else if (type === 'svg' || type === 'g') { // svg buggy on phone
                    getAnim = dur => {
                        return {
                            targets: target,
                            transform: e.getAttribute("transform"), // x:, y: buggy on phone
                            duration: dur,
                            easing: this.easing
                        }
                    }
                }
                else if (type === 'circle' || type === 'ellipse') {
                    getAnim = dur => {
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
        }));
    }


    anims(stateName, duration) {
        let stateIdx = this.stateNames.indexOf(stateName);
        let anims = [];
        for (let eIdx = 0; eIdx < this.numAnimatedIds; eIdx++)
            anims.push(this.svgs[stateIdx][eIdx].anim(duration));
        return anims;
    }
}

const loadSvg = async file => {
    const response = await fetch(file);
    var svgStr = await response.text();
    var parser = new DOMParser();
    return parser.parseFromString(svgStr, "image/svg+xml")
}