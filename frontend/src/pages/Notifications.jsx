import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const typeLabel = (type) =>
  type
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatDate = (value) =>
  new Date(value).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };

  useEffect(() => {
    if (!user?.token) return;

    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get('/notifications', authHeader);
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markAsRead = async (notification) => {
    if (notification.isRead) return;
    try {
      const response = await axiosInstance.put(`/notifications/${notification._id}/read`, {}, authHeader);
      setNotifications((items) => items.map((item) => (
        item._id === notification._id ? response.data : item
      )));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to mark notification as read.');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/notifications/read-all', {}, authHeader);
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to mark notifications as read.');
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Notifications</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Updates about assignments, due dates and grading.
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center justify-center gap-xs px-md py-sm rounded-lg border border-outline-variant text-primary font-label-md text-label-md hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">done_all</span>
          Mark all read
        </button>
      </div>

      {loading ? (
        <p className="font-body-md text-body-md text-on-surface-variant">Loading...</p>
      ) : notifications.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl px-lg py-xl text-center font-body-md text-body-md text-on-surface-variant">
          No notifications yet.
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm divide-y divide-outline-variant">
          {notifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() => markAsRead(notification)}
              className={`w-full text-left px-lg py-md flex items-start justify-between gap-md transition-colors ${
                notification.isRead ? 'bg-surface-container-lowest' : 'bg-primary/5 hover:bg-primary/10'
              }`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-xs mb-xs">
                  <span className={`font-label-sm text-label-sm px-2 py-[2px] rounded-full ${
                    notification.isRead
                      ? 'bg-surface-variant text-on-surface-variant'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {typeLabel(notification.type)}
                  </span>
                  {!notification.isRead && (
                    <span className="font-label-sm text-label-sm px-2 py-[2px] rounded-full bg-error/10 text-error">
                      Unread
                    </span>
                  )}
                </div>
                <p className="font-title-md text-title-md text-on-surface">{notification.title}</p>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">{notification.message}</p>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                {formatDate(notification.createdAt)}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default Notifications;
