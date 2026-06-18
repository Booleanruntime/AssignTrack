import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import AssignmentStats from '../components/AssignmentStats';
import AssignmentFilters from '../components/AssignmentFilters';
import { getAssignmentSortStrategy } from '../utils/assignmentSortStrategies';

// a student's assigned work. assignments are set by teachers and land here
// automatically once the student is enrolled in the subject - students track
// their progress and submit, but don't create or delete the work itself.
const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.token) return;
    const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('/tasks', authHeader);
        setTasks(response.data);
      } catch (error) {
        alert('Failed to fetch assignments.');
      }
    };

    const fetchSubjects = async () => {
      try {
        const response = await axiosInstance.get('/subjects', authHeader);
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
    .filter((task) => {
      if (!search.trim()) return true;
      return task.title.toLowerCase().includes(search.trim().toLowerCase());
    })
    .sort(getAssignmentSortStrategy(sortOrder));

  return (
    <>
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">My Assignments</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Work your teachers have set. Track your progress and submit when you're ready.
        </p>
      </div>

      <AssignmentStats tasks={tasks} />

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg space-y-md">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="w-full pl-10 pr-4 py-sm bg-surface-container-low border border-outline-variant rounded-full font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        <AssignmentFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          subjectFilter={subjectFilter}
          setSubjectFilter={setSubjectFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          subjects={subjects}
        />
      </div>

      <TaskList tasks={filteredTasks} setTasks={setTasks} />
    </>
  );
};

export default Tasks;
