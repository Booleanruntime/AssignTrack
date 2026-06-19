const { expect } = require('chai');
const { getGradingStrategy } = require('../strategies/GradingStrategy');

describe('GradingStrategy (Strategy pattern)', () => {
    it('percentage scheme reports the raw score as a percentage', () => {
        expect(getGradingStrategy('percentage').grade(72)).to.deep.equal({ label: '72%', passed: true });
    });

    it('letter scheme maps scores to QUT grade bands', () => {
        const letter = getGradingStrategy('letter');
        expect(letter.grade(90).label).to.equal('HD');
        expect(letter.grade(78).label).to.equal('D');
        expect(letter.grade(67).label).to.equal('C');
        expect(letter.grade(55).label).to.equal('P');
        expect(letter.grade(40).label).to.equal('F');
    });

    it('passfail scheme reports Pass or Fail around 50', () => {
        expect(getGradingStrategy('passfail').grade(50)).to.deep.equal({ label: 'Pass', passed: true });
        expect(getGradingStrategy('passfail').grade(49)).to.deep.equal({ label: 'Fail', passed: false });
    });

    it('defaults to percentage when no scheme is given', () => {
        expect(getGradingStrategy().grade(80).label).to.equal('80%');
    });

    it('throws on an unknown scheme', () => {
        expect(() => getGradingStrategy('vibes')).to.throw('Unknown grading scheme');
    });
});
