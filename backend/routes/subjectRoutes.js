const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect, adminOnly } = require('../middleware/authMiddleware');


router.get('/test', (req, res) => {
  res.json({ message: 'Subject routes are working' });
});

router.get('/', protect, async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
});


router.post('/', protect,adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;

    const subject = await Subject.create({
      name,
      description,
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save subject' });
  }
});


router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { description } = req.body;

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id },
      { description },
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subject' });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete subject' });
  }
});

module.exports = router;