import { useState } from 'react';
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

// mirrors the backend State pattern: a student can still hand work in from any
// of these, but not once it's submitted or graded.
const SUBMITTABLE = [
  ASSIGNMENT_STATUSES.NOT_STARTED,
  ASSIGNMENT_STATUSES.IN_PROGRESS,
  ASSIGNMENT_STATUSES.OVERDUE,
  ASSIGNMENT_STATUSES.COMPLETED,
];

const TaskList = ({ tasks, setTasks, setEditingTask, openTaskForm, highlightedTaskId }) => {
  const { user } = useAuth();
  // the confirm dialog config when one is open, or null. each action below just
  // hands it a title/message and what to run on confirm.
  const [confirm, setConfirm] = useState(null);

  const submitTask = async (task) => {
    try {
      const response = await axiosInstance.put(`/tasks/${task._id}/submit`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(tasks.map((t) => (t._id === task._id ? response.data : t)));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit assignment.');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      alert('Failed to delete assignment.');
    }
  };

  const askSubmit = (task) =>
    setConfirm({
      title: 'Submit for grading?',
      message: `"${task.title}" will be sent to your teacher. You won't be able to edit it after this.`,
      confirmLabel: 'Submit',
      variant: 'primary',
      icon: 'send',
      onConfirm: () => submitTask(task),
    });

  const askDelete = (task) =>
    setConfirm({
      title: 'Delete assignment?',
      message: `"${task.title}" will be permanently removed. This can't be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      icon: 'delete',
      onConfirm: () => deleteTask(task._id),
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
              <div className="min-w-[110px]">
                <span className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-xs">Priority</span>
                <span className={`inline-block font-label-sm text-label-sm px-2 py-1 rounded-md whitespace-nowrap ${PRIORITY_BADGE[task.priority] || PRIORITY_BADGE['Low']}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            <div className="flex gap-sm md:flex-col lg:flex-row">
              {SUBMITTABLE.includes(task.status) && (
                <button
                  onClick={() => askSubmit(task)}
                  title="Submit for grading"
                  className="p-xs rounded-lg border border-primary text-primary hover:bg-primary hover:text-on-primary transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              )}
              <button
                onClick={() => {
                  setEditingTask(task);
                  openTaskForm();
                }}
                title="Edit assignment"
                className="p-xs rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
              <button
                onClick={() => askDelete(task)}
                title="Delete assignment"
                className="p-xs rounded-lg border border-outline-variant text-error hover:bg-error-container hover:border-error transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
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
