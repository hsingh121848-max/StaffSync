import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/attendance/my');
      setRecords(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setMessage('');
      setError('');
      const res = await axiosClient.post('/attendance/check-in', { notes: 'Standard Digital Check-in' });
      setMessage(res.data.message);
      fetchAttendance();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setMessage('');
      setError('');
      const res = await axiosClient.post('/attendance/check-out');
      setMessage(res.data.message);
      fetchAttendance();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

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
      title="Digital Attendance"
      subtitle="Punch daily check-in and check-out timestamps and view your attendance log"
    >
      <AlertMessage type="success" message={message} onClose={() => setMessage('')} />
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Clock & Action Punch Card */}
      <div className="card shadow-sm border-0 mb-4 bg-primary text-white">
        <div className="card-body p-4 text-center">
          <span className="small text-white-50 text-uppercase fw-bold">Live System Clock</span>
          <h1 className="display-5 fw-bold my-2">{currentTime}</h1>
          <p className="text-white-50 small mb-4">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="d-flex justify-content-center gap-3">
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="btn btn-light px-4 py-2 fw-bold text-primary shadow-sm"
            >
              {actionLoading ? 'Recording...' : 'Punch In (Check-In)'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="btn btn-outline-light px-4 py-2 fw-bold"
            >
              {actionLoading ? 'Recording...' : 'Punch Out (Check-Out)'}
            </button>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold h6">Attendance History</h5>
          <button onClick={fetchAttendance} className="btn btn-outline-secondary btn-sm">Refresh</button>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading attendance history..." />
          ) : records.length === 0 ? (
            <EmptyState
              title="No attendance records found"
              description="Click 'Punch In' above to record your first daily check-in timestamp."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Date</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Hours Worked</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td className="fw-semibold">{r.date}</td>
                      <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '—'}</td>
                      <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '—'}</td>
                      <td>{r.hoursWorked ? `${r.hoursWorked} hrs` : '0 hrs'}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(r.status)} px-2 py-1`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="text-muted">{r.notes || '—'}</td>
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

export default Attendance;
