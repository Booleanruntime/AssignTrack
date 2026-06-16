const { expect } = require('chai');
const FeedbackBuilder = require('../builders/FeedbackBuilder');

describe('FeedbackBuilder (Builder pattern)', () => {
    it('builds a full feedback object through chained calls', () => {
        const feedback = new FeedbackBuilder()
            .setSummary('Solid effort overall')
            .addStrength('Clear structure')
            .addStrength('Good referencing')
            .addImprovement('Tighten the conclusion')
            .addRubricItem('Analysis', 8, 10)
            .build();

        expect(feedback.summary).to.equal('Solid effort overall');
        expect(feedback.strengths).to.deep.equal(['Clear structure', 'Good referencing']);
        expect(feedback.improvements).to.deep.equal(['Tighten the conclusion']);
        expect(feedback.rubric).to.deep.equal([{ criterion: 'Analysis', score: 8, outOf: 10 }]);
    });

    it('returns sensible empty defaults when nothing is added', () => {
        const feedback = new FeedbackBuilder().build();
        expect(feedback).to.deep.equal({ summary: '', strengths: [], improvements: [], rubric: [] });
    });

    it('ignores empty strengths and improvements', () => {
        const feedback = new FeedbackBuilder().addStrength('').addImprovement(null).build();
        expect(feedback.strengths).to.be.empty;
        expect(feedback.improvements).to.be.empty;
    });
});
