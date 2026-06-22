const { expect } = require('chai');
const sinon = require('sinon');
const Grade = require('../models/Grade');
const Task = require('../models/Task');
const eventBus = require('../events/appEventBus');
const { createGrade } = require('../controllers/gradeController');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');

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
        const emit = sinon.stub(eventBus, 'emit').resolves([]);
        const res = makeRes();

        await createGrade({ user: teacher, body: validBody }, res);

        expect(gradeCreate.calledOnce).to.equal(true);

        expect(emit.calledTwice).to.equal(true);
        expect(emit.firstCall.args[0]).to.equal('grade.created');
        expect(emit.firstCall.args[1]).to.deep.include({
            grade: { _id: 'grade1', label: '80%' },
            task,
            label: '80%',
            score: 80,
        });

        expect(emit.secondCall.args[0]).to.equal('activity.recorded');
        expect(emit.secondCall.args[1]).to.include({
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
