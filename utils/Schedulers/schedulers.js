function throttle(
    callback = (...args) => { },
    duration = 1000) {

    let then = -1,
        animationId = null;

    function tick(...args) {
        const NOW = Date.now();
        const ELAPSED = NOW - then;
        if (ELAPSED >= duration) {
            callback(...args); then = -1;
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        else {
            animationId = requestAnimationFrame(() => {
                tick(...args);
            });
        }
    }

    return function (...args) {
        if (then === -1) {
            then = Date.now();
            animationId = requestAnimationFrame(() => {
                tick(...args);
            });
        }
    }
}

function debounce(callback = (...args) => { }, duration = 1000) {
    if (duration > 1000 / 24) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                callback(...args);
            }, duration);
        };
    }

    let then = 0;
    let animationId = null;

    function tick(...args) {
        const NOW = Date.now();
        const ELAPSED = NOW - then;

        if (ELAPSED >= duration) {
            callback(...args);
            then = NOW;
        }
        requestAnimationFrame(() => {
            tick(...args);
        });
    }

    return function () {
        if (!animationId) {
            then = Date.now();
            requestAnimationFrame(() => {
                tick(...args);
            });
        } else {
            then = Date.now();
        }
    }
}

function limiter(callback = (...args) => { }, count = 1) {
    let counter = 0;
    return function (...args) {
        if(counter < count) {
            callback(...args);
            counter++;
        }
    }
}
