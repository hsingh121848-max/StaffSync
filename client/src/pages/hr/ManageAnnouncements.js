import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const ManageAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'All',
    priority: 'Normal',
    expiresAt: '',
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.content) {
      setError('Please provide both announcement title and message content.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title,
        content: formData.content,
        targetAudience: formData.targetAudience,
        priority: formData.priority,
        expiresAt: formData.expiresAt || undefined,
      };

      await axiosClient.post('/announcements', payload);
      setSuccess('Announcement broadcast published successfully!');
      setFormData({
        title: '',
        content: '',
        targetAudience: 'All',
        priority: 'Normal',
        expiresAt: '',
      });
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete announcement: "${title}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await axiosClient.delete(`/announcements/${id}`);
      setSuccess('Announcement deleted successfully.');
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete announcement.');
    }
  };

  return (
    <AppLayout
      title="Company Announcements Management"
      subtitle="Broadcast organizational communications, policies, and system notices"
    >
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {/* Broadcast Creation Form */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h6 className="mb-0 fw-bold">Publish New Company Announcement</h6>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleCreateAnnouncement}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Headline / Title *</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  name="title"
                  required
                  placeholder="e.g. Q4 Townhall & Benefits Enrollment"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-bold">Target Audience</label>
                <select
                  className="form-select form-select-sm"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                >
                  <option value="All">All Staff (Company-wide)</option>
                  <option value="Employee">Employees Only</option>
                  <option value="Manager">Managers Only</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-bold">Priority Level</label>
                <select
                  className="form-select form-select-sm"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="col-md-12">
                <label className="form-label small fw-bold">Announcement Content *</label>
                <textarea
                  className="form-control form-control-sm"
                  rows="3"
                  name="content"
                  required
                  placeholder="Draft full announcement message details..."
                  value={formData.content}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Expiration Date (Optional)</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6 text-end d-flex align-items-end justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm px-4"
                  disabled={submitting}
                >
                  {submitting ? 'Publishing...' : 'Broadcast Announcement'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">Published Announcements ({announcements.length})</h6>
          <button onClick={fetchAnnouncements} className="btn btn-outline-secondary btn-sm">
            Refresh
          </button>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading announcements..." />
          ) : announcements.length === 0 ? (
            <EmptyState
              title="No announcements published"
              description="No active announcements in the system. Use the form above to broadcast one."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Title & Content</th>
                    <th>Audience</th>
                    <th>Priority</th>
                    <th>Published Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {announcements.map((item) => (
                    <tr key={item._id}>
                      <td style={{ maxWidth: '400px' }}>
                        <strong className="text-dark d-block">{item.title}</strong>
                        <p className="text-muted mb-0 small text-truncate">{item.content}</p>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {item.targetAudience}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.priority === 'Urgent'
                              ? 'bg-danger text-white'
                              : item.priority === 'High'
                              ? 'bg-warning text-dark'
                              : 'bg-secondary text-white'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-outline-danger btn-sm py-0 px-2"
                          onClick={() => handleDeleteAnnouncement(item._id, item.title)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ManageAnnouncements;