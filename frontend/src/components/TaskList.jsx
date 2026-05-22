import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack
} from '@mui/material';

const TaskList = ({ tasks, setTasks, setEditingTask }) => {
  const { user } = useAuth();

  const handleDelete = async (taskId) => {

    const confirmDelete = window.confirm('Are you sure you want to delete this assignment?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      alert('Failed to delete task.');
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'primary';
      case 'Overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div>
      {tasks.map((task) => (
          <Card key={task._id} sx={{ mb: 2 }}>

            <CardContent>
                <Typography variant="h6">
                  {task.title}
                </Typography>

                <Typography variant="body1">
                  {task.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Due date: {new Date(task.deadline).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Subject: {task.subject?.name || 'No Subject'}
                </Typography>
                <Chip
                    label={task.status}
                    color={getStatusColor(task.status)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
               
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setEditingTask(task)}
              >
                Edit
              </Button>

              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleDelete(task._id)}
              >
                Delete
              </Button>
            </Stack>

          </CardContent>

          </Card>
        
      ))}
    </div>
  );
};

export default TaskList;
