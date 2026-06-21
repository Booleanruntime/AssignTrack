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
}

module.exports = ActivityLogService;
