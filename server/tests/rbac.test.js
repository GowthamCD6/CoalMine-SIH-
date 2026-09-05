import { describe, test, expect } from '@jest/globals';
import { requirePermission } from '../src/middlewares/rbac.middleware.js';

describe('RBAC Middleware Logic', () => {
  test('requirePermission middleware denies request if user is not authenticated', async () => {
    const middleware = requirePermission('ORGANIZATIONS_READ');
    const req = {};
    const res = {};
    let nextCalled = false;
    let nextError = null;

    const next = (err) => {
      nextCalled = true;
      nextError = err;
    };

    await middleware(req, res, next);
    expect(nextCalled).toBe(true);
    expect(nextError).toBeDefined();
    expect(nextError.statusCode).toBe(401);
  });

  test('requirePermission denies request if permission is missing', async () => {
    const middleware = requirePermission('SUPER_ADMIN_MANAGE');
    const req = {
      user: { id: 1, username: 'testuser' },
      resolvedPermissions: [
        { permission_code: 'ORGANIZATIONS_READ', organization_id: 1, mine_id: null },
      ],
    };
    const res = {};
    let nextCalled = false;
    let nextError = null;

    const next = (err) => {
      nextCalled = true;
      nextError = err;
    };

    await middleware(req, res, next);
    expect(nextCalled).toBe(true);
    expect(nextError).toBeDefined();
    expect(nextError.statusCode).toBe(403);
  });

  test('requirePermission allows request if permission matches', async () => {
    const middleware = requirePermission('ORGANIZATIONS_READ');
    const req = {
      user: { id: 1, username: 'testuser' },
      resolvedPermissions: [
        { permission_code: 'ORGANIZATIONS_READ', organization_id: 1, mine_id: null },
      ],
    };
    const res = {};
    let nextCalled = false;
    let nextError = null;

    const next = (err) => {
      nextCalled = true;
      nextError = err;
    };

    await middleware(req, res, next);
    expect(nextCalled).toBe(true);
    expect(nextError).toBeUndefined();
  });

  test('requirePermission checks scope matching correctly', async () => {
    const middleware = requirePermission('ORGANIZATIONS_READ', { scope: 'organization' });
    const req = {
      user: { id: 1, username: 'testuser' },
      params: { id: 2 },
      resolvedPermissions: [
        { permission_code: 'ORGANIZATIONS_READ', organization_id: 1, mine_id: null },
      ],
    };
    const res = {};
    let nextCalled = false;
    let nextError = null;

    const next = (err) => {
      nextCalled = true;
      nextError = err;
    };

    await middleware(req, res, next);
    expect(nextCalled).toBe(true);
    expect(nextError).toBeDefined();
    expect(nextError.statusCode).toBe(403);
  });
});
