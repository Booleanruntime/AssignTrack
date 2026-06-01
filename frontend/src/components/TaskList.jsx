import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import SchoolIcon from '@mui/icons-material/School';

import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack
} from '@mui/material';
import { ASSIGNMENT_STATUSES } from '../constants/assignmentStatuses';

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


  const getStatusColor = (status) => {
    switch (status) {
      case ASSIGNMENT_STATUSES.COMPLETED:
        return 'success';
      case ASSIGNMENT_STATUSES.IN_PROGRESS:
        return 'primary';
      case ASSIGNMENT_STATUSES.OVERDUE:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div>
      {tasks.map((task) => (

          <Card key={task._id} sx={{ mb: 2,
            border: task._id === highlightedTaskId ? '2px solid #2e67e4' : '1px solid transparent',
            boxShadow: task._id === highlightedTaskId
              ? '0 0 0 3px rgba(46, 103, 228, 0.12)'
              : undefined,
            transition: 'all 0.3s ease' }}>

            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                 sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
              >
                <div style={{ flex: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {task.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"                    
                  >
                    {task.description || 'No description'}
                  </Typography>
                </div>

                <div style={{ flex: 0.8 }}>
                  
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.9 }}>
                    <SchoolIcon fontSize="small" color="action" />
                    Subject
                  </Typography>
                  <Typography variant="body2">
                    {task.subject?.name || 'No Subject'}
                  </Typography>
                </div>
              

                <div style={{ flex: 0.8 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.9 }}>
                    Due date
                  </Typography>
                  <Typography variant="body2">
                    {new Date(task.deadline).toLocaleDateString()}
                  </Typography>
                </div>
                
                <div style={{ flex: 0.8 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.9 }}>
                    Status
                  </Typography>
                  <Chip
                    label={task.status}
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                </div>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      py: 0,
                      px: 1,
                      minHeight: 28,
                      height: 30,
                      minWidth: 54,
                      fontSize: '0.72rem'
                    }}
                    onClick={() => {
                      setEditingTask(task);
                      openTaskForm();
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{
                      py: 0,
                      px: 1,
                      minHeight: 28,
                      height: 30,
                      minWidth: 54,
                      fontSize: '0.72rem'
                    }}                                          
                    onClick={() => handleDelete(task._id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </CardContent>

          </Card>
        
        
      ))}
    </div>
  );
};

export default TaskList;
