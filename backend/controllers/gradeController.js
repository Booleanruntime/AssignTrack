const Grade = require('../models/Grade');
const Task = require('../models/Task');
const Logger = require('../utils/Logger');
const { UserFactory } = require('../factories/UserFactory');
const { getGradingStrategy } = require('../strategies/GradingStrategy');
const FeedbackBuilder = require('../builders/FeedbackBuilder');
const computeOverall = require('../utils/computeOverall');
const { getAssignmentState } = require('../states/AssignmentState');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');

const logger = Logger.getInstance();

// turns the loose feedback bits from the request body into a feedback object
function buildFeedback({ summary, strengths = [], improvements = [], rubric = [] }) {
    const builder = new FeedbackBuilder().setSummary(summary || '');
    strengths.forEach((s) => builder.addStrength(s));
    improvements.forEach((i) => builder.addImprovement(i));
    rubric.forEach((r) => builder.addRubricItem(r.criterion, r.score, r.outOf));
    return builder.build();
}

const createGrade = async (req, res) => {
    try {
        const account = UserFactory.create(req.user);
        if (!account.canGrade()) {
            return res.status(403).json({ message: 'Only teachers can grade' });
        }

        const { taskId, scheme } = req.body;
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // the state decides whether grading is even on the table - you can't mark
        // something the student hasn't handed in yet
        if (!getAssignmentState(task.status).canBeGraded()) {
            return res.status(400).json({ message: 'Assignment must be submitted before it can be graded' });
        }

        // the rubric is the source of truth - work the overall out of it rather
        // than trusting a number from the client
        const score = computeOverall(req.body.rubric);
        if (score === null) {
            return res.status(400).json({ message: 'Add at least one rubric row with a positive out-of mark' });
        }

        // strategy decides how that overall reads + whether it's a pass
        const { label, passed } = getGradingStrategy(scheme).grade(score);

        const grade = await Grade.create({
            task: task._id,
            student: task.user,
            teacher: req.user._id,
            subject: task.subject,
            score,
            scheme: scheme || 'percentage',
            label,
            passed,
            feedback: buildFeedback(req.body),
        });

        // move the task on so it drops off the gradeable list and the student
        // sees it as marked
        task.status = ASSIGNMENT_STATUSES.GRADED;
        await task.save();

        logger.info(`${req.user.email} graded task ${taskId}: ${label}`);
        res.status(201).json(grade);
    } catch (error) {
        logger.error(`Create grade failed: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// students see their own grades, teachers see grades they gave, admins see all
const getGrades = async (req, res) => {
    try {
        const account = UserFactory.create(req.user);
        let filter = {};
        if (req.user.role === 'student') filter = { student: req.user._id };
        else if (req.user.role === 'teacher') filter = { teacher: req.user._id };

        const grades = await Grade.find(filter)
            .populate('task', 'title')
            .populate('student', 'name email')
            .populate('subject', 'name');
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateGrade = async (req, res) => {
    try {
        const account = UserFactory.create(req.user);
        if (!account.canGrade()) {
            return res.status(403).json({ message: 'Only teachers can grade' });
        }

        const grade = await Grade.findOne({ _id: req.params.id, teacher: req.user._id });
        if (!grade) return res.status(404).json({ message: 'Grade not found' });

        const { scheme } = req.body;
        if (scheme) grade.scheme = scheme;

        // rebuild the overall from the incoming rubric, same as create
        const score = computeOverall(req.body.rubric);
        if (score === null) {
            return res.status(400).json({ message: 'Add at least one rubric row with a positive out-of mark' });
        }
        grade.score = score;

        const recomputed = getGradingStrategy(grade.scheme).grade(score);
        grade.label = recomputed.label;
        grade.passed = recomputed.passed;
        grade.feedback = buildFeedback(req.body);

        const updated = await grade.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createGrade, getGrades, updateGrade };
