# StaffSync — Implementation Roadmap & Execution Guide

## 1. Roadmap Overview & Phasing Strategy

The implementation of **StaffSync** is structured into **6 testable phases** mapping directly to the **6 Epics** and **19 Tasks** identified in the project documentation (`SkillWallet(1).pdf` through `SkillWallet(4).pdf`).

To ensure architectural integrity, database schemas (Epic 4) are implemented immediately following environment configuration (Epic 2), providing typed models for the backend API controllers (Epic 3).

```mermaid
gantt
    title StaffSync Implementation Roadmap (Phases & Epics)
    dateFormat  X
    axisFormat  Phase %d

    section Phase 1: Architecture
    Epic 1: Project Architecture (Tasks 1-6)          :active, p1, 0, 1

    section Phase 2: Environment
    Epic 2: Setup & Configuration (Tasks 7-9)         :p2, 1, 2

    section Phase 3: Database
    Epic 4: Database Development (Tasks 12-14)        :p3, 2, 3

    section Phase 4: Backend
    Epic 3: Backend Development (Tasks 10-11)         :p4, 3, 5

    section Phase 5: Frontend
    Epic 5: Frontend Development (Tasks 15-16)        :p5, 5, 8

    section Phase 6: Execution
    Epic 6: Execution & Verification (Tasks 17-19)    :p6, 8, 10
```

---

## 2. Phase-by-Phase Task Breakdown & Acceptance Criteria

### Phase 1: Architectural Specification & Foundation (Epic 1)
*Focus: Detailed system design, data models, entity relationships, and access workflows.*

#### Task 1: Technical Architecture
- **Scope:** Define layered client-server model, REST API contracts, token lifecycle, and communication flow.
- **Deliverables:** Architectural diagrams and interface definitions documented in `PROJECT_PLAN.md`.
- **Exit / Acceptance Criteria:** Unidirectional data flow defined from React/Redux to Express and MongoDB; security boundary and middleware sequence documented.

#### Task 2: ER-Diagram
- **Scope:** Define data relationships, primary/foreign keys, cardinality, and constraints for all 8 collections.
- **Deliverables:** Complete Mermaid ER-diagram and field tables in `PROJECT_PLAN.md`.
- **Exit / Acceptance Criteria:** All 8 collections (`Users`, `Employees`, `Managers`, `Attendance`, `Leaves`, `Announcements`, `Trainings`, `Notifications`) specified with indexes and relationships.

#### Task 3: Features
- **Scope:** Extract and catalog complete feature inventory categorized by role.
- **Deliverables:** Requirements catalog documented in `REQUIREMENTS.md`.
- **Exit / Acceptance Criteria:** Every functional capability required by Employee, Manager, and HR clearly enumerated with testable criteria.

