const { expect } = require('chai');
const sinon = require('sinon');
const Task = require('../models/Task');
const {
  markOverdueTasks,
  OVERDUE_ELIGIBLE_STATUSES,
} = require('../services/OverdueTaskService');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');

describe('OverdueTaskService', () => {
  afterEach(() => sinon.restore());

  it('marks only deadline-passed active tasks as overdue', async () => {
    const now = new Date('2026-06-21T10:00:00.000Z');
    const updateMany = sinon.stub(Task, 'updateMany').resolves({ modifiedCount: 3 });

    const result = await markOverdueTasks({ now });

    expect(result.modifiedCount).to.equal(3);
    expect(updateMany.calledOnce).to.equal(true);
    expect(updateMany.firstCall.args[0]).to.deep.equal({
      deadline: { $lt: now },
      status: { $in: OVERDUE_ELIGIBLE_STATUSES },
    });
    expect(updateMany.firstCall.args[1]).to.deep.equal({
      status: ASSIGNMENT_STATUSES.OVERDUE,
    });
  });

  it('preserves terminal submitted and graded states', async () => {
    sinon.stub(Task, 'updateMany').resolves({ modifiedCount: 0 });

    await markOverdueTasks();

    const statusFilter = Task.updateMany.firstCall.args[0].status.$in;
    expect(statusFilter).to.include(ASSIGNMENT_STATUSES.NOT_STARTED);
    expect(statusFilter).to.include(ASSIGNMENT_STATUSES.IN_PROGRESS);
    expect(statusFilter).to.include(ASSIGNMENT_STATUSES.COMPLETED);
    expect(statusFilter).to.not.include(ASSIGNMENT_STATUSES.SUBMITTED);
    expect(statusFilter).to.not.include(ASSIGNMENT_STATUSES.GRADED);
  });

  it('can scope overdue detection to one student', async () => {
    const userId = 'student-1';
    sinon.stub(Task, 'updateMany').resolves({ modifiedCount: 1 });

    await markOverdueTasks({ userId });

    expect(Task.updateMany.firstCall.args[0].user).to.equal(userId);
  });
});
