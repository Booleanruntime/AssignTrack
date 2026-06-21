import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const actionLabel = (action) =>
  action
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).replace('_', ' '))
    .join(' ');

const formatDate = (value) =>
  new Date(value).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const ActivityLog = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;

    const fetchLogs = async () => {
      try {
        const response = await axiosInstance.get('/activity-logs', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch activity logs:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  return (
    <>
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Activity Log</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Recent actions recorded across AssignTrack.
        </p>
      </div>

      {loading ? (
        <p className="font-body-md text-body-md text-on-surface-variant">Loading...</p>
      ) : logs.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl px-lg py-xl text-center font-body-md text-body-md text-on-surface-variant">
          No activity has been recorded yet.
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm divide-y divide-outline-variant">
          {logs.map((log) => (
            <div key={log._id} className="px-lg py-md flex flex-col md:flex-row md:items-center justify-between gap-md">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-xs mb-xs">
                  <span className="font-label-sm text-label-sm px-2 py-[2px] rounded-full bg-primary/10 text-primary">
                    {actionLabel(log.action)}
                  </span>
                  <span className="font-label-sm text-label-sm px-2 py-[2px] rounded-full bg-surface-variant text-on-surface-variant">
                    {log.entityType}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface">{log.message}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                  {log.actor?.name || 'Unknown user'} · {log.actor?.email || 'No email'}
                </p>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                {formatDate(log.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ActivityLog;
