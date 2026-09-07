import PagesRepository from './pages.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { buildMeta } from '../../utils/pagination.js';
import { getUserEffectivePermissions } from '../../middlewares/rbac.middleware.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE, STATUS } from '../../config/constants.js';

export class PagesService {
  static async listPages(pagination, filters) {
    const { total, rows } = await PagesRepository.findAll({
      status: filters.status,
      parent_id: filters.parent_id,
      type: filters.type,
      search: filters.search,
      limit: pagination.limit,
      offset: pagination.offset,
      sort: pagination.sort,
      order: pagination.order,
    });

    const meta = buildMeta(total, pagination.page, pagination.limit);
    return { pages: rows, meta };
  }

  static async getPageById(id) {
    const page = await PagesRepository.findById(id);
    if (!page) {
      throw ApiError.notFound(`Page with ID ${id} not found`);
    }
    return page;
  }

  static async getPageTreeForUser(userId) {
    const effectivePermissions = await getUserEffectivePermissions(userId);
    const userPermissionCodes = new Set(effectivePermissions.map((p) => p.permission_code));
    const isSuperAdmin = userPermissionCodes.has('*') || userPermissionCodes.has('ALL_PERMISSIONS');

    const rawRows = await PagesRepository.getAllActivePagesWithPermissions();

    // Group permissions per page
    const pageMap = new Map();
    for (const row of rawRows) {
      if (!pageMap.has(row.id)) {
        pageMap.set(row.id, {
          id: row.id,
          name: row.name,
          code: row.code,
          route: row.route,
          parent_id: row.parent_id,
          icon: row.icon,
          sort_order: row.sort_order,
          type: row.type,
          status: row.status,
          requiredPermissions: [],
          children: [],
        });
      }

      if (row.permission_code) {
        pageMap.get(row.id).requiredPermissions.push(row.permission_code);
      }
    }

    // Filter pages accessible to user
    const accessiblePages = new Map();
    for (const [id, page] of pageMap.entries()) {
      if (
        isSuperAdmin ||
        page.requiredPermissions.length === 0 ||
        page.requiredPermissions.some((perm) => userPermissionCodes.has(perm))
      ) {
        accessiblePages.set(id, { ...page });
      }
    }

    // Build hierarchical tree
    const rootNodes = [];
    for (const page of accessiblePages.values()) {
      if (page.parent_id && accessiblePages.has(page.parent_id)) {
        accessiblePages.get(page.parent_id).children.push(page);
      } else {
        rootNodes.push(page);
      }
    }

    return rootNodes;
  }

  static async createPage(data, actor = {}, ipAddress = null) {
    const existing = await PagesRepository.findByCode(data.code);
    if (existing) {
      throw ApiError.conflict(`Page with code '${data.code}' already exists`);
    }

    if (data.parent_id) {
      const parent = await PagesRepository.findById(data.parent_id);
      if (!parent) {
        throw ApiError.badRequest(`Parent page with ID ${data.parent_id} does not exist`);
      }
    }

    const pageId = await PagesRepository.create(data);
    const createdPage = await PagesRepository.findById(pageId);

    await logAudit({
      userId: actor.id,
      action: AUDIT_ACTION.CREATE,
      entityType: ENTITY_TYPE.PAGE,
      entityId: pageId,
      newData: createdPage,
      ipAddress,
    });

    return createdPage;
  }

  static async updatePage(id, data, actor = {}, ipAddress = null) {
    const oldPage = await this.getPageById(id);

    if (data.code && data.code !== oldPage.code) {
      const existing = await PagesRepository.findByCode(data.code);
      if (existing && existing.id !== Number(id)) {
        throw ApiError.conflict(`Page with code '${data.code}' already exists`);
      }
    }

    if (data.parent_id) {
      if (Number(data.parent_id) === Number(id)) {
        throw ApiError.badRequest('A page cannot be its own parent');
      }
      const parent = await PagesRepository.findById(data.parent_id);
      if (!parent) {
        throw ApiError.badRequest(`Parent page with ID ${data.parent_id} does not exist`);
      }
    }

    await PagesRepository.update(id, data);
    const updatedPage = await PagesRepository.findById(id);

    await logAudit({
      userId: actor.id,
      action: AUDIT_ACTION.UPDATE,
      entityType: ENTITY_TYPE.PAGE,
      entityId: Number(id),
      oldData: oldPage,
      newData: updatedPage,
      ipAddress,
    });

    return updatedPage;
  }

  static async deletePage(id, actor = {}, ipAddress = null) {
    const oldPage = await this.getPageById(id);

    await PagesRepository.setStatus(id, STATUS.INACTIVE);
    const updatedPage = await PagesRepository.findById(id);

    await logAudit({
      userId: actor.id,
      action: AUDIT_ACTION.DELETE,
      entityType: ENTITY_TYPE.PAGE,
      entityId: Number(id),
      oldData: oldPage,
      newData: updatedPage,
      ipAddress,
    });

    return { message: 'Page deactivated successfully' };
  }
}

export default PagesService;
