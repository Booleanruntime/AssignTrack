import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { ASSIGNMENT_STATUSES } from '../constants/assignmentStatuses';

import {
  Button,
  TextField,
  MenuItem
} from '@mui/material';


const emptyFormData = { title: '', description: '', deadline: '', subject: '', status: ASSIGNMENT_STATUSES.NOT_STARTED };
const TaskForm = ({ tasks, setTasks, editingTask, setEditingTask, subjects, setShowTaskForm }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        deadline: editingTask.deadline?.slice(0, 10),
        subject: editingTask.subject?._id || editingTask.subject || '',
        status: editingTask.status || ASSIGNMENT_STATUSES.NOT_STARTED
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
        const response = await axiosInstance.put(`/api/tasks/${editingTask._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(tasks.map((task) => (task._id === response.data._id ? response.data : task)));
      } else {
        const response = await axiosInstance.post('/api/tasks', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks([...tasks, response.data]);
      }
      setEditingTask(null);
      setFormData(emptyFormData);
      setShowTaskForm(false);
    } catch (error) {
      alert('Failed to save task.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingTask ? 'Edit Assignment' : 'Create Assignment'}</h1>
      <TextField
        label="Assignment Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        fullWidth
        margin="normal"
      />
       <label  className="block text-sm font-medium text-gray-700 mt-4 mb-1">Due Date</label>  
      {/* <InputLabel shrink htmlFor="deadline" className="block text-sm font-medium text-gray-700 mt-4 mb-1">Due Date</InputLabel> */}
      <TextField
        label=""
        type="date"
        value={formData.deadline}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
        fullWidth
        margin="normal" 
        required
        InputLabelProps={{ shrink: true }}
        
      />

      <TextField
        select
        label="Subject"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        fullWidth
        margin="normal"
        required
      >
        {subjects.map((subject) => (
          <MenuItem key={subject._id} value={subject._id}>
            {subject.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Status"
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        fullWidth
        margin="normal"
        required
      >
        {Object.values(ASSIGNMENT_STATUSES).map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </TextField>

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <Button
          type="submit"
          variant="contained"
          sx={{ backgroundColor: '#2e67e4', '&:hover': { backgroundColor: '#2457c5' } }}
          fullWidth
        >
          {editingTask ? 'Update Assignment' : 'Create Assignment'}
        </Button>

       
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setEditingTask(null);
              setFormData(emptyFormData);
              setShowTaskForm(false);
            }}
          >
            Cancel
          </Button>
        
      </div>
    </form>
  );
};

export default TaskForm;
