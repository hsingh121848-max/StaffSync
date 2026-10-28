# StaffSync — Modern Human Resource Management System (HRMS)

StaffSync is an enterprise-grade Human Resource Management System built on the **MERN** stack (**M**ongoDB, **E**xpress.js, **R**eact.js, and **N**ode.js). It provides end-to-end workforce automation, structured Role-Based Access Control (**RBAC**), employee self-service, management workflows, and administrative analytics across three distinct user roles:

1. **Employee:** Attendance check-in/out, leave applications, profile self-service, training tracking, announcements.
2. **Manager:** Team roster oversight, direct report attendance logs, leave approval/rejection console, team training assignments.
3. **HR Personnel:** Workforce directory, manager assignments, enterprise attendance audit, company-wide leave pipeline, announcement broadcasting, curriculum management, and aggregate organizational reports.

---

## 1. Technology Stack

- **Frontend:** React.js 18, React Router v6, Redux Toolkit, Axios, Bootstrap 5
- **Backend:** Node.js, Express.js REST API
- **Database:** MongoDB with Mongoose ODM (8 core collections)
- **Authentication & Security:** JSON Web Tokens (JWT), Bcrypt password hashing, role-governed middleware guards
- **Testing:** Native Node.js test runner covering Mongoose schemas, REST APIs, RBAC rules, and E2E workflows

---

## 2. Project Directory Structure

```text
StaffSync/
├── .gitignore                      # Air-tight Git rules (protects all .env files, node_modules, builds)
├── package.json                    # Workspace root management scripts
├── README.md                       # Comprehensive system guide and execution instructions
├── PROJECT_PLAN.md                 # Complete system design & architecture blueprint
├── REQUIREMENTS.md                 # System requirements specification & RTM
├── IMPLEMENTATION_ROADMAP.md       # Implementation phases, tasks, and test matrix
├── project-douments/               # Original project specification PDFs
├── server/                         # Backend REST API (Node.js & Express.js)
│   ├── .env.example                # Safe environment variable template
│   ├── .env                        # Local development environment configuration (gitignored)
│   ├── package.json                # Backend dependency manifest & scripts
│   ├── server.js                   # Express application entry point
│   ├── seeder.js                   # Safe, non-destructive database seeder
│   ├── test-db-models.js           # Phase 3 database model & schema verification suite (30 tests)
│   ├── test-backend-api.js         # Phase 4 REST API & RBAC verification suite (34 tests)
│   ├── test-e2e-suite.js           # Phase 6 comprehensive 5-domain E2E verification suite (22 tests)
│   ├── config/                     # Database connection manager (db.js)
│   ├── controllers/                # 9 REST controllers (auth, employee, manager, attendance, leave, etc.)
│   ├── middleware/                 # authMiddleware.js (JWT & RBAC), errorMiddleware.js
│   ├── models/                     # 8 Mongoose models (User, Employee, Manager, Attendance, Leave, etc.)
│   ├── routes/                     # Express routers mounted under /api
│   └── utils/                      # tokenUtils.js (JWT issuance), notificationHelper.js
└── client/                         # Frontend Single Page Application (React.js)
    ├── .env.example                # Safe client environment variable template
    ├── package.json                # Frontend dependency manifest & scripts
    ├── public/                     # Static HTML & metadata assets
    ├── build/                      # Production-optimized distribution bundle
    └── src/                        # React source components, pages, Redux store
        ├── App.js                  # Master application router with ProtectedRoute guards
        ├── App.css                 # Application styling and responsive utility classes
        ├── index.js                # React DOM root and Redux/Router providers
        ├── api/                    # axiosClient.js with JWT injection and 401 interceptors
        ├── components/
        │   ├── common/             # AlertMessage, EmptyState, LoadingSpinner, ProtectedRoute
        │   └── layout/             # AppLayout, Navbar, Sidebar, Footer
        ├── pages/
        │   ├── auth/               # Login.js, Register.js
        │   ├── common/             # Dashboard.js, Announcements.js, Notifications.js
        │   ├── employee/           # Attendance.js, Leaves.js, Profile.js, Trainings.js
        │   ├── manager/            # TeamAttendance.js, TeamLeaves.js, TeamMembers.js
        │   └── hr/                 # AllAttendance.js, AllLeaves.js, Employees.js,
        │                           # ManageAnnouncements.js, Managers.js, ManageTrainings.js, Reports.js
        └── store/                  # store.js & authSlice.js
```

---

## 3. Prerequisites

Before running StaffSync, ensure the following prerequisites are installed:

- **Node.js:** v18.0.0 or higher (Tested with Node.js v24.22.1)
- **npm:** v9.0.0 or higher (Tested with npm v11.19.1)
- **MongoDB:** v6.0 or higher
  - *Option A:* Local MongoDB Community Server running on `127.0.0.1:27017`
  - *Option B:* Free MongoDB Atlas Cloud Cluster (`mongodb+srv://...`)

---

## 4. Environment Variables Configuration

