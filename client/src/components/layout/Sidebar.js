import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const { role } = useSelector((state) => state.auth);

  const getNavLinkClass = ({ isActive }) =>
    `nav-link px-3 py-2 rounded mb-1 d-flex align-items-center ${
      isActive ? 'bg-primary text-white fw-semibold' : 'text-dark hover-bg'
    }`;

  return (
    <aside className="bg-white border-end p-3 d-flex flex-column" style={{ minWidth: '240px', width: '240px' }}>
      <div className="small text-uppercase text-muted fw-bold px-3 mb-2">Navigation</div>
      <nav className="nav flex-column mb-3">
        <NavLink to="/dashboard" className={getNavLinkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/announcements" className={getNavLinkClass}>
          Announcements
        </NavLink>
        <NavLink to="/notifications" className={getNavLinkClass}>
          Notifications
        </NavLink>
      </nav>

      {/* Employee Dedicated Navigation */}
      {role === 'employee' && (
        <>
          <div className="small text-uppercase text-muted fw-bold px-3 mb-2 pt-2 border-top">
            Employee Self-Service
          </div>
          <nav className="nav flex-column mb-3">
            <NavLink to="/profile" className={getNavLinkClass}>
              My Profile
            </NavLink>
            <NavLink to="/attendance" className={getNavLinkClass}>
              Mark Attendance
            </NavLink>
            <NavLink to="/leaves" className={getNavLinkClass}>
              Leave Requests
            </NavLink>
            <NavLink to="/trainings" className={getNavLinkClass}>
              My Trainings
            </NavLink>
          </nav>
        </>
      )}

      {/* Manager Dedicated Navigation */}
      {role === 'manager' && (
        <>
          <div className="small text-uppercase text-muted fw-bold px-3 mb-2 pt-2 border-top">
            Team Management
          </div>
          <nav className="nav flex-column mb-3">
            <NavLink to="/team" className={getNavLinkClass}>
              Team Members
            </NavLink>
            <NavLink to="/team-attendance" className={getNavLinkClass}>
              Team Attendance
            </NavLink>
            <NavLink to="/team-leaves" className={getNavLinkClass}>
              Review Leaves
            </NavLink>
            <NavLink to="/manage-trainings" className={getNavLinkClass}>
              Team Trainings
            </NavLink>
          </nav>
        </>
      )}

      {/* HR Dedicated Navigation */}
      {role === 'hr' && (
        <>
          <div className="small text-uppercase text-muted fw-bold px-3 mb-2 pt-2 border-top">
            HR Administration
          </div>
          <nav className="nav flex-column mb-3">
            <NavLink to="/employees" className={getNavLinkClass}>
              Employees Directory
            </NavLink>
            <NavLink to="/managers" className={getNavLinkClass}>
              Managers Console
            </NavLink>
            <NavLink to="/all-attendance" className={getNavLinkClass}>
              Attendance Audit
            </NavLink>
            <NavLink to="/all-leaves" className={getNavLinkClass}>
              Leave Oversight
            </NavLink>
            <NavLink to="/manage-announcements" className={getNavLinkClass}>
              Manage News
            </NavLink>
            <NavLink to="/manage-trainings" className={getNavLinkClass}>
              Manage Trainings
            </NavLink>
            <NavLink to="/reports" className={getNavLinkClass}>
              Reports & Analytics
            </NavLink>
          </nav>
        </>
      )}

      <div className="mt-auto pt-3 border-top text-center text-muted small">
        <span>StaffSync v1.0 (MERN)</span>
      </div>
    </aside>
  );
};

export default Sidebar;
