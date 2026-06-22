const ActivityLogService = require('../../services/ActivityLogService');

function registerActivityLogSubscriber(eventBus) {
  return eventBus.subscribe('activity.recorded', async (activity) => {
    await ActivityLogService.recordActivity(activity);
  });
}

module.exports = registerActivityLogSubscriber;
