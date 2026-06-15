import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { ASSIGNMENT_STATUSES } from '../constants/assignmentStatuses';

// Badge styling per status. Default (Not Started) falls back to a neutral chip.
const STATUS_BADGE = {
  [ASSIGNMENT_STATUSES.COMPLETED]: 'bg-tertiary-fixed-dim/30 text-on-tertiary-container',
  [ASSIGNMENT_STATUSES.IN_PROGRESS]: 'bg-primary/10 text-primary',
  [ASSIGNMENT_STATUSES.OVERDUE]: 'bg-error/10 text-error',
  [ASSIGNMENT_STATUSES.NOT_STARTED]: 'bg-surface-variant text-on-surface-variant',
};

const TaskList = ({ tasks, setTasks, setEditingTask, openTaskForm, highlightedTaskId }) => {
  const { user } = useAuth();

  const handleDelete = async (taskId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this assignment?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axiosInstance.delete(`/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      alert('Failed to delete assignment.');
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col items-center gap-md text-on-surface-variant">
        <span className="material-symbols-outlined text-display-lg text-outline">assignment</span>
        <p className="font-body-md text-body-md text-center">No assignments match your filters.</p>
      </div>
    );
  }

  return (
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
            </div>

            <div className="flex gap-sm md:flex-col lg:flex-row">
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
                onClick={() => handleDelete(task._id)}
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
  );
};

export default TaskList;
