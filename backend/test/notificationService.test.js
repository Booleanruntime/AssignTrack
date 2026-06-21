const { expect } = require('chai');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Notification = require('../models/Notification');
const NotificationService = require('../services/NotificationService');

describe('NotificationService', () => {
  afterEach(() => sinon.restore());

  it('requires recipient, type, title and message', () => {
    const notification = new Notification({});

    const error = notification.validateSync();

    expect(error.errors.recipient).to.exist;
    expect(error.errors.type).to.exist;
    expect(error.errors.title).to.exist;
    expect(error.errors.message).to.exist;
  });

  it('accepts a valid notification and defaults unread', () => {
    const notification = new Notification({
      recipient: new mongoose.Types.ObjectId(),
      type: 'assignment.created',
      title: 'New assignment',
      message: 'Design Patterns Essay has been assigned.',
      assignment: new mongoose.Types.ObjectId(),
      metadata: { subjectName: 'Software Engineering' },
    });

    const error = notification.validateSync();

    expect(error).to.equal(undefined);
    expect(notification.isRead).to.equal(false);
  });

  it('creates a single notification through the service', async () => {
    const recipient = new mongoose.Types.ObjectId();
    const assignment = new mongoose.Types.ObjectId();
    const create = sinon.stub(Notification, 'create').resolves({ _id: 'notification1' });

    const result = await NotificationService.createNotification({
      recipient,
      type: 'assignment.created',
      title: 'New assignment',
      message: 'Design Patterns Essay has been assigned.',
      assignment,
      metadata: { subjectName: 'Software Engineering' },
    });

    expect(result).to.deep.equal({ _id: 'notification1' });
    expect(create.calledOnce).to.equal(true);
    expect(create.firstCall.args[0]).to.deep.equal({
      recipient,
      type: 'assignment.created',
      title: 'New assignment',
      message: 'Design Patterns Essay has been assigned.',
      assignment,
      task: undefined,
      grade: undefined,
      metadata: { subjectName: 'Software Engineering' },
    });
  });

  it('creates many notifications and short-circuits empty batches', async () => {
    const insertMany = sinon.stub(Notification, 'insertMany').resolves([{ _id: 'n1' }]);

    const empty = await NotificationService.createMany([]);
    const created = await NotificationService.createMany([
      {
        recipient: new mongoose.Types.ObjectId(),
        type: 'grade.created',
        title: 'Grade posted',
        message: 'Your assignment has been graded.',
      },
    ]);

    expect(empty).to.deep.equal([]);
    expect(created).to.deep.equal([{ _id: 'n1' }]);
    expect(insertMany.calledOnce).to.equal(true);
  });

  it('lists notifications for one user', async () => {
    const limit = sinon.stub().resolves([{ _id: 'n1' }]);
    const sort = sinon.stub().returns({ limit });
    const find = sinon.stub(Notification, 'find').returns({ sort });

    const notifications = await NotificationService.listForUser('user1');

    expect(notifications).to.deep.equal([{ _id: 'n1' }]);
    expect(find.calledOnceWith({ recipient: 'user1' })).to.equal(true);
    expect(sort.calledOnceWith({ createdAt: -1 })).to.equal(true);
    expect(limit.calledOnceWith(100)).to.equal(true);
  });

  it('marks one notification as read for its recipient', async () => {
    const update = sinon.stub(Notification, 'findOneAndUpdate').resolves({ _id: 'n1', isRead: true });

    const result = await NotificationService.markAsRead('n1', 'user1');

    expect(result).to.deep.equal({ _id: 'n1', isRead: true });
    expect(update.calledOnceWith(
      { _id: 'n1', recipient: 'user1' },
      { isRead: true },
      { new: true, runValidators: true }
    )).to.equal(true);
  });

  it('marks all unread notifications as read for one user', async () => {
    const updateMany = sinon.stub(Notification, 'updateMany').resolves({ modifiedCount: 3 });

    const result = await NotificationService.markAllAsRead('user1');

    expect(result.modifiedCount).to.equal(3);
    expect(updateMany.calledOnceWith(
      { recipient: 'user1', isRead: false },
      { isRead: true }
    )).to.equal(true);
  });
});
