import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { ASSIGNMENT_STATUSES } from '../constants/assignmentStatuses';


const PRIORITY_BADGE = {
  High: 'bg-primary/10 text-primary',
  Medium: 'bg-surface-variant text-on-surface-variant',
  Low: 'bg-surface-variant text-on-surface-variant',
};

// Maps each status to the icon + accent colour used on its count card.
const STATUS_CARDS = [
  { status: ASSIGNMENT_STATUSES.NOT_STARTED, icon: 'radio_button_unchecked', accent: 'text-on-surface-variant' },
  { status: ASSIGNMENT_STATUSES.IN_PROGRESS, icon: 'timelapse', accent: 'text-primary' },
  { status: ASSIGNMENT_STATUSES.COMPLETED, icon: 'check_circle', accent: 'text-on-tertiary-container' },
  { status: ASSIGNMENT_STATUSES.OVERDUE, icon: 'error', accent: 'text-error' },
];

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Turns a deadline into a short relative label like "Due Tomorrow" / "In 3 Days".
const dueLabel = (deadline) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (days < 0) return { text: 'Overdue', tone: 'bg-error/10 text-error' };
  if (days === 0) return { text: 'Due Today', tone: 'bg-error/10 text-error' };
  if (days === 1) return { text: 'Due Tomorrow', tone: 'bg-error/10 text-error' };
  if (days <= 3) return { text: `In ${days} Days`, tone: 'bg-primary/10 text-primary' };
  return { text: `In ${days} Days`, tone: 'bg-surface-variant text-on-surface-variant' };
};

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user?.token) return;
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('/tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(response.data);
      } catch (error) {
        alert('Failed to fetch assignments.');
      }
    };
    fetchTasks();
  }, [user]);

  const countByStatus = (status) => tasks.filter((task) => task.status === status).length;

  const total = tasks.length;
  const completed = countByStatus(ASSIGNMENT_STATUSES.COMPLETED);
  const completion = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Upcoming = not-yet-completed work, soonest deadline first.
  const upcoming = [...tasks]
    .filter((task) => task.status !== ASSIGNMENT_STATUSES.COMPLETED)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <>
      <section className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-semibold text-primary">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'}.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
            You have {total} {total === 1 ? 'assignment' : 'assignments'} tracked this term.
          </p>
        </div>
        <div className="w-full md:w-72 bg-surface-container-lowest p-md border border-outline-variant rounded-xl flex flex-col gap-sm">
          <div className="flex justify-between items-center">
            <span className="font-label-md text-label-md text-on-surface-variant">Term Completion</span>
            <span className="font-label-md text-label-md font-bold text-primary">{completion}%</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${completion}%` }}></div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-md">
          {STATUS_CARDS.map(({ status, icon, accent }) => {
            const isOverdue = status === ASSIGNMENT_STATUSES.OVERDUE;
            return (
              <div
                key={status}
                className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.05)] transition-shadow duration-300 ${
                  isOverdue ? 'bg-error-container/20' : ''
                }`}
              >
                <div className={`flex items-center gap-xs mb-lg ${accent}`}>
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider">{status}</span>
                </div>
                <span className={`font-display-lg text-display-lg ${isOverdue ? 'text-error' : 'text-primary'}`}>
                  {countByStatus(status)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-4 lg:row-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col overflow-hidden">
          <div className="p-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h3 className="font-title-lg text-title-lg text-primary">Upcoming Deadlines</h3>
          </div>
          <div className="flex flex-col flex-1">
            {upcoming.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-lg text-on-surface-variant font-body-md text-body-md text-center">
                Nothing due. You're all caught up.
              </div>
            ) : (
              upcoming.map((task) => {
                const label = dueLabel(task.deadline);
                return (
                  <div key={task._id} className="p-md border-b border-outline-variant last:border-b-0">
                    <div className="flex justify-between items-start mb-sm gap-sm">
                      <h4 className="font-label-md text-label-md text-primary font-bold">{task.title}</h4>
                      <span className={`font-label-sm text-label-sm px-2 py-1 rounded-full whitespace-nowrap ${label.tone}`}>
                        {label.text}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span className="font-body-sm text-body-sm">{task.subject?.name || 'No subject'}</span>
                      <span className="font-body-sm text-body-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="p-sm border-t border-outline-variant bg-surface-container-low mt-auto">
            <Link
              to="/tasks"
              className="block w-full text-center font-label-md text-label-md text-primary hover:bg-surface-variant py-2 rounded-lg transition-colors"
            >
              View All Assignments
            </Link>
          </div>
        </div>

        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg min-h-[260px] flex flex-col">
          <h3 className="font-title-lg text-title-lg text-primary mb-md">Recent Assignments</h3>
          {tasks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant flex-col gap-md border-2 border-dashed border-outline-variant rounded-lg bg-surface">
              <span className="material-symbols-outlined text-display-lg text-outline">assignment</span>
              <p className="font-body-md text-body-md text-center max-w-md">
                No assignments yet. Create one to start tracking your term.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {[...tasks]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((task) => (
                  <div key={task._id} className="grid grid-cols-[1fr_120px_120px] items-center py-sm gap-md">
                    <div className="min-w-0">
                      <p className="font-label-md text-label-md text-on-surface font-medium truncate">{task.title}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{task.subject?.name || 'No subject'}</p>                       
                    </div> 
                    <div className="flex justify-center">                   
                    <span
                        className={`inline-block font-label-sm text-label-sm px-2 py-1 rounded-full whitespace-nowrap ${
                          PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.Low
                        }`}
                      >
                        {task.priority  || 'Low'}
                    </span>     
                    </div>
                    <div className="flex justify-end">                                                        
                    <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{task.status}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
