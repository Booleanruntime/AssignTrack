const Task = require('../models/Task');

class RestoreAssignmentCommand {
  constructor(taskId, userId) {
    this.taskId = taskId;
    this.userId = userId;
  }

  async execute() {
    return await Task.findOneAndUpdate(
      { _id: this.taskId, user: this.userId },
      {
        isArchived: false,
        archivedAt: null,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('subject');
  }
}

module.exports = RestoreAssignmentCommand;