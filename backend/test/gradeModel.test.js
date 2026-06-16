const { expect } = require('chai');
const mongoose = require('mongoose');
const Grade = require('../models/Grade');

describe('AssignTrack Grade model tests', () => {
    it('should require task, student, teacher, score, label and passed', () => {
        const grade = new Grade({});
        const error = grade.validateSync();

        expect(error.errors.task).to.exist;
        expect(error.errors.student).to.exist;
        expect(error.errors.teacher).to.exist;
        expect(error.errors.score).to.exist;
        expect(error.errors.label).to.exist;
        expect(error.errors.passed).to.exist;
    });

    it('should accept a valid grade', () => {
        const grade = new Grade({
            task: new mongoose.Types.ObjectId(),
            student: new mongoose.Types.ObjectId(),
            teacher: new mongoose.Types.ObjectId(),
            score: 85,
            scheme: 'letter',
            label: 'HD',
            passed: true,
        });
        expect(grade.validateSync()).to.equal(undefined);
    });

    it('should reject a score above 100', () => {
        const grade = new Grade({
            task: new mongoose.Types.ObjectId(),
            student: new mongoose.Types.ObjectId(),
            teacher: new mongoose.Types.ObjectId(),
            score: 130,
            label: '130%',
            passed: true,
        });
        expect(grade.validateSync().errors.score).to.exist;
    });

    it('should reject an unknown grading scheme', () => {
        const grade = new Grade({
            task: new mongoose.Types.ObjectId(),
            student: new mongoose.Types.ObjectId(),
            teacher: new mongoose.Types.ObjectId(),
            score: 70,
            scheme: 'vibes',
            label: '70%',
            passed: true,
        });
        expect(grade.validateSync().errors.scheme).to.exist;
    });
});
