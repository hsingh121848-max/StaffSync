import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axiosClient.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      setError('Could not mark notification as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      await axiosClient.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setMessage('All notifications marked as read.');
    } catch (err) {
      setError('Failed to mark all as read.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppLayout
      title="System Notifications"
      subtitle="Track automated workflow alerts, leave decisions, and training updates"
      actions={
        notifications.some((n) => !n.isRead) ? (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading}
            className="btn btn-outline-secondary btn-sm"
          >
            Mark All as Read
          </button>
        ) : null
      }
    >
      <AlertMessage type="success" message={message} onClose={() => setMessage('')} />
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {loading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You are completely caught up! New alerts regarding leaves and attendance will appear here."
        />
      ) : (
        <div className="card shadow-sm border-0">
          <ul className="list-group list-group-flush">
            {notifications.map((n) => (
              <li
                key={n._id}
                className={`list-group-item p-3 d-flex justify-content-between align-items-center ${
                  !n.isRead ? 'bg-light border-start border-primary border-4' : ''
                }`}
              >
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-secondary">{n.type}</span>
                    <strong className="text-dark small">{n.title}</strong>
                    {!n.isRead && <span className="badge bg-primary">New</span>}
                  </div>
                  <p className="text-muted small mb-1">{n.message}</p>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </small>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="btn btn-sm btn-link text-decoration-none text-primary"
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppLayout>
  );
};

export default Notifications;
