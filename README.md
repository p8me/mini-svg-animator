# Mini SVG Animator

[<h3>Click here to see the demo</h3> <img src="svg/snail-normal.opt.svg">](https://p8me.github.io/mini-svg-animator)

A simple SVG animator using [animejs](https://animejs.com/) with the following features:

## Smooth interruptions

Slowly decelerates an ongoing animation (if any) before starting a new animation. This is useful when there are multiple animations (on the same objects) that can be triggered on events.

1. Instantiate a `SmoothAnime` object

```js
smoothAnime = new SmoothAnime();
```

2. Start an animation

```js
smoothAnime.anime([{
    targets: ...
    ... /*animejs options*/
}])
```

3. Start another animation. If a previous animation through the same `smoothAnime` is running it will decelerate to stop and then the new animation will start.

```js
smoothAnime.anime([{
    targets: ...
    ... /*animejs new options*/
}])
```

### Constructor Input Arguments

```js
SmoothAnime(durationTimesDeceleration,
        goNextOnProgress, consLog)
```

1. `durationTimesDeceleration` (default: `100`):
   The deceleration ratio.

    To create proportional deceleration relative to duration, the longer the duration the smaller the deceleration will be:

    `duration * deceleration = durationTimesDeceleration`

2. `goNextOnProgress` (default: `10`): the animation progress threshold at which the deceleration will stop.

    There are two conditions at which deceleration will be ended:

    1. When the animation speed reaches 0.

    2. When the animation progress is less than `goNextOnProgress` or greater than `100 - goNextOnProgress`.

3. `consLog`: debug output. Example:
    ```js
    consLog = (str) => console.log(str);
    ```

### anime Input Arguments
```js
smoothAnime.anime(anims)
```
* `anims`: an array of animjs animations. Example:
```js
smoothAnime.anime([{
    targets: ...
    ... /*animejs options*/
}, {
    targets: ...
    ... /*animejs options*/
}])
```

## Match SVG Objects

TODO

## Dependencies

-   [scour](https://github.com/scour-project/scour) for optimizing svgs

## Usage

## TODO

[pure SVG animation](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/keySplines)
