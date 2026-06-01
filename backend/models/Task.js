const mongoose = require('mongoose');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');

const taskSchema = new mongoose.Schema(
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type:mongoose.Schema.Types.ObjectId,
      ref:'Subject',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ASSIGNMENT_STATUSES),
      default: ASSIGNMENT_STATUSES.NOT_STARTED,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);