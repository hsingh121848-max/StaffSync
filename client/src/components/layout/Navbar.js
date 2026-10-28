import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import axiosClient from '../../api/axiosClient';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, role } = useSelector((state) => state.auth);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      axiosClient
        .get('/notifications')
        .then((res) => {
          setUnreadCount(res.data.unreadCount || 0);
        })
        .catch(() => {
          // Graceful fallback
        });
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getRoleBadgeClass = () => {
    if (role === 'hr') return 'bg-danger';
    if (role === 'manager') return 'bg-success';
    return 'bg-info text-dark';
  };

  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm px-3">
      <Link className="navbar-brand fw-bold d-flex align-items-center" to="/dashboard">
        <span className="me-2 badge bg-primary">SS</span>
        StaffSync
      </Link>

      <div className="ms-auto d-flex align-items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link to="/notifications" className="btn btn-outline-secondary btn-sm position-relative text-white border-secondary">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount}
                  <span className="visually-hidden">unread notifications</span>
                </span>
              )}
            </Link>

            <div className="d-flex align-items-center text-white small">
              <span className="me-2 text-white-50 d-none d-sm-inline">{user?.email}</span>
              <span className={`badge ${getRoleBadgeClass()} text-uppercase px-2 py-1`}>
                {role || 'User'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline-light btn-sm"
              title="Logout"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-outline-light btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
