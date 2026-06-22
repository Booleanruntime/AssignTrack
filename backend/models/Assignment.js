const mongoose = require('mongoose');

// a teacher-authored piece of work for a subject. this is the template/definition
// - the actual thing each student works on is a Task instance that points back
// here (see Task.assignment). creating an Assignment fans out one Task per
// student enrolled in the subject.
const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    assignmentType: {
      type: String,
      enum: ['standard', 'quiz', 'presentation'],
      default: 'standard',
    },
    assignmentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
