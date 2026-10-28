import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import axiosClient from '../../api/axiosClient';

const Dashboard = () => {
  const { user, role } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, announcementsRes] = await Promise.all([
          axiosClient.get('/dashboard/stats'),
          axiosClient.get('/announcements'),
        ]);

        setStats(statsRes.data.data);
        setAnnouncements(announcementsRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load live dashboard data. Verify backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AppLayout
      title={`Welcome back, ${user?.email || 'User'}`}
      subtitle={`StaffSync Portal — ${role ? role.toUpperCase() : 'USER'} Workspace`}
    >
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {loading ? (
        <LoadingSpinner message="Loading dashboard statistics..." />
      ) : (
        <>
          {/* Role: Employee Dashboard Cards */}
          {role === 'employee' && (
            <div className="row g-3 mb-4">
              <div className="col-sm-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm border-start border-primary border-4">
                  <div className="card-body">
                    <span className="text-muted small fw-semibold text-uppercase">Today's Attendance</span>
                    <h3 className="h4 fw-bold mt-2 mb-1">
                      <span className={`badge ${stats?.todayAttendance === 'Present' ? 'bg-success' : stats?.todayAttendance === 'Late' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {stats?.todayAttendance || 'Not Marked'}
                      </span>
                    </h3>
                    <Link to="/attendance" className="small text-primary text-decoration-none fw-semibold">
                      Record punch &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm border-start border-warning border-4">
                  <div className="card-body">
                    <span className="text-muted small fw-semibold text-uppercase">Pending Leaves</span>
                    <h3 className="h3 fw-bold mt-2 mb-1">{stats?.pendingLeaves ?? 0}</h3>
                    <Link to="/leaves" className="small text-warning text-decoration-none fw-semibold">
                      View requests &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm border-start border-info border-4">
                  <div className="card-body">
                    <span className="text-muted small fw-semibold text-uppercase">Enrolled Trainings</span>
                    <h3 className="h3 fw-bold mt-2 mb-1">{stats?.enrolledTrainings ?? 0}</h3>
                    <Link to="/trainings" className="small text-info text-decoration-none fw-semibold">
                      Training center &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm border-start border-danger border-4">
                  <div className="card-body">
                    <span className="text-muted small fw-semibold text-uppercase">Unread Notifications</span>
                    <h3 className="h3 fw-bold mt-2 mb-1">{stats?.unreadNotifications ?? 0}</h3>
                    <Link to="/notifications" className="small text-danger text-decoration-none fw-semibold">
                      Check alerts &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Role: Manager Dashboard Cards */}
          {role === 'manager' && (
            <div className="row g-3 mb-4">
              <div className="col-sm-6 col-xl-4">
                <div className="card h-100 border-0 shadow-sm border-start border-primary border-4">
                  <div className="card-body">
                    <span className="text-muted small fw-semibold text-uppercase">Supervised Team Size</span>
                    <h3 className="h3 fw-bold mt-2 mb-1">{stats?.teamSize ?? 0} Members</h3>
                    <Link to="/team" className="small text-primary text-decoration-none fw-semibold">
                      Manage team roster &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-xl-4">
                <div className="card h-100 border-0 shadow-sm border-start border-success border-4">
                  <div className="card-body">
                    <span className="text-muted small fw-semibold text-uppercase">Team Present Today</span>
                    <h3 className="h3 fw-bold mt-2 mb-1">{stats?.todayPresentCount ?? 0} / {stats?.teamSize ?? 0}</h3>
                    <Link to="/team-attendance" className="small text-success text-decoration-none fw-semibold">
                      View attendance &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-xl-4">
                <div className="card h-100 border-0 shadow-sm border-start border-warning border-4">
                  <div className="card-body">
                    <span className="text-muted small fw-semibold text-uppercase">Pending Leave Approvals</span>
                    <h3 className="h3 fw-bold mt-2 mb-1">{stats?.pendingTeamLeaves ?? 0}</h3>
                    <Link to="/team-leaves" className="small text-warning text-decoration-none fw-semibold">
                      Review & approve &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Role: HR Dashboard Cards */}
          {role === 'hr' && (
            <div className="row g-3 mb-4">
              <div className="col-sm-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm border-start border-primary border-4">
                  <div className="card-body">
                    <span className="text-muted small fw-semibold text-uppercase">Total Employees</span>
                    <h3 className="h3 fw-bold mt-2 mb-1">{stats?.totalEmployees ?? 0}</h3>
                    <Link to="/employees" className="small text-primary text-decoration-none fw-semibold">
                      Employee directory &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm border-start border-success border-4">
                  <div className="card-body">
                    <span className="text-muted small fw-semibold text-uppercase">Today's Turnout</span>
                    <h3 className="h3 fw-bold mt-2 mb-1">{stats?.todayTurnoutPercent ?? 0}%</h3>
                    <Link to="/all-attendance" className="small text-success text-decoration-none fw-semibold">
                      Attendance audit &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm border-start border-warning border-4">
                  <div className="card-body">
                    <span className="text-muted small fw-semibold text-uppercase">Open Leave Requests</span>
                    <h3 className="h3 fw-bold mt-2 mb-1">{stats?.pendingLeaves ?? 0}</h3>
                    <Link to="/all-leaves" className="small text-warning text-decoration-none fw-semibold">
                      Leave oversight &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm border-start border-info border-4">
                  <div className="card-body">
                    <span className="text-muted small fw-semibold text-uppercase">Total Managers</span>
                    <h3 className="h3 fw-bold mt-2 mb-1">{stats?.totalManagers ?? 0}</h3>
                    <Link to="/managers" className="small text-info text-decoration-none fw-semibold">
                      Manager console &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Company Announcements Broadcast Feed */}
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold h6">Latest Announcements & Company News</h5>
                  <Link to="/announcements" className="small text-primary text-decoration-none fw-semibold">
                    View all
                  </Link>
                </div>
                <div className="card-body p-0">
                  {announcements.length === 0 ? (
                    <div className="p-4 text-center text-muted small">No active announcements at this time.</div>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {announcements.slice(0, 4).map((ann) => (
                        <li key={ann._id} className="list-group-item p-3">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h6 className="fw-bold mb-0 text-dark">{ann.title}</h6>
                            <span
                              className={`badge ${
                                ann.priority === 'Urgent'
                                  ? 'bg-danger'
                                  : ann.priority === 'High'
                                  ? 'bg-warning text-dark'
                                  : 'bg-primary'
                              }`}
                            >
                              {ann.priority}
                            </span>
                          </div>
                          <p className="text-muted small mb-1">{ann.content}</p>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Posted: {new Date(ann.createdAt).toLocaleDateString()} | Target: {ann.targetAudience}
                          </small>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="col-lg-4">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0 fw-bold h6">Quick Operations</h5>
                </div>
                <div className="card-body d-flex flex-column gap-2">
                  {role === 'employee' && (
                    <>
                      <Link to="/attendance" className="btn btn-primary text-start">
                        Mark Daily Attendance
                      </Link>
                      <Link to="/leaves" className="btn btn-outline-primary text-start">
                        Submit Leave Request
                      </Link>
                      <Link to="/profile" className="btn btn-outline-secondary text-start">
                        Update Contact Profile
                      </Link>
                    </>
                  )}
                  {role === 'manager' && (
                    <>
                      <Link to="/team-leaves" className="btn btn-warning text-start">
                        Review Team Leaves
                      </Link>
                      <Link to="/team-attendance" className="btn btn-outline-success text-start">
                        Check Team Attendance
                      </Link>
                      <Link to="/manage-trainings" className="btn btn-outline-primary text-start">
                        Assign Team Trainings
                      </Link>
                    </>
                  )}
                  {role === 'hr' && (
                    <>
                      <Link to="/employees" className="btn btn-primary text-start">
                        Add New Employee
                      </Link>
                      <Link to="/manage-announcements" className="btn btn-outline-info text-dark text-start">
                        Post Announcement
                      </Link>
                      <Link to="/reports" className="btn btn-outline-success text-start">
                        View Analytics & Reports
                      </Link>
                      <Link to="/all-leaves" className="btn btn-outline-warning text-start">
                        Manage All Leaves
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default Dashboard;
