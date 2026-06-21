// Factory to build different assignment type objects. Mongo stores the selected
// assignmentType and assignmentDetails, but the construction rules live here so
// controllers do not branch on every assignment type themselves.

class BaseAssignmentType {
  constructor(data) {
    this.data = data;
  }

  get type() {
    return 'standard';
  }

  details() {
    return {};
  }

  toAssignmentPayload() {
    return {
      title: this.data.title,
      description: this.data.description,
      deadline: this.data.deadline,
      assignmentType: this.type,
      assignmentDetails: this.details(),
    };
  }
}

class StandardAssignmentType extends BaseAssignmentType {}

class QuizAssignmentType extends BaseAssignmentType {
  get type() {
    return 'quiz';
  }

  details() {
    return {
      questionCount: Number(this.data.questionCount || 0),
      timeLimitMinutes: Number(this.data.timeLimitMinutes || 0),
    };
  }
}

class PresentationAssignmentType extends BaseAssignmentType {
  get type() {
    return 'presentation';
  }

  details() {
    return {
      presentationLengthMinutes: Number(this.data.presentationLengthMinutes || 0),
    };
  }
}

const ASSIGNMENT_TYPE_CLASSES = {
  standard: StandardAssignmentType,
  quiz: QuizAssignmentType,
  presentation: PresentationAssignmentType,
};

class AssignmentFactory {
  static create(type, data) {
    const TypeClass = ASSIGNMENT_TYPE_CLASSES[type || 'standard'];

    if (!TypeClass) {
      throw new Error(`Unknown assignment type: ${type}`);
    }

    return new TypeClass(data);
  }
}

module.exports = {
  AssignmentFactory,
  BaseAssignmentType,
  StandardAssignmentType,
  QuizAssignmentType,
  PresentationAssignmentType,
};