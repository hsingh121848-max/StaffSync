import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import axiosClient from '../../api/axiosClient';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ phone: '', address: '', emergencyContact: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/employees/me');
      setProfile(res.data.data);
      setFormData({
        phone: res.data.data.phone || '',
        address: res.data.data.address || '',
        emergencyContact: res.data.data.emergencyContact || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load employee profile. It might not be initialized yet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
    setError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      setError('');

      const res = await axiosClient.put('/employees/me', formData);
      setProfile(res.data.data);
      setMessage('Personal contact details updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout
      title="My Employee Profile"
      subtitle="View your job profile and update allowable contact information"
    >
      <AlertMessage type="success" message={message} onClose={() => setMessage('')} />
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {loading ? (
        <LoadingSpinner message="Loading employee profile..." />
      ) : profile ? (
        <div className="row g-4">
          {/* Read-Only Employment Information */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold h6">Employment & Organizational Record</h5>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-4 me-3" style={{ width: '60px', height: '60px' }}>
                    {profile.firstName[0]}{profile.lastName[0]}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0">{profile.firstName} {profile.lastName}</h5>
                    <span className="badge bg-primary-subtle text-primary">{profile.designation}</span>
                  </div>
                </div>

                <div className="list-group list-group-flush small">
                  <div className="list-group-item d-flex justify-content-between px-0 py-2">
                    <span className="text-muted">Employee ID:</span>
                    <strong className="text-dark">{profile.employeeId}</strong>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2">
                    <span className="text-muted">Department:</span>
                    <strong className="text-dark">{profile.department}</strong>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2">
                    <span className="text-muted">Designation:</span>
                    <strong className="text-dark">{profile.designation}</strong>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2">
                    <span className="text-muted">Date of Joining:</span>
                    <strong className="text-dark">{new Date(profile.dateOfJoining).toLocaleDateString()}</strong>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2">
                    <span className="text-muted">Assigned Manager:</span>
                    <strong className="text-dark">{profile.managerId?.department ? `Manager (${profile.managerId.department})` : 'Not Assigned'}</strong>
                  </div>
                </div>

                {/* Leave Quota Allocation */}
                {profile.leaveQuota && (
                  <div className="mt-4 pt-3 border-top">
                    <h6 className="fw-bold small text-muted text-uppercase mb-2">Annual Leave Quotas</h6>
                    <div className="d-flex gap-2">
                      <span className="badge bg-secondary">Casual: {profile.leaveQuota.casual} days</span>
                      <span className="badge bg-secondary">Sick: {profile.leaveQuota.sick} days</span>
                      <span className="badge bg-secondary">Annual: {profile.leaveQuota.annual} days</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editable Personal Contact Details */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold h6">Personal Contact Information</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold" htmlFor="phone">Phone Number</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1-555-0100"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold" htmlFor="address">Residential Address</label>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      className="form-control"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street, City, State, ZIP"
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold" htmlFor="emergencyContact">Emergency Contact</label>
                    <input
                      type="text"
                      id="emergencyContact"
                      name="emergencyContact"
                      className="form-control"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      placeholder="Contact Name & Phone"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving changes...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">
          No employee record associated with this account. Contact HR to link your employee profile.
        </div>
      )}
    </AppLayout>
  );
};

export default Profile;
