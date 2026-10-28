import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const TeamMembers = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/managers/team');
      setTeam(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your team roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  return (
    <AppLayout
      title="Team Members Roster"
      subtitle="View and manage the employees reporting directly to you"
    >
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold h6">Direct Reports ({team.length})</h5>
          <button onClick={fetchTeam} className="btn btn-outline-secondary btn-sm">Refresh</button>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading team members..." />
          ) : team.length === 0 ? (
            <EmptyState
              title="No direct reports assigned"
              description="You do not currently have any employees assigned to your management roster. HR can allocate team members."
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
                    <th>Contact</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {team.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center me-2" style={{ width: '36px', height: '36px' }}>
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div>
                            <strong className="text-dark">{emp.firstName} {emp.lastName}</strong>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{emp.userId?.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{emp.employeeId}</span></td>
                      <td>{emp.department}</td>
                      <td>{emp.designation}</td>
                      <td>{emp.phone || '—'}</td>
                      <td>{new Date(emp.dateOfJoining).toLocaleDateString()}</td>
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

export default TeamMembers;
