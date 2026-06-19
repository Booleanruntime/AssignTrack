const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { UserFactory } = require('../factories/UserFactory');
const SubjectAccessProxy = require('../proxies/SubjectAccessProxy');


router.get('/test', (req, res) => {
  res.json({ message: 'Subject routes are working' });
});

router.get('/', protect, async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('teachers', 'name email role')
      .populate('students', 'name email role');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
});

// replaces the teacher list on a subject. no adminOnly here on purpose - the
// proxy does the access check so it isn't duplicated in two places.
router.put('/:id/teachers', protect, async (req, res) => {
  try {
    const account = UserFactory.create(req.user);
    const proxy = new SubjectAccessProxy(account);
    const subject = await proxy.setTeachers(req.params.id, req.body.teacherIds || []);
    res.json(subject);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Failed to assign teachers' });
  }
});

// replaces the enrolled student roster on a subject. proxy-guarded the same way.
router.put('/:id/students', protect, async (req, res) => {
  try {
    const account = UserFactory.create(req.user);
    const proxy = new SubjectAccessProxy(account);
    const subject = await proxy.setStudents(req.params.id, req.body.studentIds || []);
    res.json(subject);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Failed to enrol students' });
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