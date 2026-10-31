// main.js
import { Game } from './game.js';

let currentGame = null;
let currentMode = null;
let selectedLevel = 1;

document.addEventListener("DOMContentLoaded", () => {
    // Menu elements
    const menuScreen = document.getElementById("menu-screen");
    const gameScreen = document.getElementById("game-screen");
    
    const btnVsComputer = document.getElementById("btn-vs-computer");
    const btnVsFriend = document.getElementById("btn-vs-friend");
    const levelSelection = document.getElementById("level-selection");
    const levelBtns = document.querySelectorAll(".level-btn");
    const levelDesc = document.getElementById("level-description");
    const btnStart = document.getElementById("btn-start-game");
    const btnBack = document.getElementById("btn-back");
    
    // Game Over elements
    const modal = document.getElementById("game-over-modal");
    const btnPlayAgain = document.getElementById("btn-play-again");
    const btnMainMenu = document.getElementById("btn-main-menu");
    
    // In-game elements
    const btnQuit = document.getElementById("btn-quit");
    const btnFindSet = document.getElementById("btn-find-set");

    // Mode selection
    btnVsComputer.addEventListener("click", () => showLevelSelection('vs-computer'));
    btnVsFriend.addEventListener("click", () => showLevelSelection('vs-friend'));
    
    // Level selection
    levelBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            levelBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedLevel = parseInt(btn.dataset.level);
            
            const target = selectedLevel * 3 + 2;
            if (currentMode === 'vs-computer') {
                levelDesc.textContent = `Computer speed: Level ${selectedLevel}. Target score: ${target}.`;
            } else {
                levelDesc.textContent = `Buzzer mode. Target score: ${target}.`;
            }
            btnStart.disabled = false;
        });
    });

    btnBack.addEventListener("click", () => {
        levelSelection.classList.add('hidden');
        document.querySelector('.mode-selection').classList.remove('hidden');
        btnStart.disabled = true;
        levelBtns.forEach(b => b.classList.remove('selected'));
    });

    function showLevelSelection(mode) {
        currentMode = mode;
        document.querySelector('.mode-selection').classList.add('hidden');
        levelSelection.classList.remove('hidden');
        levelDesc.textContent = "Select a level to see details.";
    }

    // Start Game
    btnStart.addEventListener("click", () => {
        menuScreen.classList.remove('active');
        gameScreen.classList.add('active');
        startGame();
    });

    function startGame() {
        if (currentGame) {
            currentGame.cleanup();
        }
        modal.classList.add('hidden');
        currentGame = new Game(currentMode, selectedLevel, handleGameOver);
    }

    // In-game actions
    btnFindSet.addEventListener("click", () => {
        if (currentGame) currentGame.forceDeal();
    });

    btnQuit.addEventListener("click", () => {
        if (currentGame) currentGame.cleanup();
        gameScreen.classList.remove('active');
        menuScreen.classList.add('active');
        levelSelection.classList.add('hidden');
        document.querySelector('.mode-selection').classList.remove('hidden');
        btnStart.disabled = true;
        levelBtns.forEach(b => b.classList.remove('selected'));
    });

    // Game Over
    function handleGameOver(winner, p1Score, p2Score) {
        modal.classList.remove('hidden');
        const title = document.getElementById("game-over-title");
        const msg = document.getElementById("game-over-message");
        
        if (winner === 'Tie') {
            title.textContent = "It's a Tie!";
            msg.textContent = "Good game!";
        } else if (winner === 'You') {
            title.textContent = "You Won!";
            msg.textContent = "Great job beating the computer!";
        } else if (winner === 'Computer') {
            title.textContent = "You Lost!";
            msg.textContent = "The computer was too fast.";
        } else {
            title.textContent = `${winner} Won!`;
            msg.textContent = "Congratulations!";
        }
        
        document.getElementById("final-p1").textContent = `${currentMode === 'vs-computer' ? 'You' : 'Player 1'}: ${p1Score}`;
        document.getElementById("final-p2").textContent = `${currentMode === 'vs-computer' ? 'Computer' : 'Player 2'}: ${p2Score}`;
    }

    btnPlayAgain.addEventListener("click", () => {
        startGame();
    });

    btnMainMenu.addEventListener("click", () => {
        modal.classList.add('hidden');
        gameScreen.classList.remove('active');
        menuScreen.classList.add('active');
        levelSelection.classList.add('hidden');
        document.querySelector('.mode-selection').classList.remove('hidden');
        btnStart.disabled = true;
        levelBtns.forEach(b => b.classList.remove('selected'));
    });
});
