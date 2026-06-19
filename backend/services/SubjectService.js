const Subject = require('../models/Subject');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Task = require('../models/Task');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');

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

    // sets the enrolled roster for a subject. as the roster changes we keep each
    // student's assignment instances in step: newly-enrolled students are
    // backfilled with the subject's existing assignments, and students who are
    // dropped lose their instances - except graded ones, which we keep so the
    // record of work already marked isn't lost.
    async setStudents(subjectId, studentIds = []) {
        const students = await User.find({ _id: { $in: studentIds }, role: 'student' });
        if (students.length !== studentIds.length) {
            const err = new Error('One or more ids are not student accounts');
            err.status = 400;
            throw err;
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            const err = new Error('Subject not found');
            err.status = 404;
            throw err;
        }

        const before = (subject.students || []).map(String);
        const after = studentIds.map(String);
        const added = after.filter((id) => !before.includes(id));
        const removed = before.filter((id) => !after.includes(id));

        subject.students = studentIds;
        await subject.save();

        const assignments = await Assignment.find({ subject: subject._id });

        // backfill: give each newly-enrolled student an instance of every
        // assignment already set on the subject
        if (added.length && assignments.length) {
            const instances = [];
            added.forEach((studentId) => {
                assignments.forEach((a) => {
                    instances.push({
                        title: a.title,
                        description: a.description,
                        deadline: a.deadline,
                        subject: subject._id,
                        user: studentId,
                        status: ASSIGNMENT_STATUSES.NOT_STARTED,
                        assignment: a._id,
                    });
                });
            });
            if (instances.length) await Task.insertMany(instances);
        }

        // cleanup: drop dropped students' instances for this subject, keeping
        // anything already graded
        if (removed.length) {
            await Task.deleteMany({
                subject: subject._id,
                user: { $in: removed },
                assignment: { $ne: null },
                status: { $ne: ASSIGNMENT_STATUSES.GRADED },
            });
        }

        return Subject.findById(subject._id).populate('students', 'name email role');
    }

    async listStudents(subjectId) {
        const subject = await Subject.findById(subjectId).populate('students', 'name email role');
        if (!subject) {
            const err = new Error('Subject not found');
            err.status = 404;
            throw err;
        }
        return subject.students;
    }
}

module.exports = SubjectService;