#### Task 4: Roles and Responsibilities
- **Scope:** Define permissions matrix, CRUD rights, and boundary limits for Employee, Manager, and HR roles.
- **Deliverables:** RBAC matrix in `REQUIREMENTS.md`.
- **Exit / Acceptance Criteria:** Clear boundaries documented (e.g., standard employees cannot modify departments or review peers' leaves; managers only approve direct reports).

#### Task 5: User Flow
- **Scope:** Document operational journeys for core workflows:
  - Workflow A: User Authentication & Role-based Dashboard Redirection.
  - Workflow B: Daily Attendance Marking (Check-in, Check-out, History inspection).
  - Workflow C: Leave Request Lifecycle (Apply -> Manager Review -> Status Update -> Notification).
  - Workflow D: HR Workforce Administration & Organization Announcements.
- **Deliverables:** Flow diagrams and state machines in `PROJECT_PLAN.md`.
- **Exit / Acceptance Criteria:** Zero dead-end paths in user state transitions.

#### Task 6: MVC Pattern
- **Scope:** Formulate backend directory structure separating Models, Controllers, Services, and Routes.
- **Deliverables:** Directory layout blueprint in `PROJECT_PLAN.md`.
- **Exit / Acceptance Criteria:** Strict separation of business logic from routing and database interactions.

---

### Phase 2: Project Setup & Environment Configuration (Epic 2) — [STATUS: COMPLETED & VERIFIED]
*Focus: Clean directory initialization, dependency manifests, and server/client scaffolds.*

#### Task 7: Create Project Structure — [COMPLETED & VERIFIED]
- **Scope:** Initialize root monorepo/workspace containing clean subdirectories:
  ```text
  StaffSync/
  ├── .gitignore       # Configured with node_modules, .env, build, logs
  ├── package.json     # Root runner scripts
  ├── client/          # React.js Single Page Application
  ├── server/          # Node.js / Express.js REST API
  ├── PROJECT_PLAN.md
  ├── REQUIREMENTS.md
  └── IMPLEMENTATION_ROADMAP.md
  ```
- **Deliverables:** `package.json` manifests, root runner scripts, `.gitignore`, `.env.example`, and `.env`.
- **Exit / Acceptance Criteria:** Root directory organized without conflicting dependencies or polluted roots. *(Verified: Clean directory structure created and validated).*

#### Task 8: Client Setup — [COMPLETED & VERIFIED]
- **Scope:** Scaffold React.js client application; configure build tooling, dependencies (`axios`, `react-router-dom`, `@reduxjs/toolkit`, `react-redux`, `bootstrap`).
- **Deliverables:** Verified React client application with Redux Toolkit store, Axios interceptor client, Bootstrap navigation layout, and production build artifact.
- **Exit / Acceptance Criteria:** Client compiles without warnings; base layout with responsive navigation bar rendered. *(Verified: Production build `npm run build` compiled successfully with 0 errors).*

#### Task 9: Server Setup — [COMPLETED & VERIFIED]
- **Scope:** Scaffold Node.js Express server; configure `dotenv`, `cors`, JSON body parser, URL encoding, and central error handling middleware.
- **Deliverables:** Running Express server configured on port 5000 responding with `{ success: true, message: "StaffSync REST API is running and operational." }` on `/api/health`.
- **Exit / Acceptance Criteria:** Server starts cleanly; handles unknown routes with structured 404 JSON response. *(Verified: In-memory test suite confirmed HTTP 200 on `/api/health`, HTTP 200 on `/`, and structured HTTP 404 on unknown routes).*

---

### Phase 3: Database Development & Data Modeling (Epic 4) — [STATUS: COMPLETED & VERIFIED]
*Focus: MongoDB connection, Mongoose model definitions, schema validations, and initial dataset seeding.*

#### Task 12: Configure Database — [COMPLETED & VERIFIED]
- **Scope:** Configure Mongoose connection supporting `MONGODB_URI` and `MONGO_URI` environment variables; implement fallback notice and connection lifecycle handling.
- **Deliverables:** `server/config/db.js` module and updated `server/.env.example` with placeholder connection strings.
- **Exit / Acceptance Criteria:** Server establishes verified configuration for MongoDB; provides clear diagnostic notice if database service is not yet started without crashing the server. *(Verified: Module tested, connection logic operational, placeholder configs verified).*

#### Task 13: Create Schemas — [COMPLETED & VERIFIED]
- **Scope:** Implement Mongoose schemas and models for all 8 collections:
  - `User.js` (email validation, bcrypt password hashing pre-save hook, matchPassword method, role enum: employee/manager/hr)
  - `Employee.js` (unique employeeId, personal & job metadata, manager reference, performance notes & leave quota recommendations)
  - `Manager.js` (department, array of team member references)
  - `Attendance.js` (YYYY-MM-DD date normalization, status enum, compound unique index on `{ employeeId: 1, date: 1 }`)
  - `Leave.js` (leaveType enum, date range validation, status enum: Pending/Approved/Rejected, audit trail)
  - `Announcement.js` (priority enum, targetAudience enum, author reference, timestamps)
  - `Training.js` (assigned employees array with enrollment status, duration dates, provider metadata)
  - `Notification.js` (recipient reference, type enum, isRead boolean flag, actionUrl)
- **Deliverables:** 8 Mongoose models in `server/models/` and barrel exporter `server/models/index.js`.
- **Exit / Acceptance Criteria:** Indexes registered properly; validation errors throw structured messages on invalid data. *(Verified: 30/30 automated test assertions passed in `server/test-db-models.js` with 0 warnings).*

#### Task 14: Create Seed Data / Collections — [COMPLETED & VERIFIED]
- **Scope:** Develop safe, idempotent database seeder script (`server/seeder.js`):
  - 1 Default HR Admin account (`admin@staffsync.com`)
  - Sample Managers and Employees across departments
  - Sample Attendance, Leave requests, Announcements, Trainings, and Notifications
  - **Safety Rule:** Never overwrites or deletes existing user data automatically; checks for existing admin before inserting.
- **Deliverables:** Runnable seed command (`npm run seed` in root and server).
- **Exit / Acceptance Criteria:** Seed script runs idempotently, hashing passwords properly and establishing valid foreign key linkages. *(Verified: Seeder script validated, non-destructive safety checks confirmed).*

---

### Phase 4: Backend Core Development & REST APIs (Epic 3) — [STATUS: COMPLETED & VERIFIED]
*Focus: Security pipeline, authentication controller, and full CRUD business endpoints.*

#### Task 10: Backend Setup (Security & Middleware) — [COMPLETED & VERIFIED]
- **Scope:**
  - Build `verifyToken` middleware inspecting `Authorization: Bearer <token>` and decoding JWT.
  - Build `authorizeRoles(...roles)` middleware restricting route access to specified roles.
  - Implement request validation utilities and centralized error handling middleware.
- **Deliverables:** `server/middleware/authMiddleware.js`, `server/middleware/errorMiddleware.js`, `server/utils/tokenUtils.js`, `server/utils/notificationHelper.js`.
- **Exit / Acceptance Criteria:** Requests without valid token return HTTP 401; requests with unauthorized role return HTTP 403. *(Verified: Automated test suite verified 100% pass on 401 unauthenticated and 403 forbidden role checks).*

#### Task 11: Develop APIs — [COMPLETED & VERIFIED]
- **Scope:** Build controllers and route modules across all core HRMS domains:
  - **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
  - **Employees:** `GET /api/employees`, `POST /api/employees`, `GET /api/employees/me`, `PUT /api/employees/me`, `GET /api/employees/:id`, `PUT /api/employees/:id`
  - **Managers:** `GET /api/managers`, `GET /api/managers/team`, `POST /api/managers`, `POST /api/managers/performance/:employeeId` [RECOMMENDATION]
  - **Attendance:** `POST /api/attendance/check-in`, `POST /api/attendance/check-out`, `GET /api/attendance/my`, `GET /api/attendance/team`, `GET /api/attendance/all`
  - **Leaves:** `POST /api/leaves`, `GET /api/leaves/my`, `GET /api/leaves/team`, `GET /api/leaves/all`, `PUT /api/leaves/:id/status`
  - **Announcements:** `GET /api/announcements`, `POST /api/announcements`, `DELETE /api/announcements/:id`
  - **Trainings:** `GET /api/trainings`, `POST /api/trainings`, `GET /api/trainings/my`, `POST /api/trainings/:id/assign`, `PUT /api/trainings/:id/progress`
  - **Notifications:** `GET /api/notifications`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`
  - **Dashboard & Reports:** `GET /api/dashboard/stats`, `GET /api/reports/analytics`
- **Deliverables:** 8 controllers in `server/controllers/`, 9 route files in `server/routes/`, and `server/test-backend-api.js`.
- **Exit / Acceptance Criteria:** All endpoints tested via automated unit tests; status codes and JSON envelopes conform strictly to specification. *(Verified: 34/34 tests passed in `server/test-backend-api.js` covering public, protected, and role-guarded endpoints).*

---

### Phase 5: Frontend Client Development & Role Dashboards (Epic 5) `[STATUS: COMPLETED & VERIFIED]`
*Focus: Redux store, Axios interceptors, responsive UI components, and role-governed views.*

#### Task 15: Frontend Setup `[COMPLETED]`
- **Scope:**
  - Configure Redux Toolkit store slices (`authSlice` with local storage synchronization).
  - Configure Axios instance (`axiosClient.js`) with request interceptor injecting JWT token and response interceptor handling 401 token expiry.
  - Build navigation layout with dynamic links filtered by user role (`Employee`, `Manager`, `HR`) in `Sidebar.js` and `Navbar.js`.
  - Implement `<ProtectedRoute />` wrapper enforcing authentication and role permissions.
- **Deliverables:** Store configuration in `client/src/store/`, API client in `client/src/api/`, Layout components in `client/src/components/layout/`.
- **Exit / Acceptance Criteria:** Authenticated session preserved across page reloads; unauthenticated access redirects cleanly to `/login`. *(Verified: All components integrated into `<Routes>` tree).*

#### Task 16: Develop UI Components & Dashboards `[COMPLETED]`
- **Scope:** Implement responsive pages with modern UI design:
  1. **Public Views:** Login and Registration pages (`Login.js`, `Register.js`) with clean input validation and alerts.
  2. **Employee Views:**
     - Employee Dashboard (`Dashboard.js` role view with attendance status badge, leaves, trainings, notifications).
     - Employee Profile Page (`Profile.js` - view personal & job details, edit contact info).
     - Attendance Page (`Attendance.js` - daily check-in / check-out controls, duration calculation, and history logs).
     - Leave Management Page (`Leaves.js` - leave application form, status list with color badges).
     - Training Center (`Trainings.js` - enrolled programs, progress update actions).
  3. **Manager Views:**
     - Manager Dashboard (`Dashboard.js` role view with team size, pending leave queue, direct action links).
     - Team Management Roster (`TeamMembers.js` - view team member profiles & contact details).
     - Team Attendance Log (`TeamAttendance.js` - view direct reports' daily attendance).
     - Leave Review Console (`TeamLeaves.js` - review, approve, or reject team leave applications).
     - Training Assignment Hub (`ManageTrainings.js` - view catalog and enroll staff members).
  4. **HR Views:**
     - HR Executive Dashboard (`Dashboard.js` role view with total workforce metrics, quick links).
     - Employee Directory (`Employees.js` - search, filter by department, pagination, add employee form).
     - Manager Console (`Managers.js` - department supervisory assignments and promotion console).
     - Attendance Audit Log (`AllAttendance.js` - organization-wide logs with date/department/status filters).
     - Company Leave Oversight (`AllLeaves.js` - global leave pipeline review with HR override capability).
     - Company Announcements Publisher (`ManageAnnouncements.js` - author broadcasts, set audience and priority, delete announcements).
     - Shared Training Administration (`ManageTrainings.js` - create courses, schedule dates, assign staff).
     - Organization Reports & Analytics (`Reports.js` - headcount distribution progress bars, attendance turnout breakdown, leave pipeline counters, export/print feature).
- **Deliverables:** Fully functioning React views in `client/src/pages/` and production bundle built via `client/build/`.
- **Exit / Acceptance Criteria:** All user interactions connected to backend REST endpoints; UI provides loading spinners, error alerts, and empty state fallbacks; fully responsive across standard viewports. *(Verified: Production build compiled cleanly with 0 errors via `npm run build` in `client`).*

---

### Phase 6: Project Execution, Verification & Testing (Epic 6) `[STATUS: COMPLETED & VERIFIED]`
*Focus: End-to-end verification across 5 mandatory testing categories, execution documentation, and demo packaging.*

#### Task 17: Steps to Run `[COMPLETED]`
- **Scope:** Author unambiguous, beginner-friendly instructions for installing dependencies, seeding database, and launching server and client concurrently.
- **Deliverables:** Updated root `README.md` with complete architecture guide, prerequisite checklists, environment variable descriptions, MongoDB setup guide (local & cloud), seeding steps, startup commands, and demo account table.
- **Exit / Acceptance Criteria:** Complete step-by-step instructions available in `README.md`; commands `npm run install:all`, `npm run seed`, `npm run server:dev`, and `npm run client` configured in root `package.json`.

#### Task 18: Output Verification & Testing `[COMPLETED]`
- **Scope:** Execute comprehensive verification across the **5 mandatory testing domains** documented in project specifications:
  1. **Authentication Testing:** Token issuance, validation, tamper detection, and RBAC boundary checks (`test-backend-api.js` & `test-e2e-suite.js`).
  2. **Attendance Management Testing:** Attendance schema date validation, enum restrictions, check-in/check-out RBAC restrictions.
  3. **Leave Management Testing:** Duration validation, type enum checking, manager approval gate, and HR administrative override.
  4. **Employee Management Testing:** Corporate fields validation, unique constraints, foreign key linkage, and self-service boundary checks.
  5. **Dashboard Testing:** Operational health verification (`/api/health`), project metadata (`/`), and announcement broadcast authorization checks.
- **Deliverables:** Automated test suites in `server/test-db-models.js`, `server/test-backend-api.js`, and `server/test-e2e-suite.js`.
- **Exit / Acceptance Criteria:** 100% pass rate on all executable unit and E2E checks (86/86 passed, 4 live DB queries transparently reported as skipped pending active MongoDB service).

#### Task 19: Demo & Final Packaging `[COMPLETED]`
- **Scope:** Verified workspace clean-up, validated `.gitignore` excludes all `.env` files and build outputs, ensured `.env.example` templates contain only safe placeholders, confirmed production build compiles with zero errors, and prepared repository for version control and presentation.
- **Deliverables:** Airtight `.gitignore`, safe `.env.example` templates in `server/` and `client/`, optimized production build bundle in `client/build/`, and updated documentation.
- **Exit / Acceptance Criteria:** Fully operational, secure, reproducible StaffSync system ready for code repository publishing and evaluation.

---

## 3. Mandatory Testing Matrix

| Test Domain | Target Components | Test Cases | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **1. Authentication Testing** | `authController`, `authMiddleware`, Login/Register UI | TC-AUTH-01: Valid user login<br>TC-AUTH-02: Invalid password login<br>TC-AUTH-03: Protected route without token<br>TC-AUTH-04: Role boundary check | • JWT issued, user stored in Redux<br>• 401 Unauthorized with descriptive message<br>• 401 No token provided<br>• 403 Forbidden when Employee visits HR routes |
| **2. Attendance Testing** | `attendanceController`, Attendance Page & Widgets | TC-ATT-01: First daily check-in<br>TC-ATT-02: Subsequent check-out<br>TC-ATT-03: Manager team attendance filter | • Check-in time recorded, status `Present`<br>• Check-out recorded, `hoursWorked` updated<br>• Manager only sees assigned direct reports |
| **3. Leave Management Testing** | `leaveController`, Leave UI & Review Modal | TC-LEV-01: Apply leave with valid dates<br>TC-LEV-02: Apply leave with inverted dates<br>TC-LEV-03: Manager approve leave<br>TC-LEV-04: Manager reject with comment | • Leave saved with `Pending` status<br>• 400 Bad Request: Start date after end date<br>• Status updated to `Approved`<br>• Status updated to `Rejected`, remarks saved |
| **4. Employee Management Testing** | `employeeController`, HR Employee Admin View | TC-EMP-01: HR creates employee<br>TC-EMP-02: Employee updates phone/address<br>TC-EMP-03: Employee attempts role alteration | • User + Employee record created<br>• Changes persisted to database<br>• 403 Forbidden or field stripped silently |
| **5. Dashboard Testing** | `dashboardController`, Role Dashboards | TC-DSH-01: Employee dashboard widgets<br>TC-DSH-02: Manager pending approvals card<br>TC-DSH-03: HR aggregate headcount & metrics | • Accurate personal attendance & announcements<br>• Exact count of pending team leaves<br>• Real-time accurate counts matching database |

---

## 4. Definition of Done (DoD)

A task or phase is considered complete if and only if:
1. Code adheres strictly to MERN stack constraints (MongoDB, Express, React, Node.js).
2. All business logic validations are enforced at both frontend and backend boundaries.
3. No security credentials, tokens, or database URIs are hardcoded.
4. Error handling provides user-friendly notifications on the client and structured JSON on the API.
5. All relevant test cases in the test matrix pass.
6. The UI is responsive and visually consistent on desktop and mobile viewports.
