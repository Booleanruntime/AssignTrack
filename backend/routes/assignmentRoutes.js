const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createAssignment);
router.get('/', protect, getAssignments);
router.put('/:id', protect, updateAssignment);
router.delete('/:id', protect, deleteAssignment);

module.exports = router;
