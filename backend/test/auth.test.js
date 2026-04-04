/**
 * Neighbourhood Help Network — API Test Suite
 * Author: Nalin Jayswal
 *
 * Tests the full API using Mocha (test runner) + Chai (assertions)
 * + chai-http (HTTP request helper).
 *
 * Test coverage:
 *   ✔ Health check endpoint
 *   ✔ User registration (success + duplicate rejection)
 *   ✔ User login (success + wrong password)
 *   ✔ Profile retrieval (authenticated + unauthenticated)
 *   ✔ Help request CRUD (Create, Read, Update, Delete)
 *   ✔ Unauthorised access rejection
 *
 * NOTE: Requires MONGO_URI and JWT_SECRET in .env
 *       Tests run against the real Atlas DB (uses unique emails to avoid conflicts)
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.use(chaiHttp);
const { expect } = chai;

// Use a unique email per test run so tests don't clash on Atlas
const timestamp = Date.now();
const testUser = {
  name: 'Nalin Jayswal',
  email: `nalin_test_${timestamp}@nhn.com`,
  password: 'TestPassword123',
  address: 'Brisbane, QLD',
};

let authToken = '';
let requestId = '';

// ─────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const res = await chai.request(app).get('/api/health');
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('status', 'ok');
    expect(res.body).to.have.property('author', 'Nalin Jayswal');
  });
});

// ─────────────────────────────────────────────────────────────
// Authentication Tests
// ─────────────────────────────────────────────────────────────
describe('Auth Routes', () => {

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a JWT token', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send(testUser);
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('email', testUser.email);
      expect(res.body).to.have.property('name', testUser.name);
      authToken = res.body.token; // Save token for subsequent tests
    });

    it('should reject registration with a duplicate email', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send(testUser);
      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token');
    });

    it('should reject login with an incorrect password', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });
      expect(res).to.have.status(401);
      expect(res.body).to.have.property('message', 'Invalid email or password');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile for authenticated requests', async () => {
      const res = await chai.request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('name', testUser.name);
      expect(res.body).to.have.property('email', testUser.email);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const res = await chai.request(app).get('/api/auth/profile');
      expect(res).to.have.status(401);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// Help Request CRUD Tests
// ─────────────────────────────────────────────────────────────
describe('Help Request Routes', () => {

  describe('POST /api/helprequests — Create', () => {
    it('should create a new help request when authenticated', async () => {
      const res = await chai.request(app)
        .post('/api/helprequests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Need help carrying groceries',
          description: 'I have a knee injury and need help from Woolworths.',
          category: 'Groceries',
          location: 'Paddington, QLD',
          dateNeeded: '2026-12-01',
          isUrgent: true,
        });
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('title', 'Need help carrying groceries');
      expect(res.body).to.have.property('isUrgent', true);
      expect(res.body).to.have.property('status', 'Open');
      requestId = res.body._id;
    });

    it('should return 401 when creating without a token', async () => {
      const res = await chai.request(app)
        .post('/api/helprequests')
        .send({ title: 'Test' });
      expect(res).to.have.status(401);
    });
  });

  describe('GET /api/helprequests — Read All', () => {
    it('should return an array of community help requests', async () => {
      const res = await chai.request(app)
        .get('/api/helprequests')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.greaterThan(0);
    });

    it('should support filtering by category', async () => {
      const res = await chai.request(app)
        .get('/api/helprequests?category=Groceries')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(200);
      res.body.forEach((r) => expect(r.category).to.equal('Groceries'));
    });
  });

  describe('GET /api/helprequests/mine — Read My Requests', () => {
    it('should return only the current user\'s requests', async () => {
      const res = await chai.request(app)
        .get('/api/helprequests/mine')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.greaterThan(0);
    });
  });

  describe('GET /api/helprequests/:id — Read Single', () => {
    it('should return a single help request by ID', async () => {
      const res = await chai.request(app)
        .get(`/api/helprequests/${requestId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('_id', requestId);
    });
  });

  describe('PUT /api/helprequests/:id — Update', () => {
    it('should update a help request owned by the user', async () => {
      const res = await chai.request(app)
        .put(`/api/helprequests/${requestId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated: Urgent grocery help needed', status: 'In Progress' });
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('title', 'Updated: Urgent grocery help needed');
      expect(res.body).to.have.property('status', 'In Progress');
    });
  });

  describe('DELETE /api/helprequests/:id — Delete', () => {
    it('should delete a help request owned by the user', async () => {
      const res = await chai.request(app)
        .delete(`/api/helprequests/${requestId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Help request deleted successfully');
    });

    it('should return 404 when deleting an already-deleted request', async () => {
      const res = await chai.request(app)
        .delete(`/api/helprequests/${requestId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(404);
    });
  });
});
