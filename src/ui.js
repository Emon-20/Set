// ui.js

const SVG_NS = "http://www.w3.org/2000/svg";

const COLORS = {
    red: '#ef4444',
    green: '#22c55e',
    purple: '#a855f7'
};

function getShapeSVG(shape, color, shading, index) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.classList.add("shape");
    
    // Define patterns for striped shading
    if (shading === 'striped') {
        const defs = document.createElementNS(SVG_NS, "defs");
        const pattern = document.createElementNS(SVG_NS, "pattern");
        const patternId = `stripe-${color}-${index}`;
        pattern.setAttribute("id", patternId);
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        pattern.setAttribute("width", "8");
        pattern.setAttribute("height", "8");
        pattern.setAttribute("patternTransform", "rotate(45)");
        
        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("width", "4");
        rect.setAttribute("height", "8");
        rect.setAttribute("fill", COLORS[color]);
        
        pattern.appendChild(rect);
        defs.appendChild(pattern);
        svg.appendChild(defs);
    }
    
    let path = document.createElementNS(SVG_NS, "path");
    
    if (shape === 'diamond') {
        path.setAttribute("d", "M50 10 L90 50 L50 90 L10 50 Z");
    } else if (shape === 'oval') {
        path = document.createElementNS(SVG_NS, "rect");
        path.setAttribute("x", "10");
        path.setAttribute("y", "20");
        path.setAttribute("width", "80");
        path.setAttribute("height", "60");
        path.setAttribute("rx", "30");
        path.setAttribute("ry", "30");
    } else if (shape === 'squiggle') {
        // A nice squiggle path
        path.setAttribute("d", "M20,60 C0,60 10,20 40,20 C55,20 60,35 75,35 C90,35 100,20 90,60 C80,100 65,80 50,80 C35,80 40,60 20,60 Z");
    }
    
    path.setAttribute("stroke", COLORS[color]);
    path.setAttribute("stroke-width", "4");
    
    if (shading === 'solid') {
        path.setAttribute("fill", COLORS[color]);
    } else if (shading === 'striped') {
        path.setAttribute("fill", `url(#stripe-${color}-${index})`);
    } else if (shading === 'open') {
        path.setAttribute("fill", "transparent");
    }
    
    svg.appendChild(path);
    return svg;
}

export function renderCard(card, onClick) {
    const cardEl = document.createElement("div");
    cardEl.classList.add("card");
    cardEl.dataset.id = card.id;
    
    for (let i = 0; i < card.number; i++) {
        const svg = getShapeSVG(card.shape, card.color, card.shading, `${card.id}-${i}`);
        cardEl.appendChild(svg);
    }
    
    cardEl.addEventListener("click", () => onClick(card, cardEl));
    return cardEl;
}

export function renderBoard(boardCards, container, onCardClick, selectedCards) {
    container.innerHTML = "";
    boardCards.forEach(card => {
        if (!card) return; // empty slot
        const cardEl = renderCard(card, onCardClick);
        if (selectedCards.some(c => c.id === card.id)) {
            cardEl.classList.add("selected");
        }
        container.appendChild(cardEl);
    });
}

export function showMessage(msgText, isError = false) {
    const msgArea = document.getElementById("message-area");
    msgArea.textContent = msgText;
    msgArea.style.color = isError ? "var(--error)" : "var(--success)";
    setTimeout(() => {
        msgArea.textContent = "";
    }, 3000);
}

export function updateScores(p1, p2) {
    document.getElementById("p1-score").textContent = p1;
    document.getElementById("p2-score").textContent = p2;
}

export function setLevelInfo(level, targetScore) {
    document.getElementById("current-level-display").textContent = `Level ${level}`;
    document.getElementById("target-score-display").textContent = `Target: ${targetScore}`;
}

export function updateDeckCount(count) {
    document.getElementById("deck-count-value").textContent = count;
}

export function setupPlayerNames(mode) {
    if (mode === 'vs-computer') {
        document.getElementById("p1-name").textContent = "You";
        document.getElementById("p2-name").textContent = "Computer";
    } else {
        document.getElementById("p1-name").textContent = "Player 1 (A)";
        document.getElementById("p2-name").textContent = "Player 2 (L)";
    }
}
