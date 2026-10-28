import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import axiosClient from '../../api/axiosClient';
import AlertMessage from '../../components/common/AlertMessage';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      dispatch(loginStart());

      const res = await axiosClient.post('/auth/login', formData);

      dispatch(
        loginSuccess({
          user: res.data.data.user,
          token: res.data.data.token,
        })
      );

      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);
      dispatch(loginFailure(msg));
    } finally {
      setLoading(false);
    }
  };

  // Helper to prefill demo credentials
  const fillDemo = (email, password) => {
    setFormData({ email, password });
    setErrorMessage('');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <span className="badge bg-primary px-3 py-2 fs-6 mb-2">StaffSync</span>
                <h1 className="h4 fw-bold text-dark">Sign In</h1>
                <p className="text-muted small">Access your Human Resource Management portal</p>
              </div>

              <AlertMessage type="danger" message={errorMessage} onClose={() => setErrorMessage('')} />

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small" htmlFor="password">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Sample Credentials Card for Review / Evaluation */}
              <div className="mt-4 p-3 bg-light rounded border">
                <div className="small fw-bold text-muted mb-2 text-uppercase">Sample Test Accounts:</div>
                <div className="d-flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => fillDemo('admin@staffsync.com', 'AdminPassword123!')}
                    className="btn btn-sm btn-outline-danger"
                  >
                    HR Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('manager.john@staffsync.com', 'ManagerPassword123!')}
                    className="btn btn-sm btn-outline-success"
                  >
                    Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('employee.sarah@staffsync.com', 'EmployeePassword123!')}
                    className="btn btn-sm btn-outline-info text-dark"
                  >
                    Employee
                  </button>
                </div>
              </div>

              <div className="text-center mt-4 text-muted small">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary fw-semibold">
                  Register here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
