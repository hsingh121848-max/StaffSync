import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/leaves/my');
      setLeaves(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your leave records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill in all required leave fields.');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Leave start date cannot be after end date.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setMessage('');

      const res = await axiosClient.post('/leaves', formData);
      setMessage(res.data.message || 'Leave request submitted successfully.');
      setShowModal(false);
      setFormData({ leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return 'bg-success';
      case 'Rejected': return 'bg-danger';
      case 'Pending': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  };

  return (
    <AppLayout
      title="Leave Management"
      subtitle="Apply for leave, track approval status, and review remarks"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          + Request Leave
        </button>
      }
    >
      <AlertMessage type="success" message={message} onClose={() => setMessage('')} />
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Leave Application Modal Dialog */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Submit Leave Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold" htmlFor="leaveType">Leave Type</label>
                    <select
                      id="leaveType"
                      name="leaveType"
                      className="form-select"
                      value={formData.leaveType}
                      onChange={handleChange}
                    >
                      <option value="Casual">Casual Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Annual">Annual / Vacation Leave</option>
                      <option value="Unpaid">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold" htmlFor="startDate">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        className="form-control"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold" htmlFor="endDate">End Date</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        className="form-control"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold" htmlFor="reason">Reason for Leave</label>
                    <textarea
                      id="reason"
                      name="reason"
                      rows="3"
                      className="form-control"
                      placeholder="Please explain the reason for taking leave..."
                      value={formData.reason}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Leaves History Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold h6">Leave Applications History</h5>
          <button onClick={fetchLeaves} className="btn btn-outline-secondary btn-sm">Refresh</button>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading leave history..." />
          ) : leaves.length === 0 ? (
            <EmptyState
              title="No leave requests submitted"
              description="Click '+ Request Leave' to apply for upcoming leaves."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Type</th>
                    <th>Date Range</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Reviewer Remarks</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {leaves.map((l) => (
                    <tr key={l._id}>
                      <td className="fw-semibold">{l.leaveType}</td>
                      <td>
                        {new Date(l.startDate).toLocaleDateString()} &rarr; {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td>{l.totalDays} day(s)</td>
                      <td className="text-muted" style={{ maxWidth: '200px' }}>{l.reason}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(l.status)} px-2 py-1`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="text-muted">{l.reviewRemarks || '—'}</td>
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

export default Leaves;
