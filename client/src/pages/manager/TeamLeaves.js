import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const TeamLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/leaves/team?status=${statusFilter}` : '/leaves/team';
      const res = await axiosClient.get(url);
      setLeaves(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load team leave applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const handleReviewAction = async (status) => {
    if (!selectedLeave) return;

    try {
      setProcessing(true);
      setError('');
      setMessage('');

      const res = await axiosClient.put(`/leaves/${selectedLeave._id}/status`, {
        status,
        reviewRemarks: remarks,
      });

      setMessage(res.data.message || `Leave application ${status.toLowerCase()} successfully.`);
      setSelectedLeave(null);
      setRemarks('');
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave status.');
    } finally {
      setProcessing(false);
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
      title="Team Leave Requests Review"
      subtitle="Review, approve, or reject leave applications submitted by your direct reports"
      actions={
        <div className="d-flex align-items-center gap-2">
          <label className="small fw-semibold text-muted mb-0">Status:</label>
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      }
    >
      <AlertMessage type="success" message={message} onClose={() => setMessage('')} />
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Review Modal Dialog */}
      {selectedLeave && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Review Leave Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedLeave(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-2">
                  <strong>Applicant:</strong>{' '}
                  {selectedLeave.employeeId
                    ? `${selectedLeave.employeeId.firstName} ${selectedLeave.employeeId.lastName} (${selectedLeave.employeeId.employeeId})`
                    : 'Employee'}
                </p>
                <p className="mb-2">
                  <strong>Leave Type:</strong> {selectedLeave.leaveType} ({selectedLeave.totalDays} day(s))
                </p>
                <p className="mb-2">
                  <strong>Duration:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} &rarr; {new Date(selectedLeave.endDate).toLocaleDateString()}
                </p>
                <p className="mb-3">
                  <strong>Reason:</strong> <span className="text-muted">{selectedLeave.reason}</span>
                </p>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" htmlFor="remarks">
                    Reviewer Feedback / Remarks (Optional)
                  </label>
                  <textarea
                    id="remarks"
                    className="form-control"
                    rows="2"
                    placeholder="Enter approval conditions or rejection justification..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedLeave(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={processing}
                  onClick={() => handleReviewAction('Rejected')}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  disabled={processing}
                  onClick={() => handleReviewAction('Approved')}
                >
                  Approve Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold h6">Leave Applications ({leaves.length})</h5>
          <button onClick={fetchLeaves} className="btn btn-outline-secondary btn-sm">Refresh</button>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Fetching leave requests..." />
          ) : leaves.length === 0 ? (
            <EmptyState
              title="No leave applications found"
              description="There are currently no leave requests matching the selected filter."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Applicant</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {leaves.map((l) => (
                    <tr key={l._id}>
                      <td className="fw-semibold">
                        {l.employeeId ? `${l.employeeId.firstName} ${l.employeeId.lastName}` : '—'}
                      </td>
                      <td>{l.leaveType}</td>
                      <td>
                        {new Date(l.startDate).toLocaleDateString()} &rarr; {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td>{l.totalDays} day(s)</td>
                      <td className="text-muted" style={{ maxWidth: '180px' }}>{l.reason}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(l.status)} px-2 py-1`}>
                          {l.status}
                        </span>
                      </td>
                      <td>
                        {l.status === 'Pending' ? (
                          <button
                            onClick={() => {
                              setSelectedLeave(l);
                              setRemarks(l.reviewRemarks || '');
                            }}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Review
                          </button>
                        ) : (
                          <span className="text-muted small">Reviewed</span>
                        )}
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

export default TeamLeaves;
