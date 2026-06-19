const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true

    },
    description: {
        type: String,
        trim: true

    },
    // teachers an admin has assigned to run this subject
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    // students an admin has enrolled in this subject. enrolled students receive
    // every assignment a teacher sets on the subject.
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Subject', subjectSchema);