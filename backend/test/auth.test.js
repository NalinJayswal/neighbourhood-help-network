const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
require('dotenv').config();

chai.use(chaiHttp);
const { expect } = chai;

let app;
const timestamp = Date.now();
const testUser = {
  name: 'Nalin Jayswal',
  email: `nalin_test_${timestamp}@network.com`,
  password: 'TestPassword123',
  address: 'Brisbane, QLD',
};

let authToken = '';
let requestId = '';

before(async function () {
  this.timeout(20000);
  await mongoose.connect(process.env.MONGO_URI);
  app = require('../server');
});

after(async function () {
  await mongoose.disconnect();
});

describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const res = await chai.request(app).get('/api/health');
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('status', 'ok');
  });
});

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user and return a JWT token', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send(testUser);
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('token');
      authToken = res.body.token;
    });

    it('should reject duplicate email', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send(testUser);
      expect(res).to.have.status(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token');
    });

    it('should reject wrong password', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });
      expect(res).to.have.status(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return profile when authenticated', async () => {
      const res = await chai.request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(200);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const res = await chai.request(app).get('/api/auth/profile');
      expect(res).to.have.status(401);
    });
  });
});

describe('Help Request Routes', () => {
  describe('POST /api/helprequests', () => {
    it('should create a new help request', async () => {
      const res = await chai.request(app)
        .post('/api/helprequests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Need help with groceries',
          description: 'Knee injury, need help from Woolworths.',
          category: 'Groceries',
          location: 'Paddington, QLD',
          dateNeeded: '2026-12-01',
          isUrgent: true,
        });
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('title');
      requestId = res.body._id;
    });

    it('should return 401 without token', async () => {
      const res = await chai.request(app)
        .post('/api/helprequests')
        .send({ title: 'Test' });
      expect(res).to.have.status(401);
    });
  });

  describe('GET /api/helprequests', () => {
    it('should return array of requests', async () => {
      const res = await chai.request(app)
        .get('/api/helprequests')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });

    it('should support category filter', async () => {
      const res = await chai.request(app)
        .get('/api/helprequests?category=Groceries')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(200);
    });
  });

  describe('GET /api/helprequests/mine', () => {
    it('should return current user requests', async () => {
      const res = await chai.request(app)
        .get('/api/helprequests/mine')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('GET /api/helprequests/:id', () => {
    it('should return single request by ID', async () => {
      const res = await chai.request(app)
        .get(`/api/helprequests/${requestId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(200);
    });
  });

  describe('PUT /api/helprequests/:id', () => {
    it('should update a request', async () => {
      const res = await chai.request(app)
        .put(`/api/helprequests/${requestId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated title', status: 'In Progress' });
      expect(res).to.have.status(200);
    });
  });

  describe('DELETE /api/helprequests/:id', () => {
    it('should delete a request', async () => {
      const res = await chai.request(app)
        .delete(`/api/helprequests/${requestId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(200);
    });

    it('should return 404 for already deleted request', async () => {
      const res = await chai.request(app)
        .delete(`/api/helprequests/${requestId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res).to.have.status(404);
    });
  });
});