class Simulacrum {
    constructor(root = null) {
        if(!(element instanceof HTMLElement)) throw Error("Invalid input: must be a valid HTML element!");

        this.root = root;

        this.canvas  = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");

        this.boxShadowRegex = /(?:[^,(]|\([^)]*\))+?(?=,|$)/g;
        this.shadowRegex    = /(rgba?\([^)]+\)|#[0-9a-fA-F]+|\w+)\s+(-?\d+px)\s+(-?\d+px)\s+(\d+px)\s+(\d+px)/;

        // I. Canvas dimensions
            // Calculate the bounding box that fully contains both the root element and its shadows by combining their positions and dimensions
            this.rootRect        = root.getBoundingClientRect();
            const computedStyles = window.getComputedStyle(this.root);

            let boxShadowRelativeXY = {
                StartX : this.rootRect.x,
                StartY : this.rootRect.y,
                EndX   : this.rootRect.right,
                EndY   : this.rootRect.bottom
            }

            this.translateX = 0; // X offset of the root element's context within the total bounding box
            this.translateY = 0; // Y offset of the root element's context within the total bounding box

            let shadows = [];
            if(computedStyles.boxShadow !== "none") {
                shadows = this.extractBoxShadow(computedStyles.boxShadow); // [ { color, offsetX, offsetY, blur, spread }, ... ]

                shadows.forEach(shadow => {
                    boxShadowRelativeXY.StartX = Math.min(boxShadowRelativeXY.StartX, this.rootRect.x - shadow.spread + shadow.offsetX);
                    boxShadowRelativeXY.StartY = Math.min(boxShadowRelativeXY.StartY, this.rootRect.y - shadow.spread + shadow.offsetY);
                    boxShadowRelativeXY.EndX   = Math.max(boxShadowRelativeXY.EndX, this.rootRect.right + shadow.spread + shadow.offsetX);
                    boxShadowRelativeXY.EndY   = Math.max(boxShadowRelativeXY.EndY, this.rootRect.bottom + shadow.spread + shadow.offsetY);

                    if(shadow.offsetX - shadow.spread < 0 && Math.abs(shadow.offsetX - shadow.spread) > this.translateX) this.translateX = Math.abs(shadow.offsetX - shadow.spread);
                    if(shadow.offsetY - shadow.spread < 0 && Math.abs(shadow.offsetY - shadow.spread) > this.translateY) this.translateY = Math.abs(shadow.offsetY - shadow.spread);
                });
            }
            
            // The dimensions of the bounding box that contains all visual styles of the root element
            let effectiveWidth  = Math.max(boxShadowRelativeXY.EndX, this.rootRect.right) - Math.min(boxShadowRelativeXY.StartX, this.rootRect.x);
            let effectiveHeight = Math.max(boxShadowRelativeXY.EndY, this.rootRect.bottom) - Math.min(boxShadowRelativeXY.StartY, this.rootRect.y);

            // Expand the container’s bounding box by the outline width—only if the outline isn’t already encompassed by the shadow bounds
            const outlineWidth = parseFloat(computedStyles.outlineWidth);
            if(this.rootRect.x - outlineWidth < boxShadowRelativeXY.StartX) {
                effectiveWidth += outlineWidth;
                this.translateX     += outlineWidth - Math.max(0, boxShadowRelativeXY.StartX - this.rootRect.x);
            }
            if(this.rootRect.y - outlineWidth < boxShadowRelativeXY.StartY) {
                effectiveHeight += outlineWidth;
                this.translateY      += outlineWidth - Math.max(0, boxShadowRelativeXY.StartY - this.rootRect.y);
            }
            if(this.rootRect.right + outlineWidth > boxShadowRelativeXY.EndX) effectiveWidth += outlineWidth;
            if(this.rootRect.bottom + outlineWidth > boxShadowRelativeXY.EndY) effectiveHeight += outlineWidth;

            // Total canvas size including all visual extents: root, shadows, and outlines
            this.canvas.width  = effectiveWidth;
            this.canvas.height = effectiveHeight;

        // II. Canvas: fill Shadows, Backgrounds, Borders and Text
            let rootRadii = computedStyles.borderRadius;
            if(rootRadii !== '0px') rootRadii = this.extractBorderRadii(rootRadii, this.rootRect.width, this.rootRect.height);
            else rootRadii = this.extractBorderRadii('0', this.rootRect.width, this.rootRect.height);

            if(shadows.length > 0) this.drawShadows(this.rootRect, shadows, rootRadii);
            // Set the root element's coordinates based on the calculated translation values, which position the root correctly inside the total bounding box.
            this.context.translate(this.translateX, this.translateY);
            // Reset translation values so child elements can compute their positions relative to the root.
            this.translateX = 0;
            this.translateY = 0;

            this.drawBackground(this.rootRect, this.root, rootRadii);
            if(!computedStyles.border.startsWith("0px")) this.drawBorders(this.rootRect, this.root, rootRadii);
            this.drawText(this.root);

        // III. Children
            Array.from(this.root.getElementsByTagName("*")).forEach(child => {
                const childRect      = child.getBoundingClientRect();
                const childBoxShadow = window.getComputedStyle(child).boxShadow;
                const childShadows   = this.extractBoxShadow(childBoxShadow);

                let radii = window.getComputedStyle(child).borderRadius;
                if(radii !== '0px') radii = this.extractBorderRadii(radii, childRect.width, childRect.height);
                else radii = this.extractBorderRadii('0',  childRect.width, childRect.height);
                
                if(childShadows.length > 0) this.drawShadows(childRect, childShadows, radii);
                this.drawBackground(childRect, child, radii);
                if(!window.getComputedStyle(child).border.startsWith("0px")) this.drawBorders(childRect, child, radii);
                this.drawText(child);
            });

        // IV. Outline

        this.root     = null;
        this.context  = null;
        this.rootRect = null;
    }

