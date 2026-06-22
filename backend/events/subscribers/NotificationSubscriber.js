const NotificationService = require('../../services/NotificationService');

function registerNotificationSubscriber(eventBus) {
  const unsubscribers = [];

  unsubscribers.push(eventBus.subscribe('assignment.created', async ({ assignment, tasks = [], subject }) => {
    await NotificationService.createMany(tasks.map((task) => ({
      recipient: task.user,
      type: 'assignment.created',
      title: 'New assignment',
      message: `"${assignment.title}" has been assigned.`,
      assignment: assignment._id,
      task: task._id,
      metadata: {
        subject: subject?._id || subject,
        deadline: assignment.deadline,
      },
    })));
  }));

  unsubscribers.push(eventBus.subscribe('grade.created', async ({ grade, task, label, score }) => {
    await NotificationService.createNotification({
      recipient: task.user,
      type: 'grade.created',
      title: 'Grade posted',
      message: `Your assignment has been graded: ${label}`,
      task: task._id,
      grade: grade._id,
      metadata: {
        subject: task.subject,
        score,
        label,
      },
    });
  }));

  unsubscribers.push(eventBus.subscribe('task.overdue', async ({ tasks = [] }) => {
    await NotificationService.createMany(tasks.map((task) => ({
      recipient: task.user,
      type: 'task.overdue',
      title: 'Assignment overdue',
      message: `"${task.title}" is now overdue.`,
      task: task._id,
      assignment: task.assignment,
      metadata: {
        subject: task.subject,
        deadline: task.deadline,
      },
    })));
  }));

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

module.exports = registerNotificationSubscriber;
