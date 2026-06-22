const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const NotificationService = require('../services/NotificationService');

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await NotificationService.listForUser(req.user._id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

router.put('/read-all', protect, async (req, res) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user._id);
    res.json({ modifiedCount: result.modifiedCount || result.nModified || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id, req.user._id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

module.exports = router;
