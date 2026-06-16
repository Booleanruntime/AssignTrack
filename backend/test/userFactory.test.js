const { expect } = require('chai');
const {
    UserFactory,
    StudentUser,
    TeacherUser,
    AdminUser,
} = require('../factories/UserFactory');

describe('UserFactory (Factory pattern)', () => {
    it('builds a StudentUser for the student role', () => {
        const account = UserFactory.create({ id: '1', name: 'Sam', role: 'student' });
        expect(account).to.be.instanceOf(StudentUser);
        expect(account.canGrade()).to.equal(false);
        expect(account.homeRoute()).to.equal('/dashboard');
    });

    it('builds a TeacherUser that can grade', () => {
        const account = UserFactory.create({ id: '2', name: 'Tara', role: 'teacher' });
        expect(account).to.be.instanceOf(TeacherUser);
        expect(account.canGrade()).to.equal(true);
        expect(account.permissions()).to.include('grade:tasks');
        expect(account.homeRoute()).to.equal('/teacher');
    });

    it('builds an AdminUser that can manage subjects', () => {
        const account = UserFactory.create({ id: '3', name: 'Avi', role: 'admin' });
        expect(account).to.be.instanceOf(AdminUser);
        expect(account.canManageSubjects()).to.equal(true);
        expect(account.permissions()).to.include('assign:teachers');
    });

    it('polymorphism: each role reports different permissions', () => {
        const student = UserFactory.create({ id: '1', name: 'S', role: 'student' });
        const teacher = UserFactory.create({ id: '2', name: 'T', role: 'teacher' });
        expect(teacher.permissions()).to.not.deep.equal(student.permissions());
    });

    it('keeps the user document encapsulated (no #user leak)', () => {
        const account = UserFactory.create({ id: '9', name: 'Hidden', role: 'student' });
        expect(account.name).to.equal('Hidden');
        expect(Object.keys(account)).to.not.include('user');
    });

    it('throws on an unknown role', () => {
        expect(() => UserFactory.create({ id: '4', role: 'wizard' })).to.throw('Unknown user role');
    });

    it('throws when no user/role is given', () => {
        expect(() => UserFactory.create(null)).to.throw('role missing');
    });
});
