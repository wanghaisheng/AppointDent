import http from 'k6/http';
import { check, sleep } from 'k6';

const host = 'http://localhost:3000/api/v1/dentists';
export const options = {
  stages: [
    { duration: '1s', target: 3000 }, // Ramp up to 100 virtual users in 1 minute
    { duration: '1m', target: 3000 } // Ramp up to 200 virtual users in 1 minute
  ],
  http_req_timeout: 30000
};

interface User {
  email: string
  cookies: any
}

// Function to generate a unique email address for each virtual user
function generateUniqueEmail (): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7); // Generate a random string
  return `test${timestamp}_${randomString}@example.com`;
}

// Function to simulate user registration
function registerDentist (): User {
  const payload = {
    email: generateUniqueEmail(),
    firstName: 'Dentist',
    lastName: 'Doe',
    clinicCountry: 'Sweden',
    clinicCity: 'Göteborg',
    clinicStreet: 'Street',
    clinicHouseNumber: '1',
    clinicZipCode: '12345',
    picture: 'base64encodedimage',
    password: 'Password123!'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  // Make a POST request to your registration endpoint
  const res = http.post(host + '/register', JSON.stringify(payload), { headers });

  // Check for expected status codes
  check(res, {
    'Status is 201': (r) => r.status === 201,
    'Status is not 401': (r) => r.status !== 401
  });

  // Add the registered email to the array
  const user: User = { email: payload.email, cookies: undefined };

  return user;
}

// Function to simulate user login
function loginDentist (user: User): User {
  const loginEmail = user.email;
  const payload = {
    email: loginEmail,
    password: 'Password123!'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  // Make a POST request to your login endpoint
  const res = http.post(host + '/login', JSON.stringify(payload), { headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  user.cookies = res.cookies;
  return user;
}

// Function to simulate getting all dentists
function getAllDentists (): void {
  const headers = {
    'Content-Type': 'application/json'
  };

  // Make a POST request to your login endpoint
  const res = http.get(host + '/', { headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  // Simulate user think time
  sleep(3);
}

function getDentist (user: User): void {
  const headers = {
    'Content-Type': 'application/json'
  };

  // Make a POST request to your login endpoint
  const res = http.get(`http://localhost:3005/${user.email}`, { headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Function to simulate dentist patching
function patchDentist (user: User): void {
  const payload = {
    lastName: 'Dentist'
  };

  const loginEmail = user.email;
  const cookies = user.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  // Make a PATCH request to modify the dentist information
  const res = http.patch(`http://localhost:3005/${loginEmail}`, JSON.stringify(payload), { headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Function to simulate dentist logging out
function logoutDentist (user: User): void {
  const cookies = user.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  // Make a DELETE request to remove the dentist's cookie
  const res = http.del(host + '/logout', null, { headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}
export default function (): void {
  // Simulate dentist registration
  let user: User = registerDentist();

  // Simulate dentist login
  user = loginDentist(user);

  // Simulate getting all dentists
  getAllDentists();

  // Simulate getting a dentist
  getDentist(user);

  // Simulae patching a dentist
  patchDentist(user);

  // Simulate logging out a dentist
  logoutDentist(user);
  // Calculate how long the actions took to execute
}
