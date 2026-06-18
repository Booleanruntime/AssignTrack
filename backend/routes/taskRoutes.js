const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Subject = require('../models/Subject');
const { protect } = require('../middleware/authMiddleware');
const { UserFactory } = require('../factories/UserFactory');
const { getAssignmentState } = require('../states/AssignmentState');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');

router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).populate('subject');;
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// tasks a teacher is allowed to grade - everything under the subjects they've
// been assigned to. uses the teacher list added in the assign-teachers feature.
router.get('/gradeable', protect, async (req, res) => {
  try {
    const account = UserFactory.create(req.user);
    if (!account.canGrade()) {
      return res.status(403).json({ message: 'Only teachers can view gradeable tasks' });
    }

    const subjects = await Subject.find({ teachers: req.user._id }).select('_id');
    // only surface work that's actually been handed in - anything still in
    // progress or already graded shouldn't show up as gradeable
    const tasks = await Task.find({
      subject: { $in: subjects.map((s) => s._id) },
      status: ASSIGNMENT_STATUSES.SUBMITTED,
    })
      .populate('subject', 'name')
      .populate('user', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch gradeable tasks' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, deadline, status, subject } = req.body;

    const task = await Task.create({
      title,
      description,
      deadline,
      status,
      subject,
      user: req.user._id,
    });
    const populatedTask = await task.populate('subject');
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save task' });
  }
});

// a student hands their own assignment in for marking. the current state decides
// whether that's allowed - you can't re-submit something already submitted or graded.
router.put('/:id/submit', protect, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!getAssignmentState(task.status).canSubmit()) {
      return res.status(400).json({ message: `Assignment can't be submitted from "${task.status}"` });
    }

    task.status = ASSIGNMENT_STATUSES.SUBMITTED;
    const saved = await task.save();
    const populated = await saved.populate('subject');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit assignment' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, deadline, status, subject } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, deadline, status, subject },
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