import express from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import organizationsRoutes from '../modules/organizations/organizations.routes.js';
import minesRoutes from '../modules/mines/mines.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import rolesRoutes from '../modules/roles/roles.routes.js';
import subrolesRoutes from '../modules/subroles/subroles.routes.js';
import permissionsRoutes from '../modules/permissions/permissions.routes.js';
import rolePermissionsRoutes from '../modules/role-permissions/role-permissions.routes.js';
import subrolePermissionsRoutes from '../modules/subrole-permissions/subrole-permissions.routes.js';
import { userSubrolesRouter, subroleUsersRouter } from '../modules/user-subroles/user-subroles.routes.js';
import delegationRouter from '../modules/user-subroles/delegation.routes.js';
import mobileOpsRouter from '../modules/mobile-ops/mobile-ops.routes.js';
import pagesRoutes from '../modules/pages/pages.routes.js';
import pagePermissionsRoutes from '../modules/page-permissions/page-permissions.routes.js';
import userSessionsRoutes from '../modules/user-sessions/user-sessions.routes.js';
import auditLogsRoutes from '../modules/audit-logs/audit-logs.routes.js';
import materialsRoutes from '../modules/materials/materials.routes.js';
import db from '../config/db.js';

const router = express.Router();

// Health Check on v1
router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    if (rows && rows[0]?.ok === 1) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = 'error: ' + err.message;
  }

  res.status(200).json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime(),
    },
    message: 'CoalMin API v1 is healthy',
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/organizations', organizationsRoutes);
router.use('/mines', minesRoutes);
router.use('/delegation', delegationRouter);
router.use('/users/delegation-scope', delegationRouter);
router.use('/users', usersRoutes);
router.use('/users/:userId/subroles', userSubrolesRouter);
router.use('/subroles/:subroleId/users', subroleUsersRouter);
router.use('/roles', rolesRoutes);
router.use('/roles/:roleId/permissions', rolePermissionsRoutes);
router.use('/subroles', subrolesRoutes);
router.use('/subroles/:subroleId/permissions', subrolePermissionsRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/pages', pagesRoutes);
router.use('/pages/:pageId/permissions', pagePermissionsRoutes);
router.use('/sessions', userSessionsRoutes);
router.use('/audit-logs', auditLogsRoutes);
router.use('/materials', materialsRoutes);
router.use('/mobile-ops', mobileOpsRouter);
router.use('/', mobileOpsRouter);

export default router;
