// game.js
import { Deck } from './deck.js';
import { isSet, findSetsOnBoard } from './setLogic.js';
import { Bot } from './bot.js';
import { renderBoard, showMessage, updateScores, setLevelInfo, updateDeckCount, setupPlayerNames } from './ui.js';

export class Game {
    constructor(mode, level, onGameOver) {
        this.mode = mode;
        this.level = level;
        this.onGameOver = onGameOver;
        
        this.deck = new Deck();
        this.deck.shuffle();
        this.boardCards = [];
        this.selectedCards = [];
        
        this.p1Score = 0;
        this.p2Score = 0;
        
        // Target scores based on level
        this.targetScore = this.level * 3 + 2; // Level 1: 5, L2: 8, L3: 11, L4: 14, L5: 17
        
        this.activePlayer = mode === 'vs-computer' ? 1 : 0; // 0 means waiting for buzzer
        this.buzzerTimer = null;
        
        this.boardContainer = document.getElementById("board");
        
        if (this.mode === 'vs-computer') {
            this.bot = new Bot(this.level, (set) => this.handleBotFoundSet(set));
        }

        this.init();
    }

    init() {
        this.boardCards = this.deck.deal(12);
        this.ensureSetExists();
        this.updateUI();
        
        if (this.mode === 'vs-computer') {
            this.bot.start(this.boardCards);
        } else {
            document.addEventListener('keydown', this.handleBuzzer);
        }
    }
    
    cleanup() {
        if (this.bot) this.bot.stop();
        document.removeEventListener('keydown', this.handleBuzzer);
        if (this.buzzerTimer) clearTimeout(this.buzzerTimer);
    }

    handleBuzzer = (e) => {
        if (this.mode !== 'vs-friend' || this.activePlayer !== 0) return;
        
        const key = e.key.toLowerCase();
        if (key === 'a') {
            this.activateBuzzer(1);
        } else if (key === 'l') {
            this.activateBuzzer(2);
        }
    }

    activateBuzzer(playerNum) {
        this.activePlayer = playerNum;
        this.selectedCards = [];
        
        const buzzerMsg = document.getElementById('buzzer-message');
        buzzerMsg.classList.remove('hidden');
        document.getElementById('buzzer-text').textContent = `Player ${playerNum}'s Turn! (3s)`;
        
        const timerFill = document.getElementById('timer-fill');
        timerFill.style.transition = 'none';
        timerFill.style.transform = 'scaleX(1)';
        
        // Force reflow
        void timerFill.offsetWidth;
        
        timerFill.style.transition = 'transform 3s linear';
        timerFill.style.transform = 'scaleX(0)';
        
        this.updateBoard(); // Clear previous selections visually

        this.buzzerTimer = setTimeout(() => {
            if (this.activePlayer === playerNum) {
                // Time ran out
                this.handleFailedSet(playerNum, "Time's up! -1 Point");
                this.endBuzzerTurn();
            }
        }, 3000);
    }
    
    endBuzzerTurn() {
        this.activePlayer = 0;
        this.selectedCards = [];
        document.getElementById('buzzer-message').classList.add('hidden');
        this.updateBoard();
    }

    ensureSetExists() {
        let sets = findSetsOnBoard(this.boardCards);
        while (sets.length === 0 && this.deck.cards.length > 0) {
            const newCards = this.deck.deal(3);
            this.boardCards.push(...newCards);
            sets = findSetsOnBoard(this.boardCards);
        }
    }

    handleCardClick(card, cardEl) {
        if (this.mode === 'vs-friend' && this.activePlayer === 0) {
            showMessage("Buzz in first! (P1: A, P2: L)");
            return;
        }

        const index = this.selectedCards.findIndex(c => c.id === card.id);
        if (index > -1) {
            this.selectedCards.splice(index, 1);
        } else {
            this.selectedCards.push(card);
        }
        
        this.updateBoard();

        if (this.selectedCards.length === 3) {
            this.checkSelectedSet();
        }
    }

