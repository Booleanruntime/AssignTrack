const registerNotificationSubscriber = require('./subscribers/NotificationSubscriber');
const registerActivityLogSubscriber = require('./subscribers/ActivityLogSubscriber');

function registerSubscribers(eventBus) {
  const unsubscribers = [
    registerNotificationSubscriber(eventBus),
    registerActivityLogSubscriber(eventBus),
  ];

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

module.exports = registerSubscribers;
