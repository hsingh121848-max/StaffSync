import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import axiosClient from '../../api/axiosClient';

const Trainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/trainings/my');
      setTrainings(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your assigned training courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      setMessage('');
      setError('');
      const res = await axiosClient.put(`/trainings/${id}/progress`, { status });
      setMessage(res.data.message || `Progress updated to ${status}.`);
      fetchTrainings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update progress.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AppLayout
      title="Training & Professional Development"
      subtitle="Access your assigned courses, schedules, and report progress milestones"
    >
      <AlertMessage type="success" message={message} onClose={() => setMessage('')} />
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {loading ? (
        <LoadingSpinner message="Loading your training programs..." />
      ) : trainings.length === 0 ? (
        <EmptyState
          title="No training programs assigned"
          description="You are currently not enrolled in any training programs. Your manager or HR will assign upcoming courses."
        />
      ) : (
        <div className="row g-3">
          {trainings.map((t) => (
            <div key={t._id} className="col-md-6 col-xl-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary-subtle text-primary">{t.trainerOrProvider}</span>
                    <span
                      className={`badge ${
                        t.myStatus === 'Completed'
                          ? 'bg-success'
                          : t.myStatus === 'In Progress'
                          ? 'bg-warning text-dark'
                          : 'bg-secondary'
                      }`}
                    >
                      {t.myStatus}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2">{t.title}</h5>
                  <p className="text-muted small flex-grow-1">{t.description}</p>

                  <div className="small text-muted py-2 border-top border-bottom my-2">
                    <div>
                      <strong>Dates:</strong> {new Date(t.startDate).toLocaleDateString()} &rarr; {new Date(t.endDate).toLocaleDateString()}
                    </div>
                    {t.completedAt && (
                      <div className="text-success mt-1">
                        Completed on: {new Date(t.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-1 mt-2">
                    <button
                      onClick={() => handleUpdateStatus(t._id, 'In Progress')}
                      disabled={updatingId === t._id || t.myStatus === 'In Progress'}
                      className="btn btn-sm btn-outline-warning text-dark flex-grow-1"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(t._id, 'Completed')}
                      disabled={updatingId === t._id || t.myStatus === 'Completed'}
                      className="btn btn-sm btn-success flex-grow-1"
                    >
                      Completed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Trainings;
