// bot.js
import { findSetsOnBoard } from './setLogic.js';

export class Bot {
    constructor(difficultyLevel, onSetFoundCallback) {
        this.level = difficultyLevel;
        this.onSetFound = onSetFoundCallback;
        this.timer = null;
        this.active = false;
    }

    start(boardCards) {
        this.stop();
        this.active = true;
        
        // Difficulty controls the delay before the bot finds a set
        // Level 1: ~15s, Level 2: ~12s, Level 3: ~9s, Level 4: ~6s, Level 5: ~3s
        const baseDelay = 18000;
        const delay = baseDelay - (this.level * 3000); // 15000, 12000, 9000, 6000, 3000
        
        // Add a bit of randomness
        const randomVariance = (Math.random() * 2000) - 1000; // +/- 1s
        const finalDelay = Math.max(1000, delay + randomVariance);

        this.timer = setTimeout(() => {
            if (!this.active) return;
            const sets = findSetsOnBoard(boardCards);
            if (sets.length > 0) {
                // Bot found a set
                const selectedSet = sets[Math.floor(Math.random() * sets.length)];
                this.onSetFound(selectedSet);
            }
        }, finalDelay);
    }

    stop() {
        this.active = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}
