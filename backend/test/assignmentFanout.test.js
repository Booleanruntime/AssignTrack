const { expect } = require('chai');
const sinon = require('sinon');
const Assignment = require('../models/Assignment');
const Task = require('../models/Task');
const Subject = require('../models/Subject');
const NotificationService = require('../services/NotificationService');
const { createAssignment, instancesFor } = require('../controllers/assignmentController');
const { ASSIGNMENT_STATUSES } = require('../constants/assignmentStatuses');

// a teacher authoring an assignment should fan it out to everyone enrolled in
// the subject. these are pure unit tests - the models are stubbed.
describe('Assignment fan-out', () => {
    const teacher = { _id: 'teacher1', email: 'tara@uni.edu', role: 'teacher' };
    const body = { title: 'Essay', description: 'Write it', deadline: new Date('2026-08-01'), subject: 'subj1' };

    const makeRes = () => {
        const res = {};
        res.status = sinon.stub().returns(res);
        res.json = sinon.stub().returns(res);
        return res;
    };

    afterEach(() => sinon.restore());

    it('instancesFor builds one Not-Started instance per enrolled student', () => {
        const subject = { _id: 'subj1', students: ['s1', 's2', 's3'] };
        const assignment = { _id: 'a1', title: 'Essay', description: 'Write it', deadline: new Date() };

        const out = instancesFor(assignment, subject);

        expect(out).to.have.length(3);
        expect(out[0]).to.include({ assignment: 'a1', user: 's1', status: ASSIGNMENT_STATUSES.NOT_STARTED });
    });

    it('creates the assignment and fans out a task per enrolled student', async () => {
        sinon.stub(Subject, 'findById').resolves({ _id: 'subj1', teachers: ['teacher1'], students: ['s1', 's2'] });
        sinon.stub(Assignment, 'create').resolves({ _id: 'a1', toObject: () => ({ _id: 'a1', title: 'Essay' }) });
        const insert = sinon.stub(Task, 'insertMany').resolves([
            { _id: 'task1', user: 's1' },
            { _id: 'task2', user: 's2' },
        ]);
        const notifications = sinon.stub(NotificationService, 'createMany').resolves([]);
        const res = makeRes();

        await createAssignment({ user: teacher, body }, res);

        expect(insert.calledOnce).to.equal(true);
        expect(insert.firstCall.args[0]).to.have.length(2);
        expect(notifications.calledOnce).to.equal(true);
        expect(notifications.firstCall.args[0]).to.have.length(2);
        expect(notifications.firstCall.args[0][0]).to.include({
            recipient: 's1',
            type: 'assignment.created',
            title: 'New assignment',
            assignment: 'a1',
            task: 'task1',
        });
        expect(res.status.calledWith(201)).to.equal(true);
    });

    it('blocks a teacher who is not assigned to the subject', async () => {
        sinon.stub(Subject, 'findById').resolves({ _id: 'subj1', teachers: ['someoneElse'], students: ['s1'] });
        const create = sinon.stub(Assignment, 'create');
        const res = makeRes();

        await createAssignment({ user: teacher, body }, res);

        expect(res.status.calledWith(403)).to.equal(true);
        expect(create.called).to.equal(false);
    });

    it('blocks a student from authoring an assignment', async () => {
        const student = { _id: 's1', email: 'sam@uni.edu', role: 'student' };
        const create = sinon.stub(Assignment, 'create');
        const res = makeRes();

        await createAssignment({ user: student, body }, res);

        expect(res.status.calledWith(403)).to.equal(true);
        expect(create.called).to.equal(false);
    });
});
