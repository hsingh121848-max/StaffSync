import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const Managers = () => {
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [department, setDepartment] = useState('Engineering');

  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Design', 'Operations'];

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/managers');
      setManagers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load manager directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesForPromotion = async () => {
    try {
      const res = await axiosClient.get('/employees?limit=100');
      setEmployees(res.data.data || []);
    } catch (err) {
      // Non-critical
    }
  };

  useEffect(() => {
    fetchManagers();
    fetchEmployeesForPromotion();
  }, []);

  const handleCreateManager = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedUserId || !department) {
      setError('Please select an employee/user and specify their management department.');
      return;
    }

    try {
      setSubmitting(true);
      await axiosClient.post('/managers', {
        userId: selectedUserId,
        department,
      });

      setSuccess('Manager profile successfully configured and role privileges updated.');
      setShowModal(false);
      setSelectedUserId('');
      fetchManagers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to configure manager.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalSupervised = managers.reduce(
    (acc, m) => acc + (m.teamMembers?.length || 0),
    0
  );

  return (
    <AppLayout
      title="Managers Console"
      subtitle="Supervisory department assignments and team hierarchy configuration"
    >
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {/* Top Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm border-0 border-start border-primary border-4">
            <div className="card-body">
              <span className="text-muted small fw-bold text-uppercase">Configured Managers</span>
              <h3 className="h3 fw-bold mt-2 mb-0">{managers.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm border-0 border-start border-success border-4">
            <div className="card-body">
              <span className="text-muted small fw-bold text-uppercase">Managed Employees</span>
              <h3 className="h3 fw-bold mt-2 mb-0">{totalSupervised}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-12 col-lg-4 d-flex align-items-center justify-content-lg-end">
          <button
            className="btn btn-primary px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            + Assign / Promote Manager
          </button>
        </div>
      </div>

      {/* Promotion / Assignment Modal Form */}
      {showModal && (
        <div className="card shadow border-0 mb-4 border-top border-primary border-4">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">Designate New Department Manager</h6>
            <button
              className="btn btn-close btn-sm"
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleCreateManager}>
              <div className="row g-3">
                <div className="col-md-7">
                  <label className="form-label small fw-bold">Select Staff Member *</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose staff member to promote --</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp.userId?._id || emp.userId}>
                        {emp.firstName} {emp.lastName} ({emp.employeeId} - {emp.department})
                      </option>
                    ))}
                  </select>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Note: Promoting this user will grant them Manager dashboard access and leave approval privileges.
                  </small>
                </div>

                <div className="col-md-5">
                  <label className="form-label small fw-bold">Management Department *</label>
                  <select
                    className="form-select form-select-sm"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 text-end pt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Configuring Manager...' : 'Confirm Manager Assignment'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Managers Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">Department Managers Roster ({managers.length})</h6>
          <button onClick={fetchManagers} className="btn btn-outline-secondary btn-sm">
            Refresh
          </button>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading managers roster..." />
          ) : managers.length === 0 ? (
            <EmptyState
              title="No managers registered"
              description="No managers have been configured yet. Use the 'Assign / Promote Manager' button to designate team leadership."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Manager Account</th>
                    <th>Department</th>
                    <th>Team Size</th>
                    <th>Direct Reports</th>
                    <th>Configured Date</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {managers.map((m) => (
                    <tr key={m._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-success-subtle text-success fw-bold d-flex align-items-center justify-content-center me-2"
                            style={{ width: '36px', height: '36px' }}
                          >
                            M
                          </div>
                          <div>
                            <strong className="text-dark">
                              {m.userId?.email || 'Manager Profile'}
                            </strong>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              ID: {m._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary">
                          {m.department}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {m.teamMembers?.length || 0} Members
                        </span>
                      </td>
                      <td>
                        {m.teamMembers && m.teamMembers.length > 0 ? (
                          <div className="text-muted small">
                            {m.teamMembers.map((emp) => (
                              <span
                                key={emp._id || emp}
                                className="badge bg-secondary-subtle text-secondary me-1 mb-1"
                              >
                                {emp.firstName ? `${emp.firstName} ${emp.lastName}` : emp}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted fst-italic">No reports assigned</span>
                        )}
                      </td>
                      <td>{new Date(m.createdAt).toLocaleDateString()}</td>
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

export default Managers;