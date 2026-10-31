// deck.js

const COLORS = ['red', 'green', 'purple'];
const SHAPES = ['oval', 'squiggle', 'diamond'];
const SHADINGS = ['solid', 'striped', 'open'];
const NUMBERS = [1, 2, 3];

export class Deck {
    constructor() {
        this.cards = [];
        this.board = [];
        this.generateDeck();
    }

    generateDeck() {
        this.cards = [];
        let id = 0;
        for (let color of COLORS) {
            for (let shape of SHAPES) {
                for (let shading of SHADINGS) {
                    for (let number of NUMBERS) {
                        this.cards.push({ id: id++, color, shape, shading, number });
                    }
                }
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal(num) {
        const dealt = [];
        for (let i = 0; i < num && this.cards.length > 0; i++) {
            dealt.push(this.cards.pop());
        }
        return dealt;
    }
}
