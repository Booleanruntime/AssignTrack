const { expect } = require('chai');
const sinon = require('sinon');
const SubjectAccessProxy = require('../proxies/SubjectAccessProxy');
const { UserFactory } = require('../factories/UserFactory');

// enrolment is admin-only, guarded the same way teacher assignment is. these
// check the proxy gate without touching the database.
describe('SubjectAccessProxy enrolment (Proxy pattern)', () => {
    const makeFakeService = () => ({
        setStudents: sinon.stub().resolves({ _id: 'subj1', students: ['s1'] }),
        listStudents: sinon.stub().resolves([]),
    });

    it('delegates setStudents to the service for an admin', async () => {
        const admin = UserFactory.create({ id: 'a', name: 'Ada', role: 'admin' });
        const service = makeFakeService();
        const proxy = new SubjectAccessProxy(admin, service);

        const result = await proxy.setStudents('subj1', ['s1']);

        expect(service.setStudents.calledOnceWith('subj1', ['s1'])).to.equal(true);
        expect(result.students).to.deep.equal(['s1']);
    });

    it('blocks a teacher from enrolling and never hits the service', async () => {
        const teacher = UserFactory.create({ id: 't', name: 'Tom', role: 'teacher' });
        const service = makeFakeService();
        const proxy = new SubjectAccessProxy(teacher, service);

        try {
            await proxy.setStudents('subj1', ['s1']);
            throw new Error('should have thrown');
        } catch (err) {
            expect(err.status).to.equal(403);
            expect(service.setStudents.called).to.equal(false);
        }
    });

    it('blocks a student from enrolling', async () => {
        const student = UserFactory.create({ id: 's', name: 'Sam', role: 'student' });
        const service = makeFakeService();
        const proxy = new SubjectAccessProxy(student, service);

        try {
            await proxy.setStudents('subj1', ['s1']);
            throw new Error('should have thrown');
        } catch (err) {
            expect(err.status).to.equal(403);
            expect(service.setStudents.called).to.equal(false);
        }
    });

    it('lets anyone read the enrolled roster', async () => {
        const student = UserFactory.create({ id: 's', name: 'Sam', role: 'student' });
        const service = makeFakeService();
        const proxy = new SubjectAccessProxy(student, service);

        await proxy.listStudents('subj1');

        expect(service.listStudents.calledOnceWith('subj1')).to.equal(true);
    });
});
