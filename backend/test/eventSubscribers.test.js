const { expect } = require('chai');
const sinon = require('sinon');
const EventBus = require('../events/EventBus');
const registerSubscribers = require('../events/registerSubscribers');
const NotificationService = require('../services/NotificationService');
const ActivityLogService = require('../services/ActivityLogService');

describe('Event subscribers (Observer pattern)', () => {
  afterEach(() => sinon.restore());

  it('creates assignment notifications when an assignment.created event is emitted', async () => {
    const bus = new EventBus();
    const createMany = sinon.stub(NotificationService, 'createMany').resolves([]);
    registerSubscribers(bus);

    await bus.emit('assignment.created', {
      assignment: { _id: 'assignment1', title: 'Essay', deadline: '2026-08-01' },
      subject: { _id: 'subject1' },
      tasks: [
        { _id: 'task1', user: 'student1' },
        { _id: 'task2', user: 'student2' },
      ],
    });

    expect(createMany.calledOnce).to.equal(true);
    expect(createMany.firstCall.args[0]).to.deep.equal([
      {
        recipient: 'student1',
        type: 'assignment.created',
        title: 'New assignment',
        message: '"Essay" has been assigned.',
        assignment: 'assignment1',
        task: 'task1',
        metadata: { subject: 'subject1', deadline: '2026-08-01' },
      },
      {
        recipient: 'student2',
        type: 'assignment.created',
        title: 'New assignment',
        message: '"Essay" has been assigned.',
        assignment: 'assignment1',
        task: 'task2',
        metadata: { subject: 'subject1', deadline: '2026-08-01' },
      },
    ]);
  });

  it('creates a grade notification when a grade.created event is emitted', async () => {
    const bus = new EventBus();
    const createNotification = sinon.stub(NotificationService, 'createNotification').resolves({});
    registerSubscribers(bus);

    await bus.emit('grade.created', {
      grade: { _id: 'grade1' },
      task: { _id: 'task1', user: 'student1', subject: 'subject1' },
      label: '80%',
      score: 80,
    });

    expect(createNotification.calledOnce).to.equal(true);
    expect(createNotification.firstCall.args[0]).to.deep.equal({
      recipient: 'student1',
      type: 'grade.created',
      title: 'Grade posted',
      message: 'Your assignment has been graded: 80%',
      task: 'task1',
      grade: 'grade1',
      metadata: { subject: 'subject1', score: 80, label: '80%' },
    });
  });

  it('creates overdue notifications when a task.overdue event is emitted', async () => {
    const bus = new EventBus();
    const createMany = sinon.stub(NotificationService, 'createMany').resolves([]);
    registerSubscribers(bus);

    await bus.emit('task.overdue', {
      tasks: [
        {
          _id: 'task1',
          user: 'student1',
          title: 'Report',
          assignment: 'assignment1',
          subject: 'subject1',
          deadline: '2026-06-01',
        },
      ],
    });

    expect(createMany.calledOnce).to.equal(true);
    expect(createMany.firstCall.args[0][0]).to.deep.equal({
      recipient: 'student1',
      type: 'task.overdue',
      title: 'Assignment overdue',
      message: '"Report" is now overdue.',
      task: 'task1',
      assignment: 'assignment1',
      metadata: { subject: 'subject1', deadline: '2026-06-01' },
    });
  });

  it('records activity when an activity.recorded event is emitted', async () => {
    const bus = new EventBus();
    const recordActivity = sinon.stub(ActivityLogService, 'recordActivity').resolves({});
    registerSubscribers(bus);
    const activity = {
      actor: 'teacher1',
      action: 'assignment.created',
      entityType: 'Assignment',
      entityId: 'assignment1',
      message: 'Teacher created assignment',
      metadata: { subject: 'subject1' },
    };

    await bus.emit('activity.recorded', activity);

    expect(recordActivity.calledOnceWith(activity)).to.equal(true);
  });

  it('returns a function that unsubscribes all registered subscribers', async () => {
    const bus = new EventBus();
    const createMany = sinon.stub(NotificationService, 'createMany').resolves([]);
    const unsubscribe = registerSubscribers(bus);

    unsubscribe();
    await bus.emit('assignment.created', {
      assignment: { _id: 'assignment1', title: 'Essay' },
      tasks: [{ _id: 'task1', user: 'student1' }],
    });

    expect(createMany.called).to.equal(false);
  });
});
