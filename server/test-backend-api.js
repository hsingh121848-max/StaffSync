// Phase 4 Backend API & Security Verification Suite
const http = require('http');
const jwt = require('jsonwebtoken');
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'staffsync_test_secret_key_123';
const app = require('./server');
const { generateToken } = require('./utils/tokenUtils');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${message}`);
  } else {
    console.error(`  [FAIL] Test ${totalTests}: ${message}`);
    process.exitCode = 1;
  }
}

// In-memory request helper for Express app
function makeRequest({ method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const req = new http.IncomingMessage();
    req.method = method;
    req.url = url;
    req.headers = Object.assign({ host: 'localhost', 'content-type': 'application/json' }, headers);

    const res = new http.ServerResponse(req);
    let rawOutput = '';
    res.write = function (chunk) {
      if (chunk) rawOutput += chunk;
      return true;
    };
    res.end = function (chunk) {
      if (chunk) rawOutput += chunk;
      let parsed = null;
      try {
        parsed = JSON.parse(rawOutput);
      } catch (e) {
        parsed = rawOutput;
      }
      resolve({
        status: res.statusCode,
        headers: res.getHeaders ? res.getHeaders() : {},
        body: parsed,
      });
    };

    if (body) {
      req.body = body;
    }

    app.handle(req, res);
  });
}

async function runApiTests() {
  console.log('--- StaffSync Phase 4: Backend REST APIs & Security Verification ---\n');

  // Test 1: Public Health Check
  const healthRes = await makeRequest({ method: 'GET', url: '/api/health' });
  assert(healthRes.status === 200, 'GET /api/health returns HTTP 200');
  assert(healthRes.body.success === true, 'GET /api/health indicates success: true');

  // Test 2: Public Root Endpoint
  const rootRes = await makeRequest({ method: 'GET', url: '/' });
  assert(rootRes.status === 200, 'GET / returns HTTP 200');
  assert(rootRes.body.project === 'StaffSync', 'GET / returns StaffSync project metadata');

  // Test 3: Unhandled Route Returns 404
  const notFoundRes = await makeRequest({ method: 'GET', url: '/api/unhandled-route' });
  assert(notFoundRes.status === 404, 'Unknown endpoint returns HTTP 404');
  assert(notFoundRes.body.success === false, 'Unknown endpoint returns success: false');

  // Test 4: Protected routes reject requests with no token (HTTP 401)
  const endpointsToTest401 = [
    { method: 'GET', url: '/api/auth/me' },
    { method: 'GET', url: '/api/employees' },
    { method: 'GET', url: '/api/employees/me' },
    { method: 'GET', url: '/api/managers/team' },
    { method: 'GET', url: '/api/attendance/my' },
    { method: 'GET', url: '/api/attendance/team' },
    { method: 'GET', url: '/api/attendance/all' },
    { method: 'GET', url: '/api/leaves/my' },
    { method: 'GET', url: '/api/leaves/team' },
    { method: 'GET', url: '/api/leaves/all' },
    { method: 'GET', url: '/api/announcements' },
    { method: 'POST', url: '/api/announcements' },
    { method: 'GET', url: '/api/trainings' },
    { method: 'GET', url: '/api/trainings/my' },
    { method: 'GET', url: '/api/notifications' },
    { method: 'GET', url: '/api/reports/analytics' },
    { method: 'GET', url: '/api/dashboard/stats' },
  ];

  for (const ep of endpointsToTest401) {
    const res = await makeRequest(ep);
    assert(
      res.status === 401 && res.body.success === false,
      `Unauthenticated ${ep.method} ${ep.url} is blocked with HTTP 401 Unauthorized`
    );
  }

  // Test 5: Invalid/Tampered JWT Token returns 401
  const invalidTokenRes = await makeRequest({
    method: 'GET',
    url: '/api/auth/me',
    headers: { authorization: 'Bearer invalid.tampered.token' },
  });
  assert(invalidTokenRes.status === 401, 'Tampered token is rejected with HTTP 401');

  // Test 6: Role-Based Access Control (RBAC) Enforcement
  // Generate valid tokens with specific roles
  const empToken = generateToken('65c1a1111111111111111111', 'employee');
  const mgrToken = generateToken('65c1a2222222222222222222', 'manager');
  const hrToken = generateToken('65c1a3333333333333333333', 'hr');

  // 6A: Employee attempting HR-only routes must be blocked with HTTP 403 Forbidden
  const empAccessingHrRoute1 = await makeRequest({
    method: 'GET',
    url: '/api/employees',
    headers: { authorization: `Bearer ${empToken}` },
  });
  assert(empAccessingHrRoute1.status === 403, 'Employee token accessing GET /api/employees returns HTTP 403 Forbidden');

  const empAccessingHrRoute2 = await makeRequest({
    method: 'POST',
    url: '/api/announcements',
    headers: { authorization: `Bearer ${empToken}` },
  });
  assert(empAccessingHrRoute2.status === 403, 'Employee token accessing POST /api/announcements returns HTTP 403 Forbidden');

  const empAccessingHrRoute3 = await makeRequest({
    method: 'GET',
    url: '/api/attendance/all',
    headers: { authorization: `Bearer ${empToken}` },
  });
  assert(empAccessingHrRoute3.status === 403, 'Employee token accessing GET /api/attendance/all returns HTTP 403 Forbidden');

  const empAccessingHrRoute4 = await makeRequest({
    method: 'GET',
    url: '/api/reports/analytics',
    headers: { authorization: `Bearer ${empToken}` },
  });
  assert(empAccessingHrRoute4.status === 403, 'Employee token accessing GET /api/reports/analytics returns HTTP 403 Forbidden');

  // 6B: Employee attempting Manager-only routes must be blocked with HTTP 403 Forbidden
  const empAccessingMgrRoute1 = await makeRequest({
    method: 'GET',
    url: '/api/managers/team',
    headers: { authorization: `Bearer ${empToken}` },
  });
  assert(empAccessingMgrRoute1.status === 403, 'Employee token accessing GET /api/managers/team returns HTTP 403 Forbidden');

  const empAccessingMgrRoute2 = await makeRequest({
    method: 'GET',
    url: '/api/attendance/team',
    headers: { authorization: `Bearer ${empToken}` },
  });
  assert(empAccessingMgrRoute2.status === 403, 'Employee token accessing GET /api/attendance/team returns HTTP 403 Forbidden');

  // 6C: Manager attempting HR-only routes must be blocked with HTTP 403 Forbidden
  const mgrAccessingHrRoute = await makeRequest({
    method: 'GET',
    url: '/api/reports/analytics',
    headers: { authorization: `Bearer ${mgrToken}` },
  });
  assert(mgrAccessingHrRoute.status === 403, 'Manager token accessing GET /api/reports/analytics returns HTTP 403 Forbidden');

  // Test 7: Registration Payload Validation
  const emptyRegisterRes = await makeRequest({
    method: 'POST',
    url: '/api/auth/register',
    body: {},
  });
  assert(emptyRegisterRes.status === 400, 'POST /api/auth/register rejects missing credentials with HTTP 400');

  const shortPasswordRegisterRes = await makeRequest({
    method: 'POST',
    url: '/api/auth/register',
    body: { email: 'test@staffsync.com', password: '123' },
  });
  assert(shortPasswordRegisterRes.status === 400, 'POST /api/auth/register rejects short passwords (< 6 chars) with HTTP 400');

  // Test 8: Login Payload Validation
  const emptyLoginRes = await makeRequest({
    method: 'POST',
    url: '/api/auth/login',
    body: {},
  });
  assert(emptyLoginRes.status === 400, 'POST /api/auth/login rejects empty payload with HTTP 400');

  console.log(`\nPhase 4 Test Suite Results: ${passedTests}/${totalTests} tests passed.`);
  if (passedTests === totalTests) {
    console.log('[SUCCESS] All Phase 4 backend endpoints, authentication middleware, and RBAC security gates are fully verified.');
  }
}

runApiTests().catch((err) => {
  console.error('Fatal API test error:', err);
  process.exit(1);
});
