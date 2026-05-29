const { expect } = require('chai');
const sinon = require('sinon');

describe('AssignTrack assignment tests', () => {
  it('should calculate number of in-progress assignments', () => {
    const assignments = [
      { status: 'Not Started' },
      { status: 'In Progress' },
      { status: 'Completed' },
      { status: 'In Progress' }
    ];

    const count = assignments.filter(
      assignment => assignment.status === 'In Progress'
    ).length;

    expect(count).to.equal(2);
  });

  it('should delete an assignment from a list', () => {
    const assignments = [
      { id: 1, title: 'Essay' },
      { id: 2, title: 'Report' },
      { id: 3, title: 'Presentation' }
    ];

    const remainingAssignments = assignments.filter(
      assignment => assignment.id !== 2
    );

    expect(remainingAssignments.length).to.equal(2);
    expect(remainingAssignments.find(a => a.id === 2)).to.equal(undefined);
  });

  it('should simulate successful assignment creation using a stub', async () => {
    const fakeAssignmentModel = {
      create: async () => {}
    };

    const createStub = sinon.stub(fakeAssignmentModel, 'create').resolves({
      title: 'Database Report',
      status: 'Completed'
    });

    const result = await fakeAssignmentModel.create();

    expect(createStub.calledOnce).to.equal(true);
    expect(result.title).to.equal('Database Report');
    expect(result.status).to.equal('Completed');

    createStub.restore();
  });
});