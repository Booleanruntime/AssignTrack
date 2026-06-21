const { expect } = require('chai');
const mongoose = require('mongoose');
const sinon = require('sinon');
const ActivityLog = require('../models/ActivityLog');
const ActivityLogService = require('../services/ActivityLogService');

describe('ActivityLogService', () => {
  afterEach(() => sinon.restore());

  it('requires actor, action, entityType, entityId and message', () => {
    const log = new ActivityLog({});

    const error = log.validateSync();

    expect(error.errors.actor).to.exist;
    expect(error.errors.action).to.exist;
    expect(error.errors.entityType).to.exist;
    expect(error.errors.entityId).to.exist;
    expect(error.errors.message).to.exist;
  });

  it('accepts a valid activity log entry', () => {
    const log = new ActivityLog({
      actor: new mongoose.Types.ObjectId(),
      action: 'assignment.created',
      entityType: 'Assignment',
      entityId: new mongoose.Types.ObjectId(),
      message: 'Created assignment "Design Patterns Essay"',
      metadata: { assignedTo: 2 },
    });

    const error = log.validateSync();

    expect(error).to.equal(undefined);
  });

  it('records activity through one central service method', async () => {
    const actor = new mongoose.Types.ObjectId();
    const entityId = new mongoose.Types.ObjectId();
    const create = sinon.stub(ActivityLog, 'create').resolves({ _id: 'log1' });

    const result = await ActivityLogService.recordActivity({
      actor,
      action: 'task.submitted',
      entityType: 'Task',
      entityId,
      message: 'Submitted assignment for grading',
      metadata: { status: 'Submitted' },
    });

    expect(result).to.deep.equal({ _id: 'log1' });
    expect(create.calledOnce).to.equal(true);
    expect(create.firstCall.args[0]).to.deep.equal({
      actor,
      action: 'task.submitted',
      entityType: 'Task',
      entityId,
      message: 'Submitted assignment for grading',
      metadata: { status: 'Submitted' },
    });
  });

  it('defaults metadata to an empty object', async () => {
    sinon.stub(ActivityLog, 'create').resolves({ _id: 'log2' });

    await ActivityLogService.recordActivity({
      actor: new mongoose.Types.ObjectId(),
      action: 'grade.created',
      entityType: 'Grade',
      entityId: new mongoose.Types.ObjectId(),
      message: 'Graded assignment',
    });

    expect(ActivityLog.create.firstCall.args[0].metadata).to.deep.equal({});
  });

  it('lists every activity for admins', async () => {
    const limit = sinon.stub().resolves([{ _id: 'log1' }]);
    const sort = sinon.stub().returns({ limit });
    const populate = sinon.stub().returns({ sort });
    const find = sinon.stub(ActivityLog, 'find').returns({ populate });

    const logs = await ActivityLogService.listActivities({
      user: { _id: 'admin1', role: 'admin' },
    });

    expect(logs).to.deep.equal([{ _id: 'log1' }]);
    expect(find.calledOnceWith({})).to.equal(true);
    expect(populate.calledOnceWith('actor', 'name email role')).to.equal(true);
    expect(sort.calledOnceWith({ createdAt: -1 })).to.equal(true);
    expect(limit.calledOnceWith(100)).to.equal(true);
  });

  it('scopes activity to the current actor for non-admins', async () => {
    const limit = sinon.stub().resolves([]);
    const sort = sinon.stub().returns({ limit });
    const populate = sinon.stub().returns({ sort });
    const find = sinon.stub(ActivityLog, 'find').returns({ populate });

    await ActivityLogService.listActivities({
      user: { _id: 'student1', role: 'student' },
    });

    expect(find.calledOnceWith({ actor: 'student1' })).to.equal(true);
  });
});
