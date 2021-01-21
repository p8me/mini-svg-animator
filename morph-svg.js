
const loadSvg = async file => {
    const response = await fetch(file);
    var svgStr = await response.text();
    var parser = new DOMParser();
    return {
        str: svgStr,
        doc: parser.parseFromString(svgStr, "image/svg+xml")
    }
}

class MorphSvg {
    constructor(container, stateNames, svgFileNames, animatedIds, /* svg ids to be animated | see readme for more details */
        easing = 'easeInOutQuad', durationOverDecelerationRatio = 100, /* duration / durationOverDecelerationRatio = deceleration | see readme for more details */
        goNextOnProgress = 10) {

        this.stateNames = stateNames;
        this.animatedIds = animatedIds;
        this.numAnimatedIds = animatedIds.length;
        this.easing = easing;
        this.durationOverDecelerationRatio = durationOverDecelerationRatio;
        this.goNextOnProgress = goNextOnProgress;

        this.svgs = []
        for (let i = 0; i < stateNames.length; i++) this.svgs.push([]);
        
        this.svgDocs = [];
        for (let stateIdx = 0; stateIdx < stateNames.length; stateIdx++) {
            loadSvg(svgFileNames[stateIdx]).then(svg => {
                this.svgDocs.push(svg.doc);
                if (stateIdx == 0) { // set the defaul
                    // remove first and last line containing svg tags
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
                                // targets: this.actualSvgElements[eIdx],
                                targets: target,
                                d: { value: e.getAttribute("d") },
                                duration: dur,
                                easing: this.easing
                            }
                        }
                    }
                    else if (type === 'svg') {
                        getAnim = (dur) => {
                            return {
                                targets: target,
                                x: { value: e.getAttribute("x") },
                                y: { value: e.getAttribute("y") },
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

    morph(stateName,
        duration,
        deceleration // deceleration of previous animation (if still ongoing)
    ) {
        let stateIdx = this.stateNames.indexOf(stateName);
        for (let eIdx = 0; eIdx < this.numAnimatedIds; eIdx++) {
            anime(this.svgs[stateIdx][eIdx].anim(duration));
        }

    }

}

states = ["normal", "happy", "scared", "upset"];
stateToSvg = (state) => "svg/snail-" + state + ".opt.svg";
svgFiles = []
for (s of states) svgFiles.push(stateToSvg(s));

svgElements = ["shell", "foot", "ltent", "leye", "rtent", "reye"];
// svgElements = ["shell", "foot", "ltent", "rtent"];

morphSnail = new MorphSvg(document.getElementById('snail'), states, svgFiles, svgElements);

$(document).ready(function () {
    $(".happy").hover(
        function () {
            $("#snail").addClass("happy-snail");
            morphSnail.morph("happy", 1200);
        },
        function () {
            $("#snail").removeClass("happy-snail");
            morphSnail.morph("normal", 3000);
        });
});

var snail = document.getElementById("snail");

snail.onmouseover = function () {
    morphSnail.morph("scared", 1000);
}
snail.onmouseout = function () {
    morphSnail.morph("normal", 3000);
}
