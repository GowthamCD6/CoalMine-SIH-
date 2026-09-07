import { describe, test, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import AuthService from '../src/modules/auth/auth.service.js';

describe('Auth Service & Endpoints', () => {
  test('AuthService.generateTokens returns accessToken and refreshToken', () => {
    const tokens = AuthService.generateTokens(101);
    expect(tokens).toHaveProperty('accessToken');
    expect(tokens).toHaveProperty('refreshToken');
    expect(typeof tokens.accessToken).toBe('string');
    expect(typeof tokens.refreshToken).toBe('string');
  });

  test('GET / returns API server info with 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.name).toContain('CoalMin API Server');
    expect(res.body.status).toBe('online');
  });

  test('GET /api/v1/health returns status 200 with envelope', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('OK');
  });

  test('POST /api/v1/auth/register fails on missing fields with validation error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'ab', // min is 3
        email: 'invalid-email',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/v1/auth/login fails on missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('GET /api/v1/auth/me rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
