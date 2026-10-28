import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const AllAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Design', 'Operations'];
  const statuses = ['Present', 'Late', 'Half-day', 'Absent'];

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        date: dateFilter || undefined,
        department: departmentFilter || undefined,
        status: statusFilter || undefined,
      };

      const res = await axiosClient.get('/attendance/all', { params });
      setRecords(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load company-wide attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [page, dateFilter, departmentFilter, statusFilter]);

  const resetFilters = () => {
    setDateFilter('');
    setDepartmentFilter('');
    setStatusFilter('');
    setPage(1);
  };

  return (
    <AppLayout
      title="Attendance Audit Log"
      subtitle="Organization-wide daily attendance monitoring and verification"
    >
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Filter Toolbar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-3">
              <label className="form-label small fw-bold mb-1">Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold mb-1">Department</label>
              <select
                className="form-select form-select-sm"
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold mb-1">Status</label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end pt-3">
              <button
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">Audit Records ({records.length})</h6>
          <button onClick={fetchAttendance} className="btn btn-outline-secondary btn-sm">
            Refresh
          </button>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Querying attendance logs..." />
          ) : records.length === 0 ? (
            <EmptyState
              title="No attendance records found"
              description="No attendance records match the specified filters."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Department</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {records.map((rec) => {
                    const emp = rec.employeeId;
                    return (
                      <tr key={rec._id}>
                        <td className="fw-semibold">{rec.date}</td>
                        <td>
                          {emp ? (
                            <div>
                              <strong className="text-dark">
                                {emp.firstName} {emp.lastName}
                              </strong>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                {emp.designation}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted">Unknown Employee</span>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {emp?.employeeId || '—'}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-dark">
                            {emp?.department || '—'}
                          </span>
                        </td>
                        <td>
                          {rec.checkIn ? (
                            <span className="text-dark">
                              {new Date(rec.checkIn).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          {rec.checkOut ? (
                            <span className="text-dark">
                              {new Date(rec.checkOut).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          ) : (
                            <span className="text-muted fst-italic">Active</span>
                          )}
                        </td>
                        <td>
                          {rec.workingHours > 0 ? (
                            <span>{rec.workingHours.toFixed(1)} hrs</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              rec.status === 'Present'
                                ? 'bg-success-subtle text-success'
                                : rec.status === 'Late'
                                ? 'bg-warning-subtle text-warning'
                                : rec.status === 'Half-day'
                                ? 'bg-info-subtle text-info'
                                : 'bg-danger-subtle text-danger'
                            }`}
                          >
                            {rec.status}
                          </span>
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

export default AllAttendance;