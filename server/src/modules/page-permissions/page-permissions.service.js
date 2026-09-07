import PagePermissionsRepository from './page-permissions.repository.js';
import PagesRepository from '../pages/pages.repository.js';
import PermissionsRepository from '../permissions/permissions.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE } from '../../config/constants.js';

export class PagePermissionsService {
  static async getPagePermissions(pageId) {
    const page = await PagesRepository.findById(pageId);
    if (!page) {
      throw ApiError.notFound(`Page with ID ${pageId} not found`);
    }

    const permissions = await PagePermissionsRepository.findByPageId(pageId);
    return { page, permissions };
  }

  static async attachPermission(pageId, permissionId, actor = {}, ipAddress = null) {
    const page = await PagesRepository.findById(pageId);
    if (!page) {
      throw ApiError.notFound(`Page with ID ${pageId} not found`);
    }

    const permission = await PermissionsRepository.findById(permissionId);
    if (!permission) {
      throw ApiError.notFound(`Permission with ID ${permissionId} not found`);
    }

    const existing = await PagePermissionsRepository.findMapping(pageId, permissionId);
    if (existing) {
      throw ApiError.conflict('This permission is already assigned to the page');
    }

    const id = await PagePermissionsRepository.attach(pageId, permissionId);

    await logAudit({
      userId: actor.id,
      action: AUDIT_ACTION.ASSIGN,
      entityType: ENTITY_TYPE.PAGE_PERMISSION,
      entityId: id,
      newData: { page_id: pageId, permission_id: permissionId, permission_code: permission.code },
      ipAddress,
    });

    return {
      id,
      page_id: Number(pageId),
      permission_id: Number(permissionId),
      permission_code: permission.code,
      permission_name: permission.name,
    };
  }

  static async detachPermission(pageId, permissionId, actor = {}, ipAddress = null) {
    const page = await PagesRepository.findById(pageId);
    if (!page) {
      throw ApiError.notFound(`Page with ID ${pageId} not found`);
    }

    const existing = await PagePermissionsRepository.findMapping(pageId, permissionId);
    if (!existing) {
      throw ApiError.notFound('Permission is not assigned to this page');
    }

    await PagePermissionsRepository.detach(pageId, permissionId);

    await logAudit({
      userId: actor.id,
      action: AUDIT_ACTION.UNASSIGN,
      entityType: ENTITY_TYPE.PAGE_PERMISSION,
      entityId: existing.id,
      oldData: existing,
      ipAddress,
    });

    return { message: 'Permission detached from page successfully' };
  }
}

export default PagePermissionsService;
