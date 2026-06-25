const Task = require('../models/Task');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');
const eventBus = require('../events/appEventBus');

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

  const overdueTasks = await Task.find(filter).select('_id user title subject assignment deadline');
  if (!overdueTasks.length) {
    return { matchedCount: 0, modifiedCount: 0, notifiedCount: 0 };
  }

  const result = await Task.updateMany(
    { _id: { $in: overdueTasks.map((task) => task._id) } },
    { status: ASSIGNMENT_STATUSES.OVERDUE }
  );

  await eventBus.emit('task.overdue', { tasks: overdueTasks });

  return { ...result, notifiedCount: overdueTasks.length };
}

module.exports = { markOverdueTasks, OVERDUE_ELIGIBLE_STATUSES };
