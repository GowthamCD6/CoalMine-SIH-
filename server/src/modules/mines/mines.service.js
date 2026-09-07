import MinesRepository from './mines.repository.js';
import OrganizationsRepository from '../organizations/organizations.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { buildMeta } from '../../utils/pagination.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE, STATUS } from '../../config/constants.js';

export class MinesService {
  static async listMines(pagination, filters) {
    const { total, rows } = await MinesRepository.findAll({
      organization_id: filters.organization_id,
      mine_type: filters.mine_type,
      status: filters.status,
      search: filters.search,
      limit: pagination.limit,
      offset: pagination.offset,
      sort: pagination.sort,
      order: pagination.order,
    });

    const meta = buildMeta(total, pagination.page, pagination.limit);
    return { mines: rows, meta };
  }

  static async getMineById(id) {
    const mine = await MinesRepository.findById(id);
    if (!mine) {
      throw ApiError.notFound(`Mine with ID ${id} not found`);
    }
    return mine;
  }

  static async createMine(data, actor = {}, ipAddress = null) {
    // Validate organization existence
    const org = await OrganizationsRepository.findById(data.organization_id);
    if (!org) {
      throw ApiError.badRequest(`Organization with ID ${data.organization_id} does not exist`);
    }

    const existing = await MinesRepository.findByOrgAndCode(data.organization_id, data.code);
    if (existing) {
      throw ApiError.conflict(`Mine with code '${data.code}' already exists in this organization`);
    }

    const mineId = await MinesRepository.create(data);
    const createdMine = await MinesRepository.findById(mineId);

    await logAudit({
      userId: actor.id,
      organizationId: data.organization_id,
      mineId,
      action: AUDIT_ACTION.CREATE,
      entityType: ENTITY_TYPE.MINE,
      entityId: mineId,
      newData: createdMine,
      ipAddress,
    });

    return createdMine;
  }

  static async updateMine(id, data, actor = {}, ipAddress = null) {
    const oldMine = await this.getMineById(id);

    const targetOrgId = data.organization_id || oldMine.organization_id;
    if (data.organization_id && data.organization_id !== oldMine.organization_id) {
      const org = await OrganizationsRepository.findById(data.organization_id);
      if (!org) {
        throw ApiError.badRequest(`Organization with ID ${data.organization_id} does not exist`);
      }
    }

    const targetCode = data.code || oldMine.code;
    if (data.code || data.organization_id) {
      const existing = await MinesRepository.findByOrgAndCode(targetOrgId, targetCode);
      if (existing && existing.id !== Number(id)) {
        throw ApiError.conflict(`Mine with code '${targetCode}' already exists in this organization`);
      }
    }

    await MinesRepository.update(id, data);
    const updatedMine = await MinesRepository.findById(id);

    await logAudit({
      userId: actor.id,
      organizationId: updatedMine.organization_id,
      mineId: Number(id),
      action: AUDIT_ACTION.UPDATE,
      entityType: ENTITY_TYPE.MINE,
      entityId: Number(id),
      oldData: oldMine,
      newData: updatedMine,
      ipAddress,
    });

    return updatedMine;
  }

  static async deleteMine(id, actor = {}, ipAddress = null) {
    const oldMine = await this.getMineById(id);

    await MinesRepository.setStatus(id, STATUS.INACTIVE);
    const updatedMine = await MinesRepository.findById(id);

    await logAudit({
      userId: actor.id,
      organizationId: oldMine.organization_id,
      mineId: Number(id),
      action: AUDIT_ACTION.DELETE,
      entityType: ENTITY_TYPE.MINE,
      entityId: Number(id),
      oldData: oldMine,
      newData: updatedMine,
      ipAddress,
    });

    return { message: 'Mine deactivated successfully' };
  }
}

export default MinesService;
