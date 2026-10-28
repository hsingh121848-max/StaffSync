import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import axiosClient from '../../api/axiosClient';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/reports/analytics');
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch workforce analytics report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalEmployees = data?.workforce?.totalEmployees || 0;
  const totalManagers = data?.workforce?.totalManagers || 0;
  const activeUsers = data?.workforce?.activeUsers || 0;
  const activeTrainings = data?.activeTrainings || 0;

  const departmentBreakdown = data?.departmentBreakdown || [];
  const attendanceBreakdown = data?.todayAttendance?.breakdown || [];
  const leaveRequests = data?.leaveRequests || [];

  return (
    <AppLayout
      title="Workforce Reports & Analytics"
      subtitle="Executive organizational metrics, headcount distribution, and operational KPIs"
    >
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <span className="small text-muted">
          Report Generated: <strong>{new Date().toLocaleDateString()}</strong>
        </span>
        <div className="d-flex gap-2">
          <button onClick={fetchAnalytics} className="btn btn-outline-secondary btn-sm">
            Refresh Data
          </button>
          <button
            onClick={() => window.print()}
            className="btn btn-primary btn-sm"
          >
            Export / Print Report
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Aggregating workforce analytics..." />
      ) : (
        <>
          {/* Executive Overview Cards */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-xl-3">
              <div className="card h-100 border-0 shadow-sm border-start border-primary border-4">
                <div className="card-body">
                  <span className="text-muted small fw-bold text-uppercase">Total Headcount</span>
                  <h3 className="h3 fw-bold mt-2 mb-0">{totalEmployees}</h3>
                  <small className="text-muted">Registered Employees</small>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="card h-100 border-0 shadow-sm border-start border-success border-4">
                <div className="card-body">
                  <span className="text-muted small fw-bold text-uppercase">Supervisors & Leads</span>
                  <h3 className="h3 fw-bold mt-2 mb-0">{totalManagers}</h3>
                  <small className="text-muted">Assigned Managers</small>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="card h-100 border-0 shadow-sm border-start border-info border-4">
                <div className="card-body">
                  <span className="text-muted small fw-bold text-uppercase">Active User Accounts</span>
                  <h3 className="h3 fw-bold mt-2 mb-0">{activeUsers}</h3>
                  <small className="text-muted">Portal Accounts Enabled</small>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="card h-100 border-0 shadow-sm border-start border-warning border-4">
                <div className="card-body">
                  <span className="text-muted small fw-bold text-uppercase">Active Training Curricula</span>
                  <h3 className="h3 fw-bold mt-2 mb-0">{activeTrainings}</h3>
                  <small className="text-muted">Ongoing Courses</small>
                </div>
              </div>
            </div>
          </div>

          {/* Department Distribution & Attendance */}
          <div className="row g-4 mb-4">
            {/* Department Breakdown */}
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white py-3">
                  <h6 className="mb-0 fw-bold">Department Headcount Distribution</h6>
                </div>
                <div className="card-body">
                  {departmentBreakdown.length === 0 ? (
                    <p className="text-muted small mb-0">No department data recorded yet.</p>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {departmentBreakdown.map((dept) => {
                        const percent = totalEmployees > 0
                          ? Math.round((dept.count / totalEmployees) * 100)
                          : 0;
                        return (
                          <div key={dept._id || 'Unassigned'}>
                            <div className="d-flex justify-content-between small fw-semibold mb-1">
                              <span>{dept._id || 'Unassigned'}</span>
                              <span className="text-muted">
                                {dept.count} staff ({percent}%)
                              </span>
                            </div>
                            <div className="progress" style={{ height: '8px' }}>
                              <div
                                className="progress-bar bg-primary"
                                role="progressbar"
                                style={{ width: `${percent}%` }}
                                aria-valuenow={percent}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Today's Attendance Overview */}
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white py-3">
                  <h6 className="mb-0 fw-bold">
                    Today's Attendance Status ({data?.todayAttendance?.date || 'Current Date'})
                  </h6>
                </div>
                <div className="card-body">
                  {attendanceBreakdown.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <p className="mb-0 small">No attendance activity recorded for today.</p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {attendanceBreakdown.map((stat) => (
                        <div key={stat._id} className="col-6">
                          <div className="p-3 border rounded text-center">
                            <span
                              className={`badge mb-2 ${
                                stat._id === 'Present'
                                  ? 'bg-success-subtle text-success'
                                  : stat._id === 'Late'
                                  ? 'bg-warning-subtle text-warning'
                                  : stat._id === 'Half-day'
                                  ? 'bg-info-subtle text-info'
                                  : 'bg-danger-subtle text-danger'
                              }`}
                            >
                              {stat._id}
                            </span>
                            <h4 className="h4 fw-bold mb-0">{stat.count}</h4>
                            <small className="text-muted">Employees</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Leave Requests Pipeline Overview */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0 fw-bold">Enterprise Leave Pipeline Summary</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {['Pending', 'Approved', 'Rejected'].map((status) => {
                  const item = leaveRequests.find((l) => l._id === status);
                  const count = item?.count || 0;
                  return (
                    <div key={status} className="col-md-4">
                      <div className="p-3 border rounded text-center">
                        <span className="text-muted small fw-bold text-uppercase d-block mb-1">
                          {status} Requests
                        </span>
                        <h3 className="h3 fw-bold mb-1">{count}</h3>
                        <span
                          className={`badge ${
                            status === 'Approved'
                              ? 'bg-success'
                              : status === 'Pending'
                              ? 'bg-warning text-dark'
                              : 'bg-danger'
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default Reports;