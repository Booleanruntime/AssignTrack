const { expect } = require('chai');

const {
  AssignmentFactory,
  StandardAssignmentType,
  QuizAssignmentType,
  PresentationAssignmentType,
} = require('../factories/AssignmentFactory');

describe('AssignmentFactory (Assignment template - Factory pattern)', () => {
  it('builds a StandardAssignmentType by default', () => {
    const assignment = AssignmentFactory.create(undefined, {
      title: 'Essay',
      description: 'Write an essay',
      deadline: '2026-07-01',
    });

    expect(assignment).to.be.instanceOf(StandardAssignmentType);

    const payload = assignment.toAssignmentPayload();

    expect(payload.assignmentType).to.equal('standard');
    expect(payload.assignmentDetails).to.deep.equal({});
  });

  it('builds a QuizAssignmentType with quiz-specific details', () => {
    const assignment = AssignmentFactory.create('quiz', {
        title: 'Week 5 OOP Quiz',
        description: 'Complete the quiz',
        deadline: '2026-07-01',
        questionCount: 20,
        timeLimitMinutes: 30,
    });

    expect(assignment).to.be.instanceOf(QuizAssignmentType);

    const payload = assignment.toAssignmentPayload();

    expect(payload.assignmentType).to.equal('quiz');

    expect(payload.assignmentDetails).to.deep.equal({
        questionCount: 20,
        timeLimitMinutes: 30,
    });
});

 it('builds a PresentationAssignmentType with presentation-specific details', () => {
    const assignment = AssignmentFactory.create('presentation', {
        title: 'Week 5 OOP Presentation',
        description: 'Present your project',
        deadline: '2026-07-01',
        presentationLengthMinutes: 10,
    });

    expect(assignment).to.be.instanceOf(PresentationAssignmentType);

    const payload = assignment.toAssignmentPayload();

    expect(payload.assignmentType).to.equal('presentation');

    expect(payload.assignmentDetails).to.deep.equal({
        presentationLengthMinutes: 10,
    });
});

it('throws on an unknown assignment type', () => {
    expect(() =>
        AssignmentFactory.create('lab', {
            title: 'Lab Exercise',
            description: 'Complete the lab',
            deadline: '2026-07-01',
        })
    ).to.throw('Unknown assignment type');
});
});