const ActivityLog = require('../models/ActivityLog');

class ActivityLogService {
  static async recordActivity({
    actor,
    action,
    entityType,
    entityId,
    message,
    metadata = {},
  }) {
    return ActivityLog.create({
      actor,
      action,
      entityType,
      entityId,
      message,
      metadata,
    });
  }

  static async listActivities({ user } = {}) {
    const filter = user?.role === 'admin' ? {} : { actor: user?._id };

    return ActivityLog.find(filter)
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);
  }
}

module.exports = ActivityLogService;
