const priorityRank = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export const assignmentSortStrategies = {
  asc: (a, b) => new Date(a.deadline) - new Date(b.deadline),

  desc: (a, b) => new Date(b.deadline) - new Date(a.deadline),

  'priority-desc': (a, b) =>
    (priorityRank[b.priority] || 1) - (priorityRank[a.priority] || 1),

  'priority-asc': (a, b) =>
    (priorityRank[a.priority] || 1) - (priorityRank[b.priority] || 1),
};

export const getAssignmentSortStrategy = (sortOrder) =>
  assignmentSortStrategies[sortOrder] || assignmentSortStrategies.asc;