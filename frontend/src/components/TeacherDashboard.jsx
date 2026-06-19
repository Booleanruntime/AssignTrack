import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// a teacher's home view: what's waiting to be marked, what they've already
// graded, and the subjects they run. all of it comes from endpoints that
// already scope to this teacher, so there's nothing student-specific here.
const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!user?.token) return;
    const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

    const load = async () => {
      try {
        const [queueRes, gradesRes, subjectsRes] = await Promise.all([
          axiosInstance.get('/tasks/gradeable', authHeader),
          axiosInstance.get('/grades', authHeader),
          axiosInstance.get('/subjects', authHeader),
        ]);
        setQueue(queueRes.data);
        setGrades(gradesRes.data);
        // only the subjects this teacher is on the roster for
        setSubjects(
          subjectsRes.data.filter((s) =>
            (s.teachers || []).some((t) => (t._id || t) === user.id)
          )
        );
      } catch (error) {
        console.error('Failed to load teacher dashboard:', error.response?.data || error.message);
      }
    };
    load();
  }, [user]);

  const recentGrades = [...grades]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const stats = [
    { label: 'Awaiting Grading', value: queue.length, icon: 'pending_actions', accent: 'text-primary' },
    { label: 'Grades Given', value: grades.length, icon: 'task_alt', accent: 'text-on-tertiary-container' },
    { label: 'Subjects You Teach', value: subjects.length, icon: 'menu_book', accent: 'text-on-surface-variant' },
  ];

  return (
    <>
      <section className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-semibold text-primary">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'}.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
            {queue.length === 0
              ? 'No assignments are waiting to be graded.'
              : `You have ${queue.length} ${queue.length === 1 ? 'assignment' : 'assignments'} waiting to be graded.`}
          </p>
        </div>
        <button
          onClick={() => navigate('/teacher/grading')}
          className="w-full md:w-auto bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg flex items-center justify-center gap-xs hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">grading</span>
          Open Grading
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-md">
          {stats.map(({ label, value, icon, accent }) => (
            <div
              key={label}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.05)] transition-shadow duration-300"
            >
              <div className={`flex items-center gap-xs mb-lg ${accent}`}>
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">{label}</span>
              </div>
              <span className="font-display-lg text-display-lg text-primary">{value}</span>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 lg:row-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col overflow-hidden">
          <div className="p-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h3 className="font-title-lg text-title-lg text-primary">Awaiting Grading</h3>
          </div>
          <div className="flex flex-col flex-1">
            {queue.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-lg text-on-surface-variant font-body-md text-body-md text-center">
                Nothing waiting. You're all caught up.
              </div>
            ) : (
              queue.slice(0, 6).map((task) => (
                <button
                  key={task._id}
                  onClick={() => navigate('/teacher/grading')}
                  className="text-left p-md border-b border-outline-variant last:border-b-0 hover:bg-surface-bright transition-colors"
                >
                  <div className="flex justify-between items-start gap-sm mb-xs">
                    <h4 className="font-label-md text-label-md text-primary font-bold">{task.title}</h4>
                    <span className="font-label-sm text-label-sm px-2 py-1 rounded-full whitespace-nowrap bg-primary/10 text-primary">
                      Submitted
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <span className="font-body-sm text-body-sm">{task.user?.name || 'Student'}</span>
                    <span className="font-body-sm text-body-sm">{task.subject?.name}</span>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="p-sm border-t border-outline-variant bg-surface-container-low mt-auto">
            <button
              onClick={() => navigate('/teacher/grading')}
              className="block w-full text-center font-label-md text-label-md text-primary hover:bg-surface-variant py-2 rounded-lg transition-colors"
            >
              Go to Grading
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg min-h-[260px] flex flex-col">
          <h3 className="font-title-lg text-title-lg text-primary mb-md">Recently Graded</h3>
          {recentGrades.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant flex-col gap-md border-2 border-dashed border-outline-variant rounded-lg bg-surface">
              <span className="material-symbols-outlined text-display-lg text-outline">grading</span>
              <p className="font-body-md text-body-md text-center max-w-md">
                No grades yet. Mark a submitted assignment to see it here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {recentGrades.map((grade) => (
                <div key={grade._id} className="flex items-center justify-between py-sm gap-md">
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md text-on-surface font-medium truncate">
                      {grade.task?.title || 'Assignment'}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {grade.student?.name} · {grade.subject?.name}
                    </p>
                  </div>
                  <span className={`font-label-sm text-label-sm px-2 py-1 rounded-full whitespace-nowrap ${
                    grade.passed ? 'bg-tertiary-fixed-dim/30 text-on-tertiary-container' : 'bg-error/10 text-error'
                  }`}>
                    {grade.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeacherDashboard;
