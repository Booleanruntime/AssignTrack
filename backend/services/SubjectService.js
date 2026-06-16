const Subject = require('../models/Subject');
const User = require('../models/User');

// the real worker the proxy stands in front of. does the actual assignment
// changes and doesn't care who's calling - that check lives in the proxy.
class SubjectService {
    async setTeachers(subjectId, teacherIds = []) {
        // make sure every id is actually a teacher, not a student or admin
        const teachers = await User.find({ _id: { $in: teacherIds }, role: 'teacher' });
        if (teachers.length !== teacherIds.length) {
            const err = new Error('One or more ids are not teacher accounts');
            err.status = 400;
            throw err;
        }

        const subject = await Subject.findByIdAndUpdate(
            subjectId,
            { teachers: teacherIds },
            { new: true, runValidators: true }
        ).populate('teachers', 'name email role');

        if (!subject) {
            const err = new Error('Subject not found');
            err.status = 404;
            throw err;
        }

        return subject;
    }

    async listTeachers(subjectId) {
        const subject = await Subject.findById(subjectId).populate('teachers', 'name email role');
        if (!subject) {
            const err = new Error('Subject not found');
            err.status = 404;
            throw err;
        }
        return subject.teachers;
    }
}

module.exports = SubjectService;
