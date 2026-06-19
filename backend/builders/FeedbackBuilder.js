// Builder pattern. Teacher feedback has a lot of optional bits - a summary, any
// number of strengths, things to improve, and per-criterion rubric marks. Rather
// than a constructor with a pile of args, we build it up step by step and call
// build() at the end. Each setter returns this so the calls can chain.

class FeedbackBuilder {
    constructor() {
        this._summary = '';
        this._strengths = [];
        this._improvements = [];
        this._rubric = [];
    }

    setSummary(summary) {
        this._summary = summary;
        return this;
    }

    addStrength(point) {
        if (point) this._strengths.push(point);
        return this;
    }

    addImprovement(point) {
        if (point) this._improvements.push(point);
        return this;
    }

    addRubricItem(criterion, score, outOf) {
        this._rubric.push({ criterion, score, outOf });
        return this;
    }

    build() {
        return {
            summary: this._summary,
            strengths: this._strengths,
            improvements: this._improvements,
            rubric: this._rubric,
        };
    }
}

module.exports = FeedbackBuilder;
