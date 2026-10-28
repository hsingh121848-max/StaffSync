import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    employeeId: '',
    department: 'Engineering',
    designation: '',
    phone: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    managerId: '',
    address: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
  });

  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Design', 'Operations'];

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: searchTerm || undefined,
        department: departmentFilter || undefined,
      };

      const res = await axiosClient.get('/employees', { params });
      setEmployees(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load employees.');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await axiosClient.get('/managers');
      setManagers(res.data.data || []);
    } catch (err) {
      // Non-critical if managers fail to load
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, departmentFilter]);

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.employeeId || !formData.designation) {
      setError('Please fill in all mandatory fields (Name, Email, Password, Employee ID, Designation).');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        employeeId: formData.employeeId.toUpperCase(),
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone || undefined,
        dateOfJoining: formData.dateOfJoining || undefined,
        managerId: formData.managerId || undefined,
        address: formData.address || undefined,
        emergencyContact: formData.emergencyContactName ? {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelation,
          phone: formData.emergencyContactPhone,
        } : undefined,
      };

      await axiosClient.post('/employees', payload);
      setSuccess(`Employee ${formData.firstName} ${formData.lastName} (${formData.employeeId.toUpperCase()}) registered successfully!`);
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        employeeId: '',
        department: 'Engineering',
        designation: '',
        phone: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        managerId: '',
        address: '',
        emergencyContactName: '',
        emergencyContactRelation: '',
        emergencyContactPhone: '',
      });
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout
      title="Employees Directory"
      subtitle="Comprehensive workforce administration and employee records"
    >
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {/* Control Bar: Filters & Action Button */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center justify-content-between">
            <div className="col-md-7">
              <form onSubmit={handleSearchSubmit} className="row g-2">
                <div className="col-sm-7">
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, ID, or title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit">
                      Search
                    </button>
                    {searchTerm && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setPage(1);
                          setTimeout(fetchEmployees, 0);
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-sm-5">
                  <select
                    className="form-select form-select-sm"
                    value={departmentFilter}
                    onChange={(e) => {
                      setDepartmentFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>

            <div className="col-md-5 text-md-end">
              <button
                className="btn btn-primary btn-sm px-3"
                onClick={() => setShowAddModal(true)}
              >
                + Add New Employee
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Employee Modal / Overlay */}
      {showAddModal && (
        <div className="card shadow border-0 mb-4 border-top border-primary border-4">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">Register New Employee</h6>
            <button
              className="btn btn-close btn-sm"
              onClick={() => setShowAddModal(false)}
            ></button>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleCreateEmployee}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-bold">First Name *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. John"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Last Name *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Doe"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Employee ID *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="employeeId"
                    required
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    placeholder="e.g. EMP-101"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Work Email (Login) *</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. jdoe@staffsync.internal"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Temporary Password *</label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    name="password"
                    required
                    minLength="6"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold">Department *</label>
                  <select
                    className="form-select form-select-sm"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Designation *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="designation"
                    required
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Assign Manager</label>
                  <select
                    className="form-select form-select-sm"
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleInputChange}
                  >
                    <option value="">None / Direct to HR</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.userId?.email} ({m.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +1 555-0100"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Date of Joining</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Residential Address</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="City, State"
                  />
                </div>

                <div className="col-12 border-top pt-2 mt-3">
                  <h6 className="small fw-bold text-muted mb-2">Emergency Contact Details (Optional)</h6>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                        placeholder="Contact Name"
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        name="emergencyContactRelation"
                        value={formData.emergencyContactRelation}
                        onChange={handleInputChange}
                        placeholder="Relationship (e.g. Spouse, Parent)"
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="tel"
                        className="form-control form-control-sm"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                        placeholder="Emergency Phone"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-12 text-end pt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating Employee...' : 'Register Employee'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Directory Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">Active Staff Directory ({employees.length})</h6>
          <button onClick={fetchEmployees} className="btn btn-outline-secondary btn-sm">
            Refresh
          </button>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading employee directory..." />
          ) : employees.length === 0 ? (
            <EmptyState
              title="No employees found"
              description={searchTerm || departmentFilter ? 'No employees match the applied filter criteria.' : 'No employee records currently in StaffSync. Click "+ Add New Employee" to register one.'}
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Assigned Manager</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {employees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center me-2"
                            style={{ width: '36px', height: '36px' }}
                          >
                            {emp.firstName?.[0] || 'E'}
                            {emp.lastName?.[0] || ''}
                          </div>
                          <div>
                            <strong className="text-dark">
                              {emp.firstName} {emp.lastName}
                            </strong>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {emp.userId?.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{emp.employeeId}</span>
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle text-dark">{emp.department}</span>
                      </td>
                      <td>{emp.designation}</td>
                      <td>
                        {emp.managerId ? (
                          <span className="text-dark small">
                            {emp.managerId.department} Manager
                          </span>
                        ) : (
                          <span className="text-muted small">None</span>
                        )}
                      </td>
                      <td>{new Date(emp.dateOfJoining).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${emp.userId?.isActive !== false ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                          {emp.userId?.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
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

export default Employees;