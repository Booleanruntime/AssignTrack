const Task = require('../models/Task');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');

const OVERDUE_ELIGIBLE_STATUSES = [
  ASSIGNMENT_STATUSES.NOT_STARTED,
  ASSIGNMENT_STATUSES.IN_PROGRESS,
  ASSIGNMENT_STATUSES.COMPLETED,
];

async function markOverdueTasks({ userId, now = new Date() } = {}) {
  const filter = {
    deadline: { $lt: now },
    status: { $in: OVERDUE_ELIGIBLE_STATUSES },
  };

  if (userId) {
    filter.user = userId;
  }

  return Task.updateMany(filter, { status: ASSIGNMENT_STATUSES.OVERDUE });
}

module.exports = { markOverdueTasks, OVERDUE_ELIGIBLE_STATUSES };
