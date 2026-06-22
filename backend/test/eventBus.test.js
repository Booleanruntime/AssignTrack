const { expect } = require('chai');
const sinon = require('sinon');
const EventBus = require('../events/EventBus');

describe('EventBus (Observer pattern)', () => {
  it('notifies every subscriber for an emitted event', async () => {
    const bus = new EventBus();
    const first = sinon.stub().resolves();
    const second = sinon.stub().resolves();
    const payload = { assignmentId: 'a1' };

    bus.subscribe('assignment.created', first);
    bus.subscribe('assignment.created', second);

    await bus.emit('assignment.created', payload);

    expect(first.calledOnceWith(payload)).to.equal(true);
    expect(second.calledOnceWith(payload)).to.equal(true);
  });

  it('does not notify subscribers for other events', async () => {
    const bus = new EventBus();
    const handler = sinon.stub().resolves();

    bus.subscribe('grade.created', handler);

    await bus.emit('assignment.created', {});

    expect(handler.called).to.equal(false);
  });

  it('returns an unsubscribe function from subscribe', async () => {
    const bus = new EventBus();
    const handler = sinon.stub().resolves();

    const unsubscribe = bus.subscribe('task.overdue', handler);
    expect(bus.subscriberCount('task.overdue')).to.equal(1);

    unsubscribe();
    await bus.emit('task.overdue', {});

    expect(bus.subscriberCount('task.overdue')).to.equal(0);
    expect(handler.called).to.equal(false);
  });

  it('waits for async subscribers to finish', async () => {
    const bus = new EventBus();
    const calls = [];

    bus.subscribe('grade.created', async () => {
      calls.push('subscriber');
    });

    await bus.emit('grade.created');

    expect(calls).to.deep.equal(['subscriber']);
  });

  it('keeps subscriber storage encapsulated', () => {
    const bus = new EventBus();

    expect(bus.subscribers).to.equal(undefined);
    expect(bus._subscribers).to.equal(undefined);
  });
});
