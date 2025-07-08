function inView (
    targets         = [],
    threshold       = { lat: 0, long: 0 },
    callback        = () => { },
    throttleTimeout = 1000
) {
    if (targets.length <= 0) return;
    let previousScrollY = window.scrollY;
    let previousScrollX = window.scrollX;

    let eventHandler = (event) => {
        let entries = [];
        let viewBox = {
            x      : window.scrollX,
            y      : window.scrollY,
            width  : window.innerWidth,
            height : window.innerHeight
        };

        let verticalVelocity    = (viewBox.y - previousScrollY);
        let verticalDirection   = verticalVelocity ? (verticalVelocity) / Math.abs(verticalVelocity) : 0;
        previousScrollY         = viewBox.y;

        let horizontalVelocity  = (viewBox.y - previousScrollX);
        let horizontalDirection = horizontalVelocity ? (horizontalVelocity) / Math.abs(horizontalVelocity) : 0;
        previousScrollX         = viewBox.x;

        for (let i = 0; i < targets.length; i++) {
            let target     = targets[i];
            let targetRect = target.getBoundingClientRect();
            let targetBox  = {
                x      : targetRect.x + viewBox.x,
                y      : targetRect.y + viewBox.y,
                width  : targetRect.width,
                height : targetRect.height
            }

            let isHorizontallyIntersecting = (targetBox.x >= viewBox.x && targetBox.x <= viewBox.x + viewBox.width) ||
                (targetBox.x + targetBox.width <= viewBox.x + viewBox.width && targetBox.x + targetBox.width >= viewBox.x);

            let isVerticallyIntersecting = (targetBox.y >= viewBox.y && targetBox.y <= viewBox.y + viewBox.height) ||
                (targetBox.y + targetBox.height <= viewBox.y + viewBox.height && targetBox.y + targetBox.height >= viewBox.y);

            if (isVerticallyIntersecting || isHorizontallyIntersecting) {
                let visibleHeight = Math.min(viewBox.y + viewBox.height, targetBox.y + targetBox.height) - Math.max(viewBox.y, targetBox.y);
                let visibleWidth = Math.min(viewBox.x + viewBox.width, targetBox.x + targetBox.width) - Math.max(viewBox.x, targetBox.x);
                visibleHeight = Math.max(0, visibleHeight);
                visibleWidth = Math.max(0, visibleWidth);
                let currentVerticalThreshold = visibleHeight / targetBox.height;
                let currentHorizontalThreshold = visibleWidth / targetBox.width;

                entries.push({
                    target: target,
                    viewBox: viewBox,
                    targetBox: targetBox,
                    isVerticallyIntersecting: isVerticallyIntersecting && currentVerticalThreshold >= threshold.long,
                    isHorizontallyIntersecting: isHorizontallyIntersecting && currentHorizontalThreshold >= threshold.lat,
                    verticalDirection: verticalDirection,
                    horizontalDirection: horizontalDirection,
                    visibleHeight: visibleHeight,
                    visibleWidth: visibleWidth
                });
            }
        }

        callback(entries);
    }

    if (throttle) window.addEventListener('scroll', throttle(eventHandler, throttleTimeout));
    window.addEventListener('scroll', eventHandler);
}