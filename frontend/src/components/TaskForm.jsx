import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { ASSIGNMENT_STATUSES } from '../constants/assignmentStatuses';

const emptyFormData = {
  title: '',
  description: '',
  deadline: '',
  subject: '',
  status: ASSIGNMENT_STATUSES.NOT_STARTED,
};

const TaskForm = ({ tasks, setTasks, editingTask, setEditingTask, subjects, setShowTaskForm, setHighlightedTaskId }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        deadline: editingTask.deadline?.slice(0, 10),
        subject: editingTask.subject?._id || editingTask.subject || '',
        status: editingTask.status || ASSIGNMENT_STATUSES.NOT_STARTED,
      });
    } else {
      setFormData(emptyFormData);
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.deadline || !formData.subject || !formData.status) {
      alert('Please complete all required fields: title, due date, subject and status.');
      return;
    }

    try {
      if (editingTask) {
        const response = await axiosInstance.put(`/tasks/${editingTask._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(tasks.map((task) => (task._id === response.data._id ? response.data : task)));
        setHighlightedTaskId(response.data._id);
        setTimeout(() => setHighlightedTaskId(null), 2500);
      } else {
        const response = await axiosInstance.post('/tasks', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks([...tasks, response.data]);
        setHighlightedTaskId(response.data._id);
        setTimeout(() => setHighlightedTaskId(null), 2500);
      }
      setEditingTask(null);
      setFormData(emptyFormData);
      setShowTaskForm(false);
    } catch (error) {
      alert('Failed to save task.');
    }
  };

  const inputClass =
    'w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none';
  const labelClass = 'block font-label-md text-label-md text-on-surface mb-xs';

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
      <h3 className="font-title-lg text-title-lg text-primary mb-md">
        {editingTask ? 'Edit Assignment' : 'Create Assignment'}
      </h3>

      <div className="space-y-md">
        <div>
          <label className={labelClass} htmlFor="task-title">Assignment Title</label>
          <input
            id="task-title"
            type="text"
            className={inputClass}
            placeholder="e.g. Database Architecture Project"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            rows={3}
            className={inputClass}
            placeholder="Add any details about this assignment"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div>
            <label className={labelClass} htmlFor="task-deadline">Due Date</label>
            <input
              id="task-deadline"
              type="date"
              className={inputClass}
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="task-subject">Subject</label>
            <select
              id="task-subject"
              className={inputClass}
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            >
              <option value="" disabled>Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="task-status">Status</label>
            <select
              id="task-status"
              className={inputClass}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              {Object.values(ASSIGNMENT_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-sm mt-lg">
        <button
          type="submit"
          className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-sm px-lg rounded-lg hover:opacity-90 transition-opacity"
        >
          {editingTask ? 'Update Assignment' : 'Create Assignment'}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditingTask(null);
            setFormData(emptyFormData);
            setShowTaskForm(false);
          }}
          className="flex-1 border border-outline-variant text-on-surface-variant font-label-md text-label-md py-sm px-lg rounded-lg hover:bg-surface-container-low transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