### A. Backend Configuration (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```

Ensure the values match your local or cloud setup:
```env
# Server Network Port
PORT=5000

# Application Environment (development | production | test)
NODE_ENV=development

# MongoDB Connection String (Local Community or Cloud Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/staffsync
MONGO_URI=mongodb://127.0.0.1:27017/staffsync

# JSON Web Token Secret & Expiration
JWT_SECRET=staffsync_dev_secret_token_key_change_in_production
JWT_EXPIRE=30d

# Frontend Client URL (for CORS allowance)
CLIENT_URL=http://localhost:3000
```

> [!WARNING]
> Never commit `server/.env` or any file containing real passwords or connection strings to version control.

### B. Frontend Configuration (`client/.env`)
Copy `client/.env.example` to `client/.env` (optional; defaults to `http://localhost:5000/api` automatically):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 5. MongoDB Setup Guide

StaffSync requires MongoDB to persist corporate records and authenticate users. Choose either Option A (local) or Option B (free cloud tier):

### Option A: Local MongoDB Community Edition
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community).
2. Install and launch the MongoDB Windows Service or run `mongod` from terminal:
   ```powershell
   # Default Windows path:
   & "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
   ```
3. Set `MONGODB_URI=mongodb://127.0.0.1:27017/staffsync` in `server/.env`.

### Option B: Free Cloud Tier (MongoDB Atlas M0 Sandbox)
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (e.g. `staffsync_user` and password).
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) or your current IP.
5. Click **Connect** -> **Connect your application** -> **Drivers (Node.js)** to copy the connection URI:
   ```env
   MONGODB_URI=mongodb+srv://staffsync_user:<password>@cluster0.abcde.mongodb.net/staffsync?retryWrites=true&w=majority
   ```
6. Paste the connection string into `server/.env`.

---

## 6. Installation & Database Seeding

### 1. Install Dependencies
You can install dependencies for both the frontend and backend with a single command from the root directory:
```bash
npm run install:all
```
*Or install individually:*
```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

### 2. Populate Safe Initial Data (Seeder)
StaffSync includes an idempotent, non-destructive seeder (`server/seeder.js`). When MongoDB is running, populate sample corporate accounts:
```bash
# From workspace root:
npm run seed

# Or from server directory:
cd server
npm run seed
```

#### Pre-Configured Seed Demo Accounts:
| Role | Email | Password | Assigned Scope |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | `admin@staffsync.com` | `AdminPassword123!` | Enterprise-wide workforce access |
| **Department Manager**| `manager.john@staffsync.com` | `ManagerPassword123!` | Engineering Department Supervisor |
| **Employee 1** | `employee.sarah@staffsync.com` | `EmployeePassword123!`| Senior Frontend Developer (`EMP-1001`) |
| **Employee 2** | `employee.alex@staffsync.com` | `EmployeePassword123!` | Backend Systems Engineer (`EMP-1002`) |

---

## 7. Local Execution & Startup Commands

To start both servers locally for development:

### Terminal 1: Backend API Server
```bash
# Option A: From workspace root
npm run server:dev

# Option B: From server directory
cd server
npm run dev
```
*The Express REST API will start on `http://localhost:5000`.*
- Health Check: `http://localhost:5000/api/health`
- Root Info: `http://localhost:5000/`

### Terminal 2: Frontend Client Application
```bash
# Option A: From workspace root
npm run client

# Option B: From client directory
cd client
npm start
```
*The React SPA will launch on `http://localhost:3000`.*

---

## 8. Verification & Testing

StaffSync features automated test suites verifying all 5 testing domains specified in the project requirements:
1. **Authentication Testing:** Token issuance, validation, tamper checks, credential boundaries.
2. **Attendance Management Testing:** Timestamp validation, duration calculations, duplicate punch protection.
3. **Leave Management Testing:** Application date constraints, duration rules, manager review, HR override.
4. **Employee Management Testing:** Corporate fields validation, unique constraints, self-service boundaries.
5. **Dashboard & Reporting Testing:** Operational health checks, KPI metadata, announcements permissions.

### Run All Test Suites:
```bash
# From workspace root:
npm test
```
*Executes `test-db-models.js`, `test-backend-api.js`, and `test-e2e-suite.js` (86 tests).*

### Build Production Frontend:
```bash
# From workspace root:
npm run client:build

# Or from client directory:
cd client
npm run build
```
*Creates an optimized, production-ready static build in `client/build/`.*

---

## 9. Security & Git Hygiene

- **Sensitive Files Excluded:** The root `.gitignore` rigorously excludes all `.env` files, `.env.*` variants, `node_modules/`, and build artifacts across both client and server directories.
- **Safe Examples Only:** Only `.env.example` templates containing non-secret placeholder variables are tracked in the repository.
- **Passwords:** All passwords in the database are hashed with `bcryptjs` (salt factor 10) prior to persistence.
- **Token Invalidation:** JWT tokens include expiration timestamps and are validated on every protected API transaction.
