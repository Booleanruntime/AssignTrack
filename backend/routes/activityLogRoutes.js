const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ActivityLogService = require('../services/ActivityLogService');

router.get('/', protect, async (req, res) => {
  try {
    const logs = await ActivityLogService.listActivities({ user: req.user });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity logs' });
  }
});

module.exports = router;
