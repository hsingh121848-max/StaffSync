import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const ManageTrainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create Training Form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    department: 'All',
    duration: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  // Assign Modal
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Design', 'Operations'];

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/trainings');
      setTrainings(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load training programs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosClient.get('/employees?limit=100');
      setEmployees(res.data.data || []);
    } catch (err) {
      // Non-critical
    }
  };

  useEffect(() => {
    fetchTrainings();
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTraining = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.instructor) {
      setError('Please provide at least a training title and instructor name.');
      return;
    }

    try {
      setSubmitting(true);
      await axiosClient.post('/trainings', formData);
      setSuccess(`Training program "${formData.title}" created successfully!`);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        instructor: '',
        department: 'All',
        duration: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
      fetchTrainings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create training program.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignEmployee = async (e) => {
    e.preventDefault();
    if (!selectedTraining || !selectedEmployeeId) return;

    try {
      setAssigning(true);
      setError('');
      setSuccess('');

      await axiosClient.post(`/trainings/${selectedTraining._id}/assign`, {
        employeeIds: [selectedEmployeeId],
      });

      setSuccess(`Staff member successfully enrolled in "${selectedTraining.title}".`);
      setSelectedTraining(null);
      setSelectedEmployeeId('');
      fetchTrainings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign staff member.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <AppLayout
      title="Training Programs Administration"
      subtitle="Curate professional development modules, assign participants, and monitor upskilling"
    >
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {/* Control Bar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3 d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0 fw-bold">Training Curriculum Oversight</h6>
            <small className="text-muted">Total Active Programs: {trainings.length}</small>
          </div>
          <button
            className="btn btn-primary btn-sm px-3"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Close Form' : '+ Create Training Program'}
          </button>
        </div>
      </div>

      {/* Create Training Form Card */}
      {showCreateForm && (
        <div className="card shadow border-0 mb-4 border-top border-primary border-4">
          <div className="card-header bg-white py-3">
            <h6 className="mb-0 fw-bold">Design New Training Course</h6>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleCreateTraining}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Course Title *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="title"
                    required
                    placeholder="e.g. Modern React & Microservices Architecture"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Instructor / Facilitator *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="instructor"
                    required
                    placeholder="e.g. Dr. Jane Smith"
                    value={formData.instructor}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">Course Description</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    name="description"
                    placeholder="Brief description of training objectives and skills covered..."
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold">Target Department</label>
                  <select
                    className="form-select form-select-sm"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold">Duration</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="duration"
                    placeholder="e.g. 4 Weeks, 20 Hours"
                    value={formData.duration}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold">Start Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold">End Date (Optional)</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-12 text-end pt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating Course...' : 'Create Course'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Employee Modal / Form Card */}
      {selectedTraining && (
        <div className="card shadow border-0 mb-4 border-top border-info border-4">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">
              Enroll Staff Member in: "{selectedTraining.title}"
            </h6>
            <button
              className="btn btn-close btn-sm"
              onClick={() => setSelectedTraining(null)}
            ></button>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleAssignEmployee}>
              <div className="row g-3 align-items-end">
                <div className="col-md-8">
                  <label className="form-label small fw-bold">Select Employee to Enroll</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose employee --</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeId} &bull; {emp.department})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 text-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => setSelectedTraining(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-info text-white btn-sm px-4"
                    disabled={assigning}
                  >
                    {assigning ? 'Enrolling...' : 'Confirm Enrollment'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trainings Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">Active Programs Catalog ({trainings.length})</h6>
          <button onClick={fetchTrainings} className="btn btn-outline-secondary btn-sm">
            Refresh
          </button>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading courses..." />
          ) : trainings.length === 0 ? (
            <EmptyState
              title="No training programs registered"
              description="No curriculum items found. Use '+ Create Training Program' to launch an upskilling module."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Program Details</th>
                    <th>Instructor</th>
                    <th>Target Dept</th>
                    <th>Duration</th>
                    <th>Schedule</th>
                    <th>Enrolled</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {trainings.map((t) => (
                    <tr key={t._id}>
                      <td style={{ maxWidth: '300px' }}>
                        <strong className="text-dark d-block">{t.title}</strong>
                        <p className="text-muted mb-0 small text-truncate">{t.description || 'No description provided'}</p>
                      </td>
                      <td>{t.instructor}</td>
                      <td>
                        <span className="badge bg-secondary-subtle text-dark">
                          {t.department || 'All'}
                        </span>
                      </td>
                      <td>{t.duration || 'Flexible'}</td>
                      <td>
                        {t.startDate ? new Date(t.startDate).toLocaleDateString() : 'Immediate'}
                        {t.endDate ? ` - ${new Date(t.endDate).toLocaleDateString()}` : ''}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {t.assignedEmployees?.length || 0} Learners
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-primary btn-sm py-0 px-2"
                          onClick={() => {
                            setSelectedTraining(t);
                            setSelectedEmployeeId('');
                          }}
                        >
                          + Enroll Staff
                        </button>
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

export default ManageTrainings;