const { expect } = require('chai');
const sinon = require('sinon');
const Task = require('../models/Task');
const ArchiveAssignmentCommand = require('../commands/ArchiveAssignmentCommand');
const RestoreAssignmentCommand = require('../commands/RestoreAssignmentCommand');

describe('Archive/Restore Assignment Commands (Command pattern)', () => {
  afterEach(() => sinon.restore());

  it('archives a student task by setting isArchived and archivedAt', async () => {
    const populate = sinon.stub().resolves({
      _id: 'task1',
      user: 'student1',
      isArchived: true,
      archivedAt: new Date(),
    });

    const findOneAndUpdate = sinon.stub(Task, 'findOneAndUpdate').returns({ populate });

    const command = new ArchiveAssignmentCommand('task1', 'student1');
    const result = await command.execute();

    expect(findOneAndUpdate.calledOnce).to.equal(true);
    expect(findOneAndUpdate.firstCall.args[0]).to.deep.equal({
      _id: 'task1',
      user: 'student1',
    });
    expect(findOneAndUpdate.firstCall.args[1].isArchived).to.equal(true);
    expect(findOneAndUpdate.firstCall.args[1].archivedAt).to.be.instanceOf(Date);
    expect(findOneAndUpdate.firstCall.args[2]).to.deep.equal({
      new: true,
      runValidators: true,
    });
    expect(populate.calledOnceWith('subject')).to.equal(true);
    expect(result.isArchived).to.equal(true);
  });

  it('restores an archived task by clearing archive fields', async () => {
    const populate = sinon.stub().resolves({
      _id: 'task1',
      user: 'student1',
      isArchived: false,
      archivedAt: null,
    });

    const findOneAndUpdate = sinon.stub(Task, 'findOneAndUpdate').returns({ populate });

    const command = new RestoreAssignmentCommand('task1', 'student1');
    const result = await command.execute();

    expect(findOneAndUpdate.calledOnce).to.equal(true);
    expect(findOneAndUpdate.firstCall.args[0]).to.deep.equal({
      _id: 'task1',
      user: 'student1',
    });
    expect(findOneAndUpdate.firstCall.args[1]).to.deep.equal({
      isArchived: false,
      archivedAt: null,
    });
    expect(findOneAndUpdate.firstCall.args[2]).to.deep.equal({
      new: true,
      runValidators: true,
    });
    expect(populate.calledOnceWith('subject')).to.equal(true);
    expect(result.isArchived).to.equal(false);
    expect(result.archivedAt).to.equal(null);
  });
});