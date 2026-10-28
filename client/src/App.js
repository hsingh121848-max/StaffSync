import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Common Pages
import Dashboard from './pages/common/Dashboard';
import Announcements from './pages/common/Announcements';
import Notifications from './pages/common/Notifications';

// Employee Pages
import Profile from './pages/employee/Profile';
import Attendance from './pages/employee/Attendance';
import Leaves from './pages/employee/Leaves';
import Trainings from './pages/employee/Trainings';

// Manager Pages
import TeamMembers from './pages/manager/TeamMembers';
import TeamAttendance from './pages/manager/TeamAttendance';
import TeamLeaves from './pages/manager/TeamLeaves';

// HR & Shared Pages
import Employees from './pages/hr/Employees';
import Managers from './pages/hr/Managers';
import AllAttendance from './pages/hr/AllAttendance';
import AllLeaves from './pages/hr/AllLeaves';
import ManageAnnouncements from './pages/hr/ManageAnnouncements';
import ManageTrainings from './pages/hr/ManageTrainings';
import Reports from './pages/hr/Reports';

function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Root Path Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Universal Protected Routes (All Authenticated Roles) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <Announcements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Employee Specific Self-Service Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaves"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Leaves />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainings"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Trainings />
          </ProtectedRoute>
        }
      />

      {/* Manager Supervisory Routes */}
      <Route
        path="/team"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <TeamMembers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-attendance"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <TeamAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-leaves"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <TeamLeaves />
          </ProtectedRoute>
        }
      />

      {/* Shared Manager & HR Program Administration */}
      <Route
        path="/manage-trainings"
        element={
          <ProtectedRoute allowedRoles={['manager', 'hr']}>
            <ManageTrainings />
          </ProtectedRoute>
        }
      />

      {/* HR Workforce Administration Routes */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Employees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/managers"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Managers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/all-attendance"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <AllAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/all-leaves"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <AllLeaves />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-announcements"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <ManageAnnouncements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Catch-all Wildcard Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;