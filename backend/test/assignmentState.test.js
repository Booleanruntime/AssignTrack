const { expect } = require('chai');
const { getAssignmentState } = require('../states/AssignmentState');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');

describe('AssignmentState (State pattern)', () => {
    it('lets a student submit while the work is still theirs to hand in', () => {
        [
            ASSIGNMENT_STATUSES.NOT_STARTED,
            ASSIGNMENT_STATUSES.IN_PROGRESS,
            ASSIGNMENT_STATUSES.OVERDUE,
            ASSIGNMENT_STATUSES.COMPLETED,
        ].forEach((status) => {
            expect(getAssignmentState(status).canSubmit(), status).to.equal(true);
        });
    });

    it('only a submitted assignment can be graded', () => {
        expect(getAssignmentState(ASSIGNMENT_STATUSES.SUBMITTED).canBeGraded()).to.equal(true);
    });

    it('blocks grading on anything that has not been submitted', () => {
        [
            ASSIGNMENT_STATUSES.NOT_STARTED,
            ASSIGNMENT_STATUSES.IN_PROGRESS,
            ASSIGNMENT_STATUSES.OVERDUE,
            ASSIGNMENT_STATUSES.COMPLETED,
        ].forEach((status) => {
            expect(getAssignmentState(status).canBeGraded(), status).to.equal(false);
        });
    });

    it('a graded assignment can be neither re-submitted nor re-graded', () => {
        const graded = getAssignmentState(ASSIGNMENT_STATUSES.GRADED);
        expect(graded.canSubmit()).to.equal(false);
        expect(graded.canBeGraded()).to.equal(false);
    });

    it('defaults to Not Started when no status is given', () => {
        expect(getAssignmentState().name).to.equal(ASSIGNMENT_STATUSES.NOT_STARTED);
    });

    it('throws on an unknown status', () => {
        expect(() => getAssignmentState('Vibing')).to.throw('Unknown assignment status');
    });
});
