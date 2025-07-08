function ghostTyping(
        data    = [], 
        target  = null, 
        repeat
    ) {

    let textFragment = document.createDocumentFragment();
    for(let i = 0; i < data.length; i++) {
        let text = data[i].text;
        let charFragment = document.createDocumentFragment();
        for(let j = 0; j < text.length; j++) {
            let node = document.createElement('div');
            node.style.display = 'inline';
            node.style.backgroundColor = 'transparent';
            node.style.color = 'transparent';
            node.textContent = text[j];
            charFragment.appendChild(node);
        }
        let textNode = document.createElement('div');
        textNode.style.display = 'inline';
        textNode.appendChild(charFragment);
        target.appendChild(textNode);
    }
    target.appendChild(textFragment);


    let state     = 'initial-idle';
    let lineIndex = 0;
    let index     = 0;
    
    let now       = 0, 
        then      = Date.now(), 
        ellapsed  = 0;

    const tick = () => {
        now       = Date.now();
        ellapsed += now - then;

        if(state === 'initial-idle') {
            if(ellapsed >= data[lineIndex].delay) {
                state = 'typing';
                ellapsed  = 0;
            }
        }
        else if(state === 'typing') {
            if(Math.floor(data[lineIndex].duration / data[lineIndex].text.length) <= 0) {
                let textNode = target.children[lineIndex];
                for(let i = 0; i < textNode.children.length; i++) {
                    let charNode = textNode.children[i];
                    charNode.style.color = 'inherit';
                }

                state = 'initial-idle';
                lineIndex++;
                index = 0;

                if(lineIndex > target.children.length - 1) {
                    state = 'terminal-idle';
                }
                
                ellapsed = 0;
            }
            else if(ellapsed >= Math.floor(data[lineIndex].duration / data[lineIndex].text.length)) {
                if(index > target.children[lineIndex].children.length - 1) {
                    state = 'initial-idle';
                    lineIndex++;
                    index = 0;
                    
                    if(lineIndex > target.children.length - 1) {
                        state = 'terminal-idle';
                    }
                }
                else {
                    let textNode = target.children[lineIndex];
                    let characterNode = textNode.children[index];
                    characterNode.style.color = 'inherit';
                    index++;
                }
                ellapsed  = 0;
            }
        }
        else if(state === 'terminal-idle') {
            if(typeof repeat === 'number' && repeat >= 0 && ellapsed >= repeat) {
                for(let i = 0; i < target.children.length; i++) {
                    let textNode = target.children[i];
                    for(let j = 0; j < textNode.children.length; j++) {
                        let charNode = textNode.children[j];
                        charNode.style.color = 'transparent';
                    }
                }
                lineIndex = 0;
                state = 'initial-idle';
                ellapsed = 0;
            }
            else if(typeof repeat === 'undefined') {
                ellapsed = 0;
            }
        }

        then = now;
        now  = 0;
        requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
}