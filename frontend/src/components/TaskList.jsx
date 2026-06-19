import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { ASSIGNMENT_STATUSES } from '../constants/assignmentStatuses';
import ConfirmDialog from './ConfirmDialog';

// Badge styling per status. Default (Not Started) falls back to a neutral chip.
const STATUS_BADGE = {
  [ASSIGNMENT_STATUSES.COMPLETED]: 'bg-tertiary-fixed-dim/30 text-on-tertiary-container',
  [ASSIGNMENT_STATUSES.IN_PROGRESS]: 'bg-primary/10 text-primary',
  [ASSIGNMENT_STATUSES.OVERDUE]: 'bg-error/10 text-error',
  [ASSIGNMENT_STATUSES.NOT_STARTED]: 'bg-surface-variant text-on-surface-variant',
  [ASSIGNMENT_STATUSES.SUBMITTED]: 'bg-primary/10 text-primary',
  [ASSIGNMENT_STATUSES.GRADED]: 'bg-tertiary-fixed-dim/30 text-on-tertiary-container',
};

// Badge styling per priority. Default (Low) falls back to a neutral chip.
const PRIORITY_BADGE = {
  High: 'bg-error/10 text-error',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-surface-variant text-on-surface-variant',
};

// the statuses a student can set by hand. Submitted and Graded are reached
// through the submit and grade flows, so they lock the row.
const SETTABLE = [
  ASSIGNMENT_STATUSES.NOT_STARTED,
  ASSIGNMENT_STATUSES.IN_PROGRESS,
  ASSIGNMENT_STATUSES.COMPLETED,
];
const LOCKED = [ASSIGNMENT_STATUSES.SUBMITTED, ASSIGNMENT_STATUSES.GRADED];

const TaskList = ({ tasks, setTasks, highlightedTaskId }) => {
  const { user } = useAuth();
  const [confirm, setConfirm] = useState(null);
  const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };

  const updateStatus = async (task, status) => {
    try {
      const res = await axiosInstance.put(`/tasks/${task._id}`, { status }, authHeader);
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status.');
    }
  };

  const submitTask = async (task) => {
    try {
      const res = await axiosInstance.put(`/tasks/${task._id}/submit`, {}, authHeader);
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit assignment.');
    }
  };

  const askSubmit = (task) =>
    setConfirm({
      title: 'Submit for grading?',
      message: `"${task.title}" will be sent to your teacher. You won't be able to change it after this.`,
      confirmLabel: 'Submit',
      variant: 'primary',
      icon: 'send',
      onConfirm: () => submitTask(task),
    });

  if (tasks.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col items-center gap-md text-on-surface-variant">
        <span className="material-symbols-outlined text-display-lg text-outline">assignment</span>
        <p className="font-body-md text-body-md text-center">No assignments match your filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-md">
        {tasks.map((task) => {
          const isHighlighted = task._id === highlightedTaskId;
          const locked = LOCKED.includes(task.status);
          return (
            <div
              key={task._id}
              className={`bg-surface-container-lowest border rounded-xl p-md flex flex-col md:flex-row md:items-center gap-md transition-all ${
                isHighlighted ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant'
              }`}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-title-lg text-title-lg text-on-surface">{task.title}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-xs">
                  {task.description || 'No description'}
                </p>
              </div>

              <div className="flex items-center gap-lg">
                <div className="min-w-[110px]">
                  <span className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-xs">Subject</span>
                  <span className="font-body-sm text-body-sm text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">school</span>
                    {task.subject?.name || 'No subject'}
                  </span>
                </div>

                <div className="min-w-[100px]">
                  <span className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-xs">Due date</span>
                  <span className="font-body-sm text-body-sm text-on-surface">{new Date(task.deadline).toLocaleDateString()}</span>
                </div>

                <div className="min-w-[110px]">
                  <span className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-xs">Status</span>
                  <span className={`inline-block font-label-sm text-label-sm px-2 py-1 rounded-full whitespace-nowrap ${STATUS_BADGE[task.status] || STATUS_BADGE[ASSIGNMENT_STATUSES.NOT_STARTED]}`}>
                    {task.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-sm">
                {task.status === ASSIGNMENT_STATUSES.GRADED ? (
                  <Link
                    to="/grades"
                    className="px-md py-xs rounded-lg border border-outline-variant text-primary font-label-md text-label-md hover:bg-surface-container-low transition-colors whitespace-nowrap"
                  >
                    View grade
                  </Link>
                ) : locked ? (
                  <span className="font-body-sm text-body-sm text-on-surface-variant italic">Awaiting grade</span>
                ) : (
                  <>
                    <select
                      value={SETTABLE.includes(task.status) ? task.status : ''}
                      onChange={(e) => updateStatus(task, e.target.value)}
                      className="px-sm py-xs bg-surface-container-lowest border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface focus:ring-2 focus:ring-primary outline-none"
                      title="Update progress"
                    >
                      {!SETTABLE.includes(task.status) && (
                        <option value="" disabled>{task.status}</option>
                      )}
                      {SETTABLE.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => askSubmit(task)}
                      title="Submit for grading"
                      className="inline-flex items-center gap-xs px-md py-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      Submit
                    </button>
                  </>
                )}
              </div>
              <div className="min-w-[110px]">
                <span className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-xs">Priority</span>
                <span className={`inline-block font-label-sm text-label-sm px-2 py-1 rounded-md whitespace-nowrap ${PRIORITY_BADGE[task.priority] || PRIORITY_BADGE['Low']}`}>
                  {task.priority}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}
    </>
  );
};

export default TaskList;
