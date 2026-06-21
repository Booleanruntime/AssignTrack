const { expect } = require('chai');
const sinon = require('sinon');
const Grade = require('../models/Grade');
const Task = require('../models/Task');
const ActivityLogService = require('../services/ActivityLogService');
const { createGrade } = require('../controllers/gradeController');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');

// the gate that ties grading to the assignment lifecycle: a teacher can only
// grade once the student has submitted. these stay pure unit tests - Task and
// Grade are stubbed so nothing touches the database.
describe('createGrade submission gate', () => {
    const teacher = { _id: 'teacher1', email: 'tara@uni.edu', role: 'teacher' };
    const validBody = { taskId: 'task1', scheme: 'percentage', rubric: [{ criterion: 'Design', score: 8, outOf: 10 }] };

    const makeRes = () => {
        const res = {};
        res.status = sinon.stub().returns(res);
        res.json = sinon.stub().returns(res);
        return res;
    };

    afterEach(() => sinon.restore());

    it('rejects grading a task that has not been submitted', async () => {
        const task = { _id: 'task1', user: 'student1', subject: 'subj1', status: ASSIGNMENT_STATUSES.IN_PROGRESS, save: sinon.stub() };
        sinon.stub(Task, 'findById').resolves(task);
        const gradeCreate = sinon.stub(Grade, 'create');
        const res = makeRes();

        await createGrade({ user: teacher, body: validBody }, res);

        expect(res.status.calledWith(400)).to.equal(true);
        expect(gradeCreate.called).to.equal(false);
        expect(task.save.called).to.equal(false);
    });

    it('grades a submitted task and moves it to Graded', async () => {
        const task = { _id: 'task1', user: 'student1', subject: 'subj1', status: ASSIGNMENT_STATUSES.SUBMITTED, save: sinon.stub().resolves() };
        sinon.stub(Task, 'findById').resolves(task);
        const gradeCreate = sinon.stub(Grade, 'create').resolves({ _id: 'grade1', label: '80%' });
        const activity = sinon.stub(ActivityLogService, 'recordActivity').resolves();
        const res = makeRes();

        await createGrade({ user: teacher, body: validBody }, res);

        expect(gradeCreate.calledOnce).to.equal(true);
        expect(activity.calledOnce).to.equal(true);
        expect(activity.firstCall.args[0]).to.include({
            actor: teacher._id,
            action: 'grade.created',
            entityType: 'Grade',
            entityId: 'grade1',
        });
        expect(task.status).to.equal(ASSIGNMENT_STATUSES.GRADED);
        expect(task.save.calledOnce).to.equal(true);
        expect(res.status.calledWith(201)).to.equal(true);
    });
});
