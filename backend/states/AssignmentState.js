// State pattern. An assignment moves through a small lifecycle, and what you're
// allowed to do with it depends on where it sits in that lifecycle. Rather than
// scatter `if (status === 'Submitted')` checks through the controllers, each
// status is its own state object that answers the lifecycle questions for
// itself - can the student still submit it, can a teacher grade it yet.

const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');

class AssignmentState {
    get name() {
        throw new Error('name must be implemented by a state');
    }

    // a student can hand the work in for marking
    canSubmit() {
        return false;
    }

    // a teacher is allowed to put a grade against it
    canBeGraded() {
        return false;
    }
}

// fresh assignment the student hasn't touched yet - still theirs to submit
class NotStartedState extends AssignmentState {
    get name() { return ASSIGNMENT_STATUSES.NOT_STARTED; }
    canSubmit() { return true; }
}

class InProgressState extends AssignmentState {
    get name() { return ASSIGNMENT_STATUSES.IN_PROGRESS; }
    canSubmit() { return true; }
}

// past the deadline but not yet handed in - we still let them submit it late
class OverdueState extends AssignmentState {
    get name() { return ASSIGNMENT_STATUSES.OVERDUE; }
    canSubmit() { return true; }
}

// student has finished and marked it complete - treat that as ready to submit
class CompletedState extends AssignmentState {
    get name() { return ASSIGNMENT_STATUSES.COMPLETED; }
    canSubmit() { return true; }
}

// handed in and waiting on a teacher - this is the only state grading opens up
class SubmittedState extends AssignmentState {
    get name() { return ASSIGNMENT_STATUSES.SUBMITTED; }
    canBeGraded() { return true; }
}

// already marked - the student can see the grade, but it can't be re-submitted
// or graded again (a teacher edits the existing grade instead)
class GradedState extends AssignmentState {
    get name() { return ASSIGNMENT_STATUSES.GRADED; }
}

const STATES = {
    [ASSIGNMENT_STATUSES.NOT_STARTED]: NotStartedState,
    [ASSIGNMENT_STATUSES.IN_PROGRESS]: InProgressState,
    [ASSIGNMENT_STATUSES.OVERDUE]: OverdueState,
    [ASSIGNMENT_STATUSES.COMPLETED]: CompletedState,
    [ASSIGNMENT_STATUSES.SUBMITTED]: SubmittedState,
    [ASSIGNMENT_STATUSES.GRADED]: GradedState,
};

// hands back the state object for a status string, defaulting to Not Started
function getAssignmentState(status = ASSIGNMENT_STATUSES.NOT_STARTED) {
    const State = STATES[status];
    if (!State) {
        throw new Error(`Unknown assignment status: ${status}`);
    }
    return new State();
}

module.exports = {
    getAssignmentState,
    AssignmentState,
    NotStartedState,
    InProgressState,
    OverdueState,
    CompletedState,
    SubmittedState,
    GradedState,
};
