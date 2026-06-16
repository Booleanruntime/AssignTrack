import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import GradeForm from '../components/GradeForm';

// teacher's grading workspace - the tasks under their subjects on the left,
// a grade form when they pick one.
const TeacherGrading = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [grading, setGrading] = useState(null);
  const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };

  useEffect(() => {
    if (!user?.token) return;
    const fetchGradeable = async () => {
      try {
        const response = await axiosInstance.get('/tasks/gradeable', authHeader);
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch gradeable tasks:', error.response?.data || error.message);
      }
    };
    fetchGradeable();
  }, [user]);

  const handleSubmitGrade = async (payload) => {
    try {
      await axiosInstance.post('/grades', payload, authHeader);
      setGrading(null);
      alert('Grade submitted.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit grade.');
    }
  };

  return (
    <>
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Grading</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Assignments from the subjects you teach.
        </p>
      </div>

      {grading ? (
        <GradeForm task={grading} onSubmit={handleSubmitGrade} onCancel={() => setGrading(null)} />
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm divide-y divide-outline-variant">
          {tasks.length === 0 && (
            <div className="px-lg py-xl text-center font-body-md text-body-md text-on-surface-variant">
              No tasks to grade yet. They appear once students add assignments to your subjects.
            </div>
          )}
          {tasks.map((task) => (
            <div key={task._id} className="flex items-center justify-between px-lg py-md hover:bg-surface-bright transition-colors">
              <div>
                <p className="font-title-lg text-title-lg text-on-surface">{task.title}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {task.user?.name} · {task.subject?.name} · {task.status}
                </p>
              </div>
              <button
                onClick={() => setGrading(task)}
                className="px-md py-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity"
              >
                Grade
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default TeacherGrading;
