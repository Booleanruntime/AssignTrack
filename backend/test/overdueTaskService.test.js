const { expect } = require('chai');
const sinon = require('sinon');
const Task = require('../models/Task');
const {
  markOverdueTasks,
  OVERDUE_ELIGIBLE_STATUSES,
} = require('../services/OverdueTaskService');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');
const eventBus = require('../events/appEventBus');

describe('OverdueTaskService', () => {
  afterEach(() => sinon.restore());

  it('marks only deadline-passed active tasks as overdue', async () => {
    const now = new Date('2026-06-21T10:00:00.000Z');
    const overdueTasks = [
      {
        _id: 'task1',
        user: 'student1',
        title: 'Essay',
        subject: 'subject1',
        assignment: 'assignment1',
        deadline: now,
      },
      {
        _id: 'task2',
        user: 'student2',
        title: 'Report',
        subject: 'subject1',
        assignment: 'assignment1',
        deadline: now,
      },
    ];
    const select = sinon.stub().resolves(overdueTasks);
    const find = sinon.stub(Task, 'find').returns({ select });
    const updateMany = sinon.stub(Task, 'updateMany').resolves({ modifiedCount: 3 });
    const emit = sinon.stub(eventBus, 'emit').resolves([]);

    const result = await markOverdueTasks({ now });

    expect(result.modifiedCount).to.equal(3);
    expect(result.notifiedCount).to.equal(2);
    expect(find.calledOnce).to.equal(true);
    expect(find.firstCall.args[0]).to.deep.equal({
      deadline: { $lt: now },
      status: { $in: OVERDUE_ELIGIBLE_STATUSES },
    });
    expect(select.calledOnceWith('_id user title subject assignment deadline')).to.equal(true);
    expect(updateMany.calledOnce).to.equal(true);
    expect(updateMany.firstCall.args[0]).to.deep.equal({
      _id: { $in: ['task1', 'task2'] },
    });
    expect(updateMany.firstCall.args[1]).to.deep.equal({
      status: ASSIGNMENT_STATUSES.OVERDUE,
    });
    expect(emit.calledOnce).to.equal(true);
    expect(emit.firstCall.args[0]).to.equal('task.overdue');
    expect(emit.firstCall.args[1]).to.deep.equal({ tasks: overdueTasks });
  });

  it('preserves terminal submitted and graded states', async () => {
    const select = sinon.stub().resolves([]);
    const find = sinon.stub(Task, 'find').returns({ select });
    sinon.stub(Task, 'updateMany').resolves({ modifiedCount: 0 });
    sinon.stub(eventBus, 'emit').resolves([]);

    await markOverdueTasks();

    const statusFilter = find.firstCall.args[0].status.$in;
    expect(statusFilter).to.include(ASSIGNMENT_STATUSES.NOT_STARTED);
    expect(statusFilter).to.include(ASSIGNMENT_STATUSES.IN_PROGRESS);
    expect(statusFilter).to.include(ASSIGNMENT_STATUSES.COMPLETED);
    expect(statusFilter).to.not.include(ASSIGNMENT_STATUSES.SUBMITTED);
    expect(statusFilter).to.not.include(ASSIGNMENT_STATUSES.GRADED);
    expect(Task.updateMany.called).to.equal(false);
    expect(eventBus.emit.called).to.equal(false);
  });

  it('can scope overdue detection to one student', async () => {
    const userId = 'student-1';
    const select = sinon.stub().resolves([]);
    sinon.stub(Task, 'find').returns({ select });
    sinon.stub(Task, 'updateMany').resolves({ modifiedCount: 1 });

    await markOverdueTasks({ userId });

    expect(Task.find.firstCall.args[0].user).to.equal(userId);
  });

  it('does nothing when no tasks need to transition', async () => {
    const select = sinon.stub().resolves([]);
    sinon.stub(Task, 'find').returns({ select });
    const updateMany = sinon.stub(Task, 'updateMany');
    const emit = sinon.stub(eventBus, 'emit');

    const result = await markOverdueTasks();

    expect(result).to.deep.equal({ matchedCount: 0, modifiedCount: 0, notifiedCount: 0 });
    expect(updateMany.called).to.equal(false);
    expect(emit.called).to.equal(false);
  });
});
