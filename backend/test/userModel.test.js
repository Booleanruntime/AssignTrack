const { expect } = require('chai');
const User = require('../models/User');

describe('AssignTrack User model tests', () => {
    it('should require name, email and password', () => {
        const user = new User({});
        const error = user.validateSync();

        expect(error.errors.name).to.exist;
        expect(error.errors.email).to.exist;
        expect(error.errors.password).to.exist;
    });

    it('should default the role to student', () => {
        const user = new User({ name: 'Sam', email: 's@qut.edu.au', password: 'secret' });
        expect(user.role).to.equal('student');
    });

    it('should accept the teacher role', () => {
        const user = new User({ name: 'Tara', email: 't@qut.edu.au', password: 'secret', role: 'teacher' });
        const error = user.validateSync();
        expect(error).to.equal(undefined);
        expect(user.role).to.equal('teacher');
    });

    it('should reject an invalid role', () => {
        const user = new User({ name: 'X', email: 'x@qut.edu.au', password: 'secret', role: 'wizard' });
        const error = user.validateSync();
        expect(error.errors.role).to.exist;
    });
});
