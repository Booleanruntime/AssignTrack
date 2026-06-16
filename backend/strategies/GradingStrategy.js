// Strategy pattern. A raw score out of 100 can be reported a few different ways
// depending on the subject - a straight percentage, a letter grade, or just
// pass/fail. Each scheme is its own strategy with the same grade() shape, so the
// grading code picks one at runtime and never branches on the scheme itself.

class GradingStrategy {
    // returns { label, passed } for a 0-100 score
    grade(score) {
        throw new Error('grade() must be implemented by a strategy');
    }
}

class PercentageStrategy extends GradingStrategy {
    grade(score) {
        return { label: `${score}%`, passed: score >= 50 };
    }
}

class LetterStrategy extends GradingStrategy {
    grade(score) {
        let label = 'F';
        if (score >= 85) label = 'HD';
        else if (score >= 75) label = 'D';
        else if (score >= 65) label = 'C';
        else if (score >= 50) label = 'P';
        return { label, passed: score >= 50 };
    }
}

class PassFailStrategy extends GradingStrategy {
    grade(score) {
        const passed = score >= 50;
        return { label: passed ? 'Pass' : 'Fail', passed };
    }
}

const STRATEGIES = {
    percentage: PercentageStrategy,
    letter: LetterStrategy,
    passfail: PassFailStrategy,
};

// hands back the strategy for a scheme name, defaulting to percentage
function getGradingStrategy(scheme = 'percentage') {
    const Strategy = STRATEGIES[scheme];
    if (!Strategy) {
        throw new Error(`Unknown grading scheme: ${scheme}`);
    }
    return new Strategy();
}

module.exports = {
    getGradingStrategy,
    GradingStrategy,
    PercentageStrategy,
    LetterStrategy,
    PassFailStrategy,
};
