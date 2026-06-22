const Assignment = require('../models/Assignment');
const Task = require('../models/Task');
const Subject = require('../models/Subject');
const Logger = require('../utils/Logger');
const { UserFactory } = require('../factories/UserFactory');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');
const { AssignmentFactory } = require('../factories/AssignmentFactory');
const eventBus = require('../events/appEventBus');

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
        assignmentType: assignment.assignmentType,
        assignmentDetails: assignment.assignmentDetails,
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

        const { subject: subjectId } = req.body;
        const assignmentType = AssignmentFactory.create(req.body.assignmentType, req.body);
        const subject = await Subject.findById(subjectId);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        if (!teaches(subject, req.user._id)) {
            return res.status(403).json({ message: 'You can only set work on subjects you teach' });
        }

        const assignment = await Assignment.create({
            ...assignmentType.toAssignmentPayload(),
            subject: subject._id,
            teacher: req.user._id,
        });

        // fan out to everyone enrolled in the subject
        const instances = instancesFor(assignment, subject);
        const insertedTasks = instances.length ? await Task.insertMany(instances) : [];
        await eventBus.emit('assignment.created', {
            assignment,
            subject,
            tasks: insertedTasks,
        });

        await eventBus.emit('activity.recorded', {
            actor: req.user._id,
            action: 'assignment.created',
            entityType: 'Assignment',
            entityId: assignment._id,
            message: `${req.user.email} created assignment "${assignment.title}"`,
            metadata: {
                subject: subject._id,
                assignedTo: instances.length,
            },
        });

        logger.info(
            `${req.user.email} created ${assignment.assignmentType} assignment "${assignment.title}" → ${instances.length} student(s)`);
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

// editing the teacher assignment template pushes shared details down to every
// student Task instance, but leaves each student's personal progress data
// alone, including status, priority, archive state and grades.
const updateAssignment = async (req, res) => {
    try {
        const account = UserFactory.create(req.user);
        if (!account.canGrade()) {
            return res.status(403).json({ message: 'Only teachers can edit assignments' });
        }

        const assignment = await Assignment.findOne({ _id: req.params.id, teacher: req.user._id });
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        // Rebuild the assignment type object through the factory so edits follow
        // the same construction rules as creation. If assignmentType is omitted,
        // keep the existing type.
        const assignmentType = AssignmentFactory.create(
            req.body.assignmentType || assignment.assignmentType,
            {
                title: req.body.title !== undefined ? req.body.title : assignment.title,
                description: req.body.description !== undefined ? req.body.description : assignment.description,
                deadline: req.body.deadline !== undefined ? req.body.deadline : assignment.deadline,
                assignmentType: req.body.assignmentType || assignment.assignmentType,

                // fall back to existing details if the request does not include
                // new type-specific fields
                questionCount:
                    req.body.questionCount !== undefined
                        ? req.body.questionCount
                        : assignment.assignmentDetails?.questionCount,
                timeLimitMinutes:
                    req.body.timeLimitMinutes !== undefined
                        ? req.body.timeLimitMinutes
                        : assignment.assignmentDetails?.timeLimitMinutes,
                presentationLengthMinutes:
                    req.body.presentationLengthMinutes !== undefined
                        ? req.body.presentationLengthMinutes
                        : assignment.assignmentDetails?.presentationLengthMinutes,
            }
        );

        const payload = assignmentType.toAssignmentPayload();

        assignment.title = payload.title;
        assignment.description = payload.description;
        assignment.deadline = payload.deadline;
        assignment.assignmentType = payload.assignmentType;
        assignment.assignmentDetails = payload.assignmentDetails;

        const saved = await assignment.save();

        await Task.updateMany(
            { assignment: assignment._id },
            {
                title: saved.title,
                description: saved.description,
                deadline: saved.deadline,
                assignmentType: saved.assignmentType,
                assignmentDetails: saved.assignmentDetails,
            }
        );

        await eventBus.emit('activity.recorded', {
            actor: req.user._id,
            action: 'assignment.updated',
            entityType: 'Assignment',
            entityId: assignment._id,
            message: `${req.user.email} updated assignment "${saved.title}"`,
            metadata: {
                subject: saved.subject,
            },
        });

        logger.info(`${req.user.email} edited ${saved.assignmentType} assignment ${assignment._id} (propagated to instances)`);
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

        await eventBus.emit('activity.recorded', {
            actor: req.user._id,
            action: 'assignment.deleted',
            entityType: 'Assignment',
            entityId: assignment._id,
            message: `${req.user.email} deleted assignment "${assignment.title}"`,
            metadata: {
                subject: assignment.subject,
            },
        });

        logger.info(`${req.user.email} deleted assignment ${assignment._id} and its instances`);
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createAssignment, getAssignments, updateAssignment, deleteAssignment, instancesFor };
