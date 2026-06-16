// turns rubric rows into a 0-100 overall: total marks over total available
// marks. returns null when there's nothing usable to grade against so the
// caller can reject it rather than divide by zero.
function computeOverall(rubric = []) {
    const totalMax = rubric.reduce((sum, r) => sum + (Number(r.outOf) || 0), 0);
    if (totalMax <= 0) return null;

    const totalMark = rubric.reduce((sum, r) => sum + (Number(r.score) || 0), 0);
    const overall = Math.round((totalMark / totalMax) * 100);

    // a mark higher than its out-of shouldn't push us past 100
    return Math.max(0, Math.min(100, overall));
}

module.exports = computeOverall;
