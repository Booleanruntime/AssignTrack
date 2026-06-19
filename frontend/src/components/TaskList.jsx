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

const TaskList = ({ tasks, setTasks, highlightedTaskId, showArchived  }) => {
  const { user } = useAuth();
  const [confirm, setConfirm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('Low');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };

  const startEdit = (task) => {
  setEditingId(task._id);
  setEditStatus(task.status);
  setEditPriority(task.priority || 'Low');
};

  const cancelEdit = () => {
    setEditingId(null);
    setEditStatus('');
    setEditPriority('Low');
  };

  const saveEdit = async (task) => {
    try {
      const res = await axiosInstance.put(
        `/tasks/${task._id}`,
        {
          status: editStatus,
          priority: editPriority,
        },
        authHeader
      );

      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
      cancelEdit();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update assignment.');
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

  const archiveTask = async (task) => {
  try {
    const res = await axiosInstance.put(`/tasks/${task._id}/archive`, {}, authHeader);

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === task._id ? res.data : t))
    );
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to archive assignment.');
  }
};

const restoreTask = async (task) => {
  try {
    const res = await axiosInstance.put(`/tasks/${task._id}/restore`, {}, authHeader);

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === task._id ? res.data : t))
    );
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to restore assignment.');
  }
};

const askRestore = (task) =>
  setConfirm({
    title: 'Restore assignment?',
    message: `"${task.title}" will be moved back to your active assignment list.`,
    confirmLabel: 'Restore',
    variant: 'primary',
    icon: 'restore',
    onConfirm: () => restoreTask(task),
  });

const askArchive = (task) =>
  setConfirm({
    title: 'Archive assignment?',
    message: `"${task.title}" will be removed from your active assignment list but will not be deleted.`,
    confirmLabel: 'Archive',
    variant: 'primary',
    icon: 'archive',
    onConfirm: () => archiveTask(task),
  });

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
      <div className="flex flex-col gap-md pb-5">
        {tasks.map((task) => {
          const isHighlighted = task._id === highlightedTaskId;
          const locked = LOCKED.includes(task.status);
          const isEditing = editingId === task._id;
          return (
            <div
              key={task._id}
              className={`bg-surface-container-lowest border rounded-xl p-md grid grid-cols-1 lg:grid-cols-[1fr_150px_130px_150px_120px_120px] items-center gap-md transition-all ${
                isHighlighted ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant'
              }`}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-title-lg text-title-lg text-on-surface">{task.title}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-xs">
                  {task.description || 'No description'}
                </p>
              </div>

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

                <div className="min-w-[120px]">
                  <span className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-xs">
                    Status
                  </span>

                  {isEditing && !locked ? (
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="px-sm py-xs bg-surface-container-lowest border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface focus:ring-2 focus:ring-primary outline-none"
                    >
                      {SETTABLE.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-col items-start gap-1">
                      <span className={`inline-block font-label-sm text-label-sm px-2 py-1 rounded-full whitespace-nowrap ${STATUS_BADGE[task.status] || STATUS_BADGE[ASSIGNMENT_STATUSES.NOT_STARTED]}`}>
                        {task.status}
                      </span>                      
                    </div>
                  )}
                </div>

                <div className="min-w-[110px]">
                  <span className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-xs">
                    Priority
                  </span>

                  {isEditing && !locked ? (
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="px-sm py-xs bg-surface-container-lowest border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  ) : (
                    <span className={`inline-block font-label-sm text-label-sm px-2 py-1 rounded-md whitespace-nowrap ${PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.Low}`}>
                      {task.priority || 'Low'}
                    </span>
                  )}
                </div>

              <div className="flex items-center justify-end gap-md">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => saveEdit(task)}
                      title="Save changes"
                      className="p-xs rounded-lg border border-outline-variant text-primary hover:border-primary transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    </button>

                    <button
                      onClick={cancelEdit}
                      title="Cancel"
                      className="p-xs rounded-lg border border-outline-variant text-on-surface-variant hover:border-primary transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </>
                ) : (
                  <>
                    {!showArchived && !locked && (
                      <button
                        onClick={() => askSubmit(task)}
                        title="Submit for grading"
                        className="inline-flex items-center gap-xs px-md py-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        Submit
                      </button>
                    )}

                    {task.status === ASSIGNMENT_STATUSES.GRADED && (
                      <Link
                        to="/grades"
                        title="View grade"
                        className="px-md py-xs rounded-lg border border-outline-variant text-primary font-label-md text-label-md hover:bg-surface-container-low transition-colors whitespace-nowrap"
                      >
                        View grade
                      </Link>
                    )}

                    {task.status === ASSIGNMENT_STATUSES.SUBMITTED && (
                        <span className="font-body-sm text-body-sm text-on-surface-variant italic whitespace-nowrap">
                          Awaiting grade
                        </span>
                      )}

                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === task._id ? null : task._id)}
                        title="More actions"
                        className="p-xs rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>

                      {menuOpenId === task._id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-10 overflow-hidden">

                          {showArchived ? (
                            <button
                              onClick={() => {
                                askRestore(task);
                                setMenuOpenId(null);
                              }}
                              className="w-full text-left px-md py-sm font-body-sm text-body-sm text-on-surface hover:bg-surface-container-low transition-colors"
                            >
                              Restore
                            </button>
                          ) : (
                            <>
                              {!locked && (
                                <button
                                  onClick={() => {
                                    startEdit(task);
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full text-left px-md py-sm font-body-sm text-body-sm text-on-surface hover:bg-surface-container-low transition-colors"
                                >
                                  Edit
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  askArchive(task);
                                  setMenuOpenId(null);
                                }}
                                className="w-full text-left px-md py-sm font-body-sm text-body-sm text-error hover:bg-surface-container-low transition-colors"
                              >
                                Archive
                              </button>
                            </>
                          )}

                        </div>
                      )}
                    </div>
                  </>
                )}
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
