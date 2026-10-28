import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const AllLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Review Modal / Inline Action State
  const [activeReviewLeave, setActiveReviewLeave] = useState(null);
  const [reviewComments, setReviewComments] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        status: statusFilter || undefined,
      };

      const res = await axiosClient.get('/leaves/all', { params });
      setLeaves(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load company leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (status) => {
    if (!activeReviewLeave) return;
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await axiosClient.put(`/leaves/${activeReviewLeave._id}/status`, {
        status,
        comments: reviewComments || `Marked as ${status} by HR Administration`,
      });

      setSuccess(`Leave application for ${activeReviewLeave.employeeId?.firstName || 'Employee'} marked as ${status}.`);
      setActiveReviewLeave(null);
      setReviewComments('');
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave request status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppLayout
      title="Company Leave Oversight"
      subtitle="Review, approve, and track employee leave requests enterprise-wide"
    >
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {/* Review Dialog Card */}
      {activeReviewLeave && (
        <div className="card shadow border-0 mb-4 border-top border-primary border-4">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">
              Review Leave Application: {activeReviewLeave.employeeId?.firstName} {activeReviewLeave.employeeId?.lastName}
            </h6>
            <button
              className="btn btn-close btn-sm"
              onClick={() => setActiveReviewLeave(null)}
            ></button>
          </div>
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-md-6">
                <p className="mb-1 small">
                  <strong>Type:</strong> {activeReviewLeave.leaveType}
                </p>
                <p className="mb-1 small">
                  <strong>Dates:</strong> {new Date(activeReviewLeave.startDate).toLocaleDateString()} to {new Date(activeReviewLeave.endDate).toLocaleDateString()} ({activeReviewLeave.durationDays} days)
                </p>
                <p className="mb-1 small">
                  <strong>Reason:</strong> {activeReviewLeave.reason}
                </p>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">HR Review Comments</label>
                <input
                  type="text"
                  className="form-control form-control-sm mb-3"
                  placeholder="e.g. Approved per annual leave policy"
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                />
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setActiveReviewLeave(null)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleUpdateStatus('Rejected')}
                    disabled={actionLoading}
                  >
                    Reject Application
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleUpdateStatus('Approved')}
                    disabled={actionLoading}
                  >
                    Approve Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => {
                setStatusFilter('');
                setPage(1);
              }}
            >
              All Applications
            </button>
            <button
              className={`btn ${statusFilter === 'Pending' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
              onClick={() => {
                setStatusFilter('Pending');
                setPage(1);
              }}
            >
              Pending
            </button>
            <button
              className={`btn ${statusFilter === 'Approved' ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => {
                setStatusFilter('Approved');
                setPage(1);
              }}
            >
              Approved
            </button>
            <button
              className={`btn ${statusFilter === 'Rejected' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => {
                setStatusFilter('Rejected');
                setPage(1);
              }}
            >
              Rejected
            </button>
          </div>
          <button onClick={fetchLeaves} className="btn btn-outline-secondary btn-sm">
            Refresh
          </button>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading leave applications..." />
          ) : leaves.length === 0 ? (
            <EmptyState
              title="No leave requests found"
              description={statusFilter ? `No requests match status '${statusFilter}'.` : 'No leave applications have been submitted.'}
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {leaves.map((l) => {
                    const emp = l.employeeId;
                    return (
                      <tr key={l._id}>
                        <td>
                          {emp ? (
                            <div>
                              <strong className="text-dark">
                                {emp.firstName} {emp.lastName}
                              </strong>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                {emp.employeeId} &bull; {emp.department}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted">Staff Member</span>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {l.leaveType}
                          </span>
                        </td>
                        <td>{l.durationDays} day(s)</td>
                        <td>
                          {new Date(l.startDate).toLocaleDateString()} &ndash;{' '}
                          {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td style={{ maxWidth: '200px' }} className="text-truncate">
                          {l.reason}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              l.status === 'Approved'
                                ? 'bg-success-subtle text-success'
                                : l.status === 'Rejected'
                                ? 'bg-danger-subtle text-danger'
                                : 'bg-warning-subtle text-warning'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td>
                          {l.status === 'Pending' ? (
                            <button
                              className="btn btn-outline-primary btn-sm py-0 px-2"
                              onClick={() => {
                                setActiveReviewLeave(l);
                                setReviewComments('');
                              }}
                            >
                              Review
                            </button>
                          ) : (
                            <span className="text-muted small">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-3 border-top d-flex justify-content-between align-items-center">
              <span className="small text-muted">
                Page {page} of {totalPages}
              </span>
              <div className="btn-group btn-group-sm">
                <button
                  className="btn btn-outline-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  &larr; Previous
                </button>
                <button
                  className="btn btn-outline-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AllLeaves;