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
    assignmentType: {
      type: String,
      enum: ['standard', 'quiz', 'presentation'],
      default: 'standard',
    },

    assignmentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low'
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },                                      
    // the teacher-authored assignment this instance was fanned out from. legacy
    // tasks created before the teacher-authored model won't have one.
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);