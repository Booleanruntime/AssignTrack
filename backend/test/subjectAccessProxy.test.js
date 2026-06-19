const { expect } = require('chai');
const sinon = require('sinon');
const SubjectAccessProxy = require('../proxies/SubjectAccessProxy');
const { UserFactory } = require('../factories/UserFactory');

describe('SubjectAccessProxy (Proxy pattern)', () => {
    // a fake "real subject" so these stay pure unit tests with no database
    const makeFakeService = () => ({
        setTeachers: sinon.stub().resolves({ _id: 'subj1', teachers: ['t1'] }),
        listTeachers: sinon.stub().resolves([]),
    });

    it('delegates setTeachers to the service for an admin', async () => {
        const admin = UserFactory.create({ id: 'a', name: 'Avi', role: 'admin' });
        const service = makeFakeService();
        const proxy = new SubjectAccessProxy(admin, service);

        const result = await proxy.setTeachers('subj1', ['t1']);

        expect(service.setTeachers.calledOnceWith('subj1', ['t1'])).to.equal(true);
        expect(result.teachers).to.deep.equal(['t1']);
    });

    it('blocks a teacher from assigning and never hits the service', async () => {
        const teacher = UserFactory.create({ id: 't', name: 'Tara', role: 'teacher' });
        const service = makeFakeService();
        const proxy = new SubjectAccessProxy(teacher, service);

        try {
            await proxy.setTeachers('subj1', ['t1']);
            throw new Error('should have thrown');
        } catch (err) {
            expect(err.status).to.equal(403);
            expect(service.setTeachers.called).to.equal(false);
        }
    });

    it('blocks a student from assigning', async () => {
        const student = UserFactory.create({ id: 's', name: 'Sam', role: 'student' });
        const service = makeFakeService();
        const proxy = new SubjectAccessProxy(student, service);

        try {
            await proxy.setTeachers('subj1', ['t1']);
            throw new Error('should have thrown');
        } catch (err) {
            expect(err.status).to.equal(403);
            expect(service.setTeachers.called).to.equal(false);
        }
    });

    it('lets anyone read the teacher roster', async () => {
        const student = UserFactory.create({ id: 's', name: 'Sam', role: 'student' });
        const service = makeFakeService();
        const proxy = new SubjectAccessProxy(student, service);

        await proxy.listTeachers('subj1');

        expect(service.listTeachers.calledOnceWith('subj1')).to.equal(true);
    });
});
