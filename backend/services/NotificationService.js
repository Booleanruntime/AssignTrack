const Notification = require('../models/Notification');

class NotificationService {
  static async createNotification({
    recipient,
    type,
    title,
    message,
    task,
    assignment,
    grade,
    metadata = {},
  }) {
    return Notification.create({
      recipient,
      type,
      title,
      message,
      task,
      assignment,
      grade,
      metadata,
    });
  }

  static async createMany(notifications = []) {
    if (!notifications.length) return [];
    return Notification.insertMany(notifications);
  }

  static async listForUser(userId) {
    return Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(100);
  }

  static async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true, runValidators: true }
    );
  }

  static async markAllAsRead(userId) {
    return Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }
}

module.exports = NotificationService;
