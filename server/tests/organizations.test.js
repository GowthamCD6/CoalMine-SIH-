import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import AuthService from '../src/modules/auth/auth.service.js';

describe('Organizations Endpoints & Protection', () => {
  test('GET /api/v1/organizations without auth token returns 401', async () => {
    const res = await request(app).get('/api/v1/organizations');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication token is required');
  });

  test('POST /api/v1/organizations without auth token returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/organizations')
      .send({ name: 'Test Org', code: 'TEST_ORG' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
