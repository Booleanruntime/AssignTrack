const Task = require('../models/Task');

class ArchiveAssignmentCommand {
  constructor(taskId, userId) {
    this.taskId = taskId;
    this.userId = userId;
  }

  async execute() {
    return await Task.findOneAndUpdate(
      { _id: this.taskId, user: this.userId },
      {
        isArchived: true,
        archivedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('subject');
  }
}

module.exports = ArchiveAssignmentCommand;