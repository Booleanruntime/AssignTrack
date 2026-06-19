const { expect } = require('chai');
const computeOverall = require('../utils/computeOverall');

describe('computeOverall (rubric -> 0-100 score)', () => {
    it('sums marks over total available marks', () => {
        const rubric = [
            { criterion: 'Analysis', score: 8, outOf: 10 },
            { criterion: 'Referencing', score: 4, outOf: 5 },
        ];
        // 12 / 15 = 80%
        expect(computeOverall(rubric)).to.equal(80);
    });

    it('rounds to the nearest whole percent', () => {
        expect(computeOverall([{ criterion: 'X', score: 2, outOf: 3 }])).to.equal(67);
    });

    it('returns null when there is nothing to grade against', () => {
        expect(computeOverall([])).to.equal(null);
        expect(computeOverall([{ criterion: 'X', score: 5, outOf: 0 }])).to.equal(null);
    });

    it('never goes above 100 even if a mark beats its out-of', () => {
        expect(computeOverall([{ criterion: 'X', score: 15, outOf: 10 }])).to.equal(100);
    });

    it('never goes below 0', () => {
        expect(computeOverall([{ criterion: 'X', score: -5, outOf: 10 }])).to.equal(0);
    });
});
