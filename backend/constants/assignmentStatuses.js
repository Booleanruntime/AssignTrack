const ASSIGNMENT_STATUSES = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue',
  // a student hands work in for marking; only then can a teacher grade it
  SUBMITTED: 'Submitted',
  // a teacher has marked it - the grade is now visible to the student
  GRADED: 'Graded'
};

module.exports = { ASSIGNMENT_STATUSES };