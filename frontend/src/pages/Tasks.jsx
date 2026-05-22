import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import { ASSIGNMENT_STATUSES } from '../constants/assignmentStatuses';

import {
  TextField,
  MenuItem,
  Stack,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');

  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
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
      <TaskForm
        tasks={tasks}
        setTasks={setTasks}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
        subjects={subjects}
      />


      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
  <FormControl sx={{ minWidth: 200 }}>
    <InputLabel id="status-filter-label">Filter by Status</InputLabel>
    <Select
      labelId="status-filter-label"
      value={statusFilter}
      label="Filter by Status"
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <MenuItem value="all">All Statuses</MenuItem>
      {Object.values(ASSIGNMENT_STATUSES).map((status) => (
        <MenuItem key={status} value={status}>
          {status}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <FormControl sx={{ minWidth: 200 }}>
    <InputLabel id="subject-filter-label">Filter by Subject</InputLabel>
    <Select
      labelId="subject-filter-label"
      value={subjectFilter}
      label="Filter by Subject"
      onChange={(e) => setSubjectFilter(e.target.value)}
    >
      <MenuItem value="all">All Subjects</MenuItem>
      {subjects.map((subject) => (
        <MenuItem key={subject._id} value={subject._id}>
          {subject.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <FormControl sx={{ minWidth: 200 }}>
    <InputLabel id="sort-order-label">Sort by Due Date</InputLabel>
    <Select
      labelId="sort-order-label"
      value={sortOrder}
      label="Sort by Due Date"
      onChange={(e) => setSortOrder(e.target.value)}
    >
      <MenuItem value="asc">Earliest First</MenuItem>
      <MenuItem value="desc">Latest First</MenuItem>
    </Select>
  </FormControl>
</Stack>

    {/* <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
      <TextField
        select
        label="Filter by Status"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="all">All Statuses</MenuItem>
        {Object.values(ASSIGNMENT_STATUSES).map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Filter by Subject"
        value={subjectFilter}
        onChange={(e) => setSubjectFilter(e.target.value)}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="all">All Subjects</MenuItem>
        {subjects.map((subject) => (
          <MenuItem key={subject._id} value={subject._id}>
            {subject.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Sort by Due Date"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="asc">Earliest First</MenuItem>
        <MenuItem value="desc">Latest First</MenuItem>
      </TextField>
  </Stack> */}


      <TaskList tasks={filteredTasks} setTasks={setTasks} setEditingTask={setEditingTask} />
    </div>
  );
};

export default Tasks;
