import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const Announcements = () => {
  const { role } = useSelector((state) => state.auth);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/announcements');
      setAnnouncements(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load company announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-danger';
      case 'High': return 'bg-warning text-dark';
      case 'Medium': return 'bg-primary';
      case 'Low': return 'bg-secondary';
      default: return 'bg-info text-dark';
    }
  };

  return (
    <AppLayout
      title="Company Announcements & Broadcasts"
      subtitle="Official notices, holiday updates, and organization-wide communications"
      actions={
        role === 'hr' ? (
          <Link to="/manage-announcements" className="btn btn-primary">
            + Author Announcement
          </Link>
        ) : null
      }
    >
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {loading ? (
        <LoadingSpinner message="Loading active announcements..." />
      ) : announcements.length === 0 ? (
        <EmptyState
          title="No company announcements"
          description="There are currently no active announcements published by HR."
        />
      ) : (
        <div className="row g-3">
          {announcements.map((ann) => (
            <div key={ann._id} className="col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`badge ${getPriorityBadge(ann.priority)} px-2 py-1`}>
                      {ann.priority} Priority
                    </span>
                    <span className="badge bg-light text-muted border">
                      Audience: {ann.targetAudience}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2">{ann.title}</h5>
                  <p className="text-muted small mb-3">{ann.content}</p>

                  <div className="pt-2 border-top text-muted small d-flex justify-content-between">
                    <span>Posted by: {ann.postedBy?.email || 'HR Administrator'}</span>
                    <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Announcements;
