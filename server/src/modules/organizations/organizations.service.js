import OrganizationsRepository from './organizations.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { buildMeta } from '../../utils/pagination.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE, STATUS } from '../../config/constants.js';

export class OrganizationsService {
  static async listOrganizations(pagination, filters) {
    const { total, rows } = await OrganizationsRepository.findAll({
      status: filters.status,
      search: filters.search,
      limit: pagination.limit,
      offset: pagination.offset,
      sort: pagination.sort,
      order: pagination.order,
    });

    const meta = buildMeta(total, pagination.page, pagination.limit);
    return { organizations: rows, meta };
  }

  static async getOrganizationById(id) {
    const org = await OrganizationsRepository.findById(id);
    if (!org) {
      throw ApiError.notFound(`Organization with ID ${id} not found`);
    }
    return org;
  }

  static async createOrganization(data, actor = {}, ipAddress = null) {
    const existing = await OrganizationsRepository.findByCode(data.code);
    if (existing) {
      throw ApiError.conflict(`Organization with code '${data.code}' already exists`);
    }

    const orgId = await OrganizationsRepository.create(data);
    const createdOrg = await OrganizationsRepository.findById(orgId);

    await logAudit({
      userId: actor.id,
      organizationId: orgId,
      action: AUDIT_ACTION.CREATE,
      entityType: ENTITY_TYPE.ORGANIZATION,
      entityId: orgId,
      newData: createdOrg,
      ipAddress,
    });

    return createdOrg;
  }

  static async updateOrganization(id, data, actor = {}, ipAddress = null) {
    const oldOrg = await this.getOrganizationById(id);

    if (data.code && data.code !== oldOrg.code) {
      const existing = await OrganizationsRepository.findByCode(data.code);
      if (existing && existing.id !== Number(id)) {
        throw ApiError.conflict(`Organization with code '${data.code}' already exists`);
      }
    }

    await OrganizationsRepository.update(id, data);
    const updatedOrg = await OrganizationsRepository.findById(id);

    await logAudit({
      userId: actor.id,
      organizationId: Number(id),
      action: AUDIT_ACTION.UPDATE,
      entityType: ENTITY_TYPE.ORGANIZATION,
      entityId: Number(id),
      oldData: oldOrg,
      newData: updatedOrg,
      ipAddress,
    });

    return updatedOrg;
  }

  static async deleteOrganization(id, actor = {}, ipAddress = null) {
    const oldOrg = await this.getOrganizationById(id);

    await OrganizationsRepository.setStatus(id, STATUS.INACTIVE);
    const updatedOrg = await OrganizationsRepository.findById(id);

    await logAudit({
      userId: actor.id,
      organizationId: Number(id),
      action: AUDIT_ACTION.DELETE,
      entityType: ENTITY_TYPE.ORGANIZATION,
      entityId: Number(id),
      oldData: oldOrg,
      newData: updatedOrg,
      ipAddress,
    });

    return { message: 'Organization deactivated successfully' };
  }
}

export default OrganizationsService;