    checkSelectedSet() {
        const [c1, c2, c3] = this.selectedCards;
        const valid = isSet(c1, c2, c3);
        
        const currentPlayer = this.mode === 'vs-computer' ? 1 : this.activePlayer;

        if (valid) {
            this.handleValidSet(currentPlayer, this.selectedCards);
        } else {
            this.handleFailedSet(currentPlayer, "Not a set!");
        }
        
        if (this.mode === 'vs-friend') {
            clearTimeout(this.buzzerTimer);
            this.endBuzzerTurn();
        } else {
            this.selectedCards = [];
        }
    }

    handleValidSet(playerNum, cards) {
        if (playerNum === 1) this.p1Score++;
        else this.p2Score++;
        
        showMessage(`Set found! +1 Point`, false);
        this.removeCardsFromBoard(cards);
        this.ensureSetExists();
        this.updateUI();
        this.checkWinCondition();
        
        if (this.mode === 'vs-computer') {
            this.bot.start(this.boardCards);
        }
    }
    
    handleFailedSet(playerNum, msg) {
        if (playerNum === 1) this.p1Score = Math.max(0, this.p1Score - 1);
        else this.p2Score = Math.max(0, this.p2Score - 1);
        
        showMessage(msg, true);
        this.updateUI();
        this.selectedCards = [];
        this.updateBoard();
    }

    handleBotFoundSet(cards) {
        // Visual indication of what the bot found
        this.selectedCards = cards;
        this.updateBoard();
        
        setTimeout(() => {
            this.p2Score++;
            showMessage("Computer found a set!", true);
            this.removeCardsFromBoard(cards);
            this.ensureSetExists();
            this.updateUI();
            this.selectedCards = [];
            this.checkWinCondition();
            if (this.p2Score < this.targetScore && this.p1Score < this.targetScore) {
                this.bot.start(this.boardCards);
            }
        }, 1000);
    }

    removeCardsFromBoard(cardsToRemove) {
        const ids = cardsToRemove.map(c => c.id);
        
        for (let i = 0; i < this.boardCards.length; i++) {
            if (ids.includes(this.boardCards[i].id)) {
                // If we have more than 12 cards on board, or deck is empty, don't replace, just remove
                if (this.boardCards.length > 12 || this.deck.cards.length === 0) {
                    this.boardCards.splice(i, 1);
                    i--; // adjust index since we spliced
                } else {
                    // Replace with new card
                    const newCard = this.deck.deal(1)[0];
                    if (newCard) {
                        this.boardCards[i] = newCard;
                    } else {
                        this.boardCards.splice(i, 1);
                        i--;
                    }
                }
            }
        }
    }

    forceDeal() {
        const sets = findSetsOnBoard(this.boardCards);
        if (sets.length > 0) {
            showMessage("There is a set on the board! Keep looking.", true);
            if (this.mode === 'vs-computer') {
                this.p1Score = Math.max(0, this.p1Score - 1);
                this.updateUI();
            }
        } else {
            if (this.deck.cards.length > 0) {
                this.boardCards.push(...this.deck.deal(3));
                this.updateUI();
                if (this.mode === 'vs-computer') this.bot.start(this.boardCards);
            } else {
                showMessage("No more cards in deck. Game Over.");
                this.endGame();
            }
        }
    }

    checkWinCondition() {
        if (this.p1Score >= this.targetScore || this.p2Score >= this.targetScore) {
            this.endGame();
        }
    }

    endGame() {
        this.cleanup();
        let winner = '';
        if (this.p1Score > this.p2Score) {
            winner = this.mode === 'vs-computer' ? 'You' : 'Player 1';
        } else if (this.p2Score > this.p1Score) {
            winner = this.mode === 'vs-computer' ? 'Computer' : 'Player 2';
        } else {
            winner = 'Tie';
        }
        this.onGameOver(winner, this.p1Score, this.p2Score);
    }

    updateBoard() {
        renderBoard(this.boardCards, this.boardContainer, (card, el) => this.handleCardClick(card, el), this.selectedCards);
    }
    
    updateUI() {
        setupPlayerNames(this.mode);
        setLevelInfo(this.level, this.targetScore);
        updateScores(this.p1Score, this.p2Score);
        updateDeckCount(this.deck.cards.length);
        this.updateBoard();
    }
}
