import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import AssignmentStats from '../components/AssignmentStats';
import AssignmentFilters from '../components/AssignmentFilters';


const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');

  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (!user?.token) return;
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('/api/tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(response.data);
      } catch (error) {
        alert('Failed to fetch tasks.');
      }
    };

    const fetchSubjects = async () => {
      try {
        const response = await axiosInstance.get('/api/subjects', {
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

  return (
    <div className="container mx-auto p-6">
        <AssignmentStats tasks={tasks} />

        <TaskForm
          tasks={tasks}
          setTasks={setTasks}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          subjects={subjects}
        />

      <AssignmentFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        subjects={subjects}
      />  
    
      <TaskList tasks={filteredTasks} setTasks={setTasks} setEditingTask={setEditingTask} />
    </div>
  );
};

export default Tasks;
