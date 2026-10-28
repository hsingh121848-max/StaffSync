import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const TeamAttendance = () => {
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosClient.get(`/attendance/team?date=${date}`);
      setRecords(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load team attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present': return 'bg-success';
      case 'Late': return 'bg-warning text-dark';
      case 'Half-day': return 'bg-info text-dark';
      case 'Absent': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <AppLayout
      title="Team Attendance Monitor"
      subtitle="Inspect daily check-ins, check-outs, and hours worked by direct reports"
      actions={
        <div className="d-flex align-items-center gap-2">
          <label className="small fw-semibold text-muted mb-0">Date:</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      }
    >
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold h6">Attendance Logs for {date}</h5>
          <span className="badge bg-primary">{records.length} logs recorded</span>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Fetching team attendance..." />
          ) : records.length === 0 ? (
            <EmptyState
              title={`No attendance logs recorded for ${date}`}
              description="None of your team members have punched attendance for this calendar date."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Hours Worked</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td className="fw-semibold">
                        {r.employeeId ? `${r.employeeId.firstName} ${r.employeeId.lastName}` : '—'}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {r.employeeId?.employeeId || '—'}
                        </span>
                      </td>
                      <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '—'}</td>
                      <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '—'}</td>
                      <td>{r.hoursWorked ? `${r.hoursWorked} hrs` : '0 hrs'}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(r.status)} px-2 py-1`}>
                          {r.status}
                        </span>
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

export default TeamAttendance;