    drawBackground(elementRect, element, radii) {
        const backgroundImage = window.getComputedStyle(element).backgroundImage;
        const backgroundColor = window.getComputedStyle(element).backgroundColor;
        
        this.context.save();

        if(backgroundImage !== "none") {
            if(backgroundImage.includes("linear-gradient")) {

            }
            else if(backgroundImage.includes("radial-gradient")) {

            }
            else if(backgroundImage.includes("conic-gradient")) {

            }
            else {
                
            }
        }
        else if(backgroundColor !== "transparent" && backgroundColor !== "rgba(0, 0, 0, 0)") {
            this.context.beginPath();
            this.context.roundRect(elementRect.x - this.rootRect.x, elementRect.y - this.rootRect.y, elementRect.width, elementRect.height, [
                { x: radii.horizontal[0], y: radii.vertical[0] },
                { x: radii.horizontal[1], y: radii.vertical[1] },
                { x: radii.horizontal[2], y: radii.vertical[2] },
                { x: radii.horizontal[3], y: radii.vertical[3] }
            ]);
            this.context.fillStyle = backgroundColor;
            this.context.fill();
        }

        this.context.restore();
    }

    drawBorders(elementRect, element, radii) {
        if(!window.getComputedStyle(element).borderTop.startsWith("0px")) {
            const color        = window.getComputedStyle(element).borderTopColor;
            const style        = window.getComputedStyle(element).borderTopStyle;
            const width        = parseFloat(window.getComputedStyle(element).borderTopWidth);
            const centerBorder = width / 2;
            const moveTo       = { 
                x: elementRect.x - this.rootRect.x + radii.horizontal[0],
                y: elementRect.y - this.rootRect.y 
            };
            const lineTo       = { 
                x: elementRect.x - this.rootRect.x + elementRect.width - centerBorder - radii.horizontal[1], 
                y: elementRect.y - this.rootRect.y 
            };
            this.drawBorderSegment(color, style, width, centerBorder, moveTo, lineTo);

            //...
        }
    }

    drawBorderSegment(color, style, width, centerBorder, moveTo, lineTo) {
        this.context.save();
        this.context.strokeStyle = color;
        this.context.lineWidth   = width;
        if(style === "dashed" || style === "dotted") this.context.setLineDash([parseFloat(width) * 2, parseFloat(width)]);
        this.context.beginPath();
        this.context.moveTo(moveTo.x + centerBorder, moveTo.y + centerBorder);
        this.context.lineTo(lineTo.x + centerBorder, lineTo.y + centerBorder);
        this.context.stroke();
        this.context.restore();
    }

    drawBorderRadius() {

    }

    drawShadows(elementRect, shadows, radii) {
        shadows.reverse().forEach(shadow => {
            this.context.save();
            const shadowX      = elementRect.x - this.rootRect.x + this.translateX + shadow.offsetX - shadow.spread;
            const shadowY      = elementRect.y - this.rootRect.y + this.translateY + shadow.offsetY - shadow.spread;
            const shadowWidth  = elementRect.width + shadow.spread * 2;
            const shadowHeight = elementRect.height + shadow.spread * 2;
            
            this.context.beginPath();
            this.context.roundRect(shadowX, shadowY, shadowWidth, shadowHeight, [
                { x: radii.horizontal[0], y: radii.vertical[0] },
                { x: radii.horizontal[1], y: radii.vertical[1] },
                { x: radii.horizontal[2], y: radii.vertical[2] },
                { x: radii.horizontal[3], y: radii.vertical[3] }
            ]);
            this.context.filter    = `blur(${shadow.blur}px)`;
            this.context.fillStyle = shadow.color;
            this.context.fill();
            this.context.restore();
        });
    }

    drawText(element) {
        const elementRect = element.getBoundingClientRect();
        element.childNodes.forEach(node => {
            if(node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                let fullText = node.textContent.trim();
                let width    = 0;
                let index    = 0;
                this.context.save();
                const range = document.createRange();
                range.selectNodeContents(node);
                const rects = Array.from(range.getClientRects());
                rects.forEach(rect => {
                    this.context.fillStyle = window.getComputedStyle(element).color;
                    this.context.font = window.getComputedStyle(element).font;
                    const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
                    let text = "";
                    for(const word of fullText.split(" ")) {
                        if(this.context.measureText(word).width + width >= elementRect.width) break;
                        
                        text  += word + " ";
                        width += this.context.measureText(word).width + this.context.measureText(" ").width;
                        index += word.length + 1;
                    }
                    width = 0;
                    fullText = fullText.slice(index);
                    index = 0;
                    this.context.fillText(text, rect.x - this.rootRect.x, rect.y - this.rootRect.y + fontSize);
                });
                this.context.restore();
            }
        });
    }

    extractBorderRadii(borderRadiusString, boxWidth, boxHeight) {
        const [horizontalPart, verticalPart] = borderRadiusString.split('/').map(part =>
            part.trim().split(/\s+/)
        );

        function expand(values) {
            const [a = '0', b = a, c = a, d = b] = values;
            return [a, b, c, d];
        }

        function parseValue(value, isHorizontal) {
            if (value.endsWith('%')) {
                const percentage = parseFloat(value) / 100;
                return percentage * (isHorizontal ? boxWidth : boxHeight);
            } else {
                return parseFloat(value);
            }
        }

        const rawH = expand(horizontalPart);
        const rawV = expand(verticalPart || rawH);

        const horizontal = rawH.map(val => parseValue(val, true));
        const vertical   = rawV.map(val => parseValue(val, false));

        return {
            horizontal,
            vertical
        };
    }

    extractBoxShadow(boxShadowString) {
        return (boxShadowString.match(this.boxShadowRegex) || [])
                .map(shadow => shadow.trim())
                .map(shadow => {
                    const match = shadow.match(this.shadowRegex);
                    if(!match) return null;

                    const [, color, offsetX, offsetY, blur, spread = "0px"] = match;
                    return {
                        color   : color,
                        offsetX : parseFloat(offsetX),
                        offsetY : parseFloat(offsetY),
                        blur    : parseFloat(blur),
                        spread  : parseFloat(spread) 
                    };
                }).filter(Boolean);
    }
}