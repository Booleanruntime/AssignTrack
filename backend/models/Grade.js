const mongoose = require('mongoose');

// a teacher's mark on a student's task. score is the raw 0-100, label is how it
// reads under the chosen scheme (e.g. "85%", "HD", "Pass"), and feedback is the
// structured object assembled by FeedbackBuilder.
const gradeSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    score: { type: Number, required: true, min: 0, max: 100 },
    scheme: {
      type: String,
      enum: ['percentage', 'letter', 'passfail'],
      default: 'percentage',
    },
    label: { type: String, required: true },
    passed: { type: Boolean, required: true },
    feedback: {
      summary: { type: String, default: '' },
      strengths: [{ type: String }],
      improvements: [{ type: String }],
      rubric: [{ criterion: String, score: Number, outOf: Number }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Grade', gradeSchema);
