import { ASSIGNMENT_STATUSES } from '../constants/assignmentStatuses';

// Status -> accent colour for its count card, mirroring the dashboard cards.
const STATUS_ACCENT = {
  [ASSIGNMENT_STATUSES.NOT_STARTED]: 'text-on-surface-variant',
  [ASSIGNMENT_STATUSES.IN_PROGRESS]: 'text-primary',
  [ASSIGNMENT_STATUSES.COMPLETED]: 'text-on-tertiary-container',
  [ASSIGNMENT_STATUSES.OVERDUE]: 'text-error',
};

const AssignmentStats = ({ tasks }) => {
  const countByStatus = (status) => tasks.filter((task) => task.status === status).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-md mb-lg">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-lg">Total</span>
        <span className="font-headline-lg text-headline-lg text-primary">{tasks.length}</span>
      </div>

      {Object.values(ASSIGNMENT_STATUSES).map((status) => {
        const isOverdue = status === ASSIGNMENT_STATUSES.OVERDUE;
        return (
          <div
            key={status}
            className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between ${
              isOverdue ? 'bg-error-container/20' : ''
            }`}
          >
            <span className={`font-label-sm text-label-sm uppercase tracking-wider mb-lg ${STATUS_ACCENT[status]}`}>
              {status}
            </span>
            <span className={`font-headline-lg text-headline-lg ${isOverdue ? 'text-error' : 'text-primary'}`}>
              {countByStatus(status)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default AssignmentStats;
