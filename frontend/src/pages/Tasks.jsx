import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import AssignmentStats from '../components/AssignmentStats';
import AssignmentFilters from '../components/AssignmentFilters';
import { getAssignmentSortStrategy } from '../utils/assignmentSortStrategies';

const Tasks = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');
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

  // The sidebar's "New Assignment" button routes here with this flag set.
  useEffect(() => {
    if (location.state?.openForm) {
      openTaskForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

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

  const openTaskForm = () => {
    setShowTaskForm(true);
    setTimeout(() => {
      taskFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-lg gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">My Assignments</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Track and manage every assignment across your subjects.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            openTaskForm();
          }}
          className="inline-flex items-center justify-center gap-xs bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Assignment
        </button>
      </div>

      <AssignmentStats tasks={tasks} />

      {showTaskForm && (
        <div ref={taskFormRef} className="mb-lg">
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

      <TaskList
        tasks={filteredTasks}
        setTasks={setTasks}
        setEditingTask={setEditingTask}
        openTaskForm={openTaskForm}
        highlightedTaskId={highlightedTaskId}
      />
    </>
  );
};

export default Tasks;
