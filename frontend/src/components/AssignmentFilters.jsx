import { ASSIGNMENT_STATUSES } from '../constants/assignmentStatuses';

const AssignmentFilters = ({
  statusFilter,
  setStatusFilter,
  subjectFilter,
  setSubjectFilter,
  sortOrder,
  setSortOrder,
  subjects,
}) => {
  const selectClass =
    'w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none';
  const labelClass = 'block font-label-sm text-label-sm text-on-surface-variant mb-xs uppercase tracking-wider';

  return (
    <div className="flex flex-col md:flex-row gap-md">
      <div className="flex-1">
        <label className={labelClass} htmlFor="status-filter">Filter by Status</label>
        <select id="status-filter" className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          {Object.values(ASSIGNMENT_STATUSES).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className={labelClass} htmlFor="subject-filter">Filter by Subject</label>
        <select id="subject-filter" className={selectClass} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
          <option value="all">All Subjects</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className={labelClass} htmlFor="sort-order">Sort by</label>
        <select id="sort-order" className={selectClass} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Due Date: Earliest First</option>
          <option value="desc">Due Date: Latest First</option>
          <option value="priority-desc">Priority: High to Low</option>
          <option value="priority-asc">Priority: Low to High</option>
        </select>
      </div>
    </div>
  );
};

export default AssignmentFilters;
