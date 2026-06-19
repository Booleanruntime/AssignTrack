const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).populate('subject');;
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, deadline, status, subject, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      deadline,
      status,
      subject,
      priority,
      user: req.user._id,
    });
    const populatedTask = await task.populate('subject');
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save task' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, deadline, status, subject, priority } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, deadline, status, subject, priority },
      { new: true, runValidators: true }
    ).populate('subject');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

module.exports = router;