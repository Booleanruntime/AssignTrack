import { useState, useEffect, useRef  } from 'react';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import AssignmentStats from '../components/AssignmentStats';
import AssignmentFilters from '../components/AssignmentFilters';
import { Button, Box, Typography, Card, CardContent } from '@mui/material';


const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);
  const taskFormRef = useRef(null);

  useEffect(() => {
    if (!user?.token) return;
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('/tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(response.data);
      } catch (error) {
        alert('Failed to fetch tasks.');
      }
    };

    const fetchSubjects = async () => {
      try {
        const response = await axiosInstance.get('/subjects', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSubjects(response.data);
      } catch (error) {
        alert('Failed to fetch subjects.');
      }
    };                            

    fetchTasks();
    fetchSubjects();

  }, [user]);

  const filteredTasks = tasks
  .filter((task) => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  })
  .filter((task) => {
    if (subjectFilter === 'all') return true;
    return task.subject?._id === subjectFilter || task.subject === subjectFilter;
  })
  .sort((a, b) => {
    const dateA = new Date(a.deadline);
    const dateB = new Date(b.deadline);

    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const openTaskForm = () => {
  setShowTaskForm(true);

  setTimeout(() => {
    taskFormRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 100);
};

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
      <Typography  variant="h4" sx={{fontWeight: 700}}>
        My Assignments
      </Typography>

      <Button
        variant="contained"
        sx={{ backgroundColor: '#2e67e4', '&:hover': { backgroundColor: '#2457c5' } }}
        onClick={() => {
          setEditingTask(null);
          openTaskForm();
        }}
      >
        + Create Assignment
      </Button>                                 
    </Box>

      <AssignmentStats tasks={tasks} />

        {showTaskForm && (
          <div ref={taskFormRef}>
            <TaskForm
              tasks={tasks}
              setTasks={setTasks}
              editingTask={editingTask}
              setEditingTask={setEditingTask}
              subjects={subjects}
              setShowTaskForm={setShowTaskForm}
              setHighlightedTaskId={setHighlightedTaskId}
            />
          </div>
        )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <AssignmentFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            subjectFilter={subjectFilter}
            setSubjectFilter={setSubjectFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            subjects={subjects}
          />  
        </CardContent>
      </Card>
     
      <TaskList tasks={filteredTasks} 
      setTasks={setTasks} 
      setEditingTask={setEditingTask} 
      setShowTaskForm={setShowTaskForm} 
      openTaskForm={openTaskForm}
      highlightedTaskId={highlightedTaskId}/>
    </div>
  );
};

export default Tasks;
