const Assignment = require('../models/Assignment');
const Task = require('../models/Task');
const Subject = require('../models/Subject');
const Logger = require('../utils/Logger');
const { UserFactory } = require('../factories/UserFactory');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');
const NotificationService = require('../services/NotificationService');

const logger = Logger.getInstance();

// builds the per-student Task instances for an assignment from a subject's
// enrolled roster. each instance starts at Not Started and copies the
// assignment's details so the existing student views keep working unchanged.
function instancesFor(assignment, subject) {
    return (subject.students || []).map((studentId) => ({
        title: assignment.title,
        description: assignment.description,
        deadline: assignment.deadline,
        subject: subject._id,
        user: studentId,
        status: ASSIGNMENT_STATUSES.NOT_STARTED,
        assignment: assignment._id,
    }));
}

// only a teacher assigned to the subject may author work on it
function teaches(subject, userId) {
    return (subject.teachers || []).some((t) => String(t) === String(userId));
}

const createAssignment = async (req, res) => {
    try {
        const account = UserFactory.create(req.user);
        if (!account.canGrade()) {
            return res.status(403).json({ message: 'Only teachers can create assignments' });
        }

        const { title, description, deadline, subject: subjectId } = req.body;
        const subject = await Subject.findById(subjectId);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        if (!teaches(subject, req.user._id)) {
            return res.status(403).json({ message: 'You can only set work on subjects you teach' });
        }

        const assignment = await Assignment.create({
            title,
            description,
            deadline,
            subject: subject._id,
            teacher: req.user._id,
        });

        // fan out to everyone enrolled in the subject
        const instances = instancesFor(assignment, subject);
        const insertedTasks = instances.length ? await Task.insertMany(instances) : [];
        if (insertedTasks.length) {
            await NotificationService.createMany(insertedTasks.map((task) => ({
                recipient: task.user,
                type: 'assignment.created',
                title: 'New assignment',
                message: `"${assignment.title}" has been assigned.`,
                assignment: assignment._id,
                task: task._id,
                metadata: {
                    subject: subject._id,
                    deadline: assignment.deadline,
                },
            })));
        }

        logger.info(`${req.user.email} created assignment "${title}" → ${instances.length} student(s)`);
        res.status(201).json({ ...assignment.toObject(), assignedTo: instances.length });
    } catch (error) {
        logger.error(`Create assignment failed: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// a teacher's authored assignments, each with a small breakdown of how the
// student instances are tracking (submitted / graded / total).
const getAssignments = async (req, res) => {
    try {
        const account = UserFactory.create(req.user);
        if (!account.canGrade()) {
            return res.status(403).json({ message: 'Only teachers can view authored assignments' });
        }

        const assignments = await Assignment.find({ teacher: req.user._id })
            .populate('subject', 'name')
            .sort({ createdAt: -1 });

        // one grouped count query instead of a query per assignment
        const counts = await Task.aggregate([
            { $match: { assignment: { $in: assignments.map((a) => a._id) } } },
            { $group: { _id: { assignment: '$assignment', status: '$status' }, n: { $sum: 1 } } },
        ]);

        const byAssignment = {};
        counts.forEach(({ _id, n }) => {
            const key = String(_id.assignment);
            byAssignment[key] = byAssignment[key] || { total: 0, submitted: 0, graded: 0 };
            byAssignment[key].total += n;
            if (_id.status === ASSIGNMENT_STATUSES.SUBMITTED) byAssignment[key].submitted += n;
            if (_id.status === ASSIGNMENT_STATUSES.GRADED) byAssignment[key].graded += n;
        });

        const withCounts = assignments.map((a) => ({
            ...a.toObject(),
            counts: byAssignment[String(a._id)] || { total: 0, submitted: 0, graded: 0 },
        }));
        res.json(withCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// editing the template pushes the changed details down to every instance, but
// leaves each student's status and grade alone.
const updateAssignment = async (req, res) => {
    try {
        const account = UserFactory.create(req.user);
        if (!account.canGrade()) {
            return res.status(403).json({ message: 'Only teachers can edit assignments' });
        }

        const assignment = await Assignment.findOne({ _id: req.params.id, teacher: req.user._id });
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        const { title, description, deadline } = req.body;
        if (title !== undefined) assignment.title = title;
        if (description !== undefined) assignment.description = description;
        if (deadline !== undefined) assignment.deadline = deadline;
        const saved = await assignment.save();

        await Task.updateMany(
            { assignment: assignment._id },
            { title: saved.title, description: saved.description, deadline: saved.deadline }
        );

        logger.info(`${req.user.email} edited assignment ${assignment._id} (propagated to instances)`);
        res.json(saved);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// removing the assignment also removes the student instances it spawned
const deleteAssignment = async (req, res) => {
    try {
        const account = UserFactory.create(req.user);
        if (!account.canGrade()) {
            return res.status(403).json({ message: 'Only teachers can delete assignments' });
        }

        const assignment = await Assignment.findOne({ _id: req.params.id, teacher: req.user._id });
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        await Task.deleteMany({ assignment: assignment._id });
        await assignment.deleteOne();

        logger.info(`${req.user.email} deleted assignment ${assignment._id} and its instances`);
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createAssignment, getAssignments, updateAssignment, deleteAssignment, instancesFor };
