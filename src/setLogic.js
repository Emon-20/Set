// setLogic.js

/**
 * Checks if 3 cards form a valid Set.
 * A Set consists of 3 cards in which each of the cards' features,
 * looked at one-by-one, are the same on each card, or, are different on each card.
 * @param {Object} c1 
 * @param {Object} c2 
 * @param {Object} c3 
 * @returns {boolean} true if it's a set
 */
export function isSet(c1, c2, c3) {
    const properties = ['color', 'shape', 'shading', 'number'];
    
    for (let prop of properties) {
        const v1 = c1[prop];
        const v2 = c2[prop];
        const v3 = c3[prop];
        
        // Either all the same
        const allSame = (v1 === v2 && v2 === v3);
        // Or all different
        const allDifferent = (v1 !== v2 && v1 !== v3 && v2 !== v3);
        
        if (!allSame && !allDifferent) {
            return false;
        }
    }
    return true;
}

/**
 * Finds all possible sets in a given array of cards.
 * @param {Array} boardCards 
 * @returns {Array} Array of sets, where each set is an array of 3 cards.
 */
export function findSetsOnBoard(boardCards) {
    const sets = [];
    const n = boardCards.length;
    
    // Check all combinations of 3 cards
    for (let i = 0; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
            for (let k = j + 1; k < n; k++) {
                if (isSet(boardCards[i], boardCards[j], boardCards[k])) {
                    sets.push([boardCards[i], boardCards[j], boardCards[k]]);
                }
            }
        }
    }
    return sets;
}
