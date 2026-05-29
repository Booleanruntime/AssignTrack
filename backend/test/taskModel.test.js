const { expect } = require('chai');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');

describe('AssignTrack Task model tests', () => {
  it('should require title, description, deadline, user and subject fields', () => {
    const task = new Task({});

    const error = task.validateSync();

    expect(error.errors.title).to.exist;
    expect(error.errors.description).to.exist;
    expect(error.errors.deadline).to.exist;
    expect(error.errors.user).to.exist;
    expect(error.errors.subject).to.exist;
  });

  it('should accept a valid assignment task object', () => {
    const task = new Task({
      title: 'Assignment 1 Report',
      description: 'Complete IFQ636 report',
      deadline: new Date('2026-05-31'),
      user: new mongoose.Types.ObjectId(),
      subject: new mongoose.Types.ObjectId(),
      status: ASSIGNMENT_STATUSES.NOT_STARTED
    });

    const error = task.validateSync();

    expect(error).to.equal(undefined);
  });

  it('should reject an invalid assignment status', () => {
    const task = new Task({
      title: 'Assignment 1 Report',
      description: 'Complete IFQ636 report',
      deadline: new Date('2026-05-31'),
      user: new mongoose.Types.ObjectId(),
      subject: new mongoose.Types.ObjectId(),
      status: 'Almost Finished'
    });

    const error = task.validateSync();

    expect(error.errors.status).to.exist;
  });
});