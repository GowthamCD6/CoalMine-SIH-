import MaterialsRepository from './materials.repository.js';
import AuthRepository from '../auth/auth.repository.js';
import MinesRepository from '../mines/mines.repository.js';
import OrganizationsRepository from '../organizations/organizations.repository.js';
import { getUserEffectivePermissions } from '../../middlewares/rbac.middleware.js';
import { ApiError } from '../../utils/ApiError.js';
import { buildMeta } from '../../utils/pagination.js';
import { logAudit } from '../../middlewares/audit.middleware.js';
import { AUDIT_ACTION, ENTITY_TYPE } from '../../config/constants.js';

export class MaterialsService {
  /**
   * Determine actor's effective scope and clearance tier
   */
  static async resolveActorScope(actorId) {
    const permissions = await getUserEffectivePermissions(actorId);
    const subroles = await AuthRepository.getUserSubrolesWithScope(actorId);

    const isGlobalSuperAdmin = permissions.some(
      (p) => p.permission_code === '*' || p.permission_code === 'ALL_PERMISSIONS'
    ) || subroles.some((s) => s.role_code === 'SUPER_ADMIN' || s.subrole_code === 'FULL_ACCESS_ROOT');

    const primarySubrole = subroles[0] || null;
    const actorOrgId = primarySubrole?.organization_id ? Number(primarySubrole.organization_id) : null;
    const actorOrgName = primarySubrole?.organization_name || null;
    const actorMineId = primarySubrole?.mine_id ? Number(primarySubrole.mine_id) : null;
    const actorMineName = primarySubrole?.mine_name || null;
    const roleCode = primarySubrole?.role_code || '';

    let roleType = 'MINE_STAFF';
    if (isGlobalSuperAdmin) {
      roleType = 'SUPER_ADMIN';
    } else if (actorOrgId && !actorMineId) {
      roleType = 'ORG_ADMIN';
    } else if (actorMineId && (roleCode.includes('ADMIN') || roleCode.includes('MGR') || roleCode.includes('HEAD'))) {
      roleType = 'MINE_ADMIN';
    }

    return {
      isGlobalSuperAdmin,
      roleType,
      actorOrgId,
      actorOrgName,
      actorMineId,
      actorMineName,
      primarySubrole,
    };
  }

  /**
   * Apply strict hierarchical filtering based on actor's role
   */
  static applyScopeConstraints(filters, scope) {
    const finalFilters = { ...filters };

    if (scope.isGlobalSuperAdmin) {
      // Super Admin: Can view all orgs and mines, or filter by requested org/mine
      if (filters.organization_id) {
        finalFilters.organization_id = Number(filters.organization_id);
      }
      if (filters.mine_id) {
        finalFilters.mine_id = Number(filters.mine_id);
      }
    } else if (scope.roleType === 'ORG_ADMIN') {
      // Org Admin: Locked to own organization, can filter by mines in that org
      finalFilters.organization_id = scope.actorOrgId;
      if (filters.mine_id) {
        finalFilters.mine_id = Number(filters.mine_id);
      }
    } else {
      // Mine Admin & Site Staff: Strictly locked to own organization & own mine branch
      finalFilters.organization_id = scope.actorOrgId;
      finalFilters.mine_id = scope.actorMineId;
    }

    return finalFilters;
  }

  static async listMaterials(pagination, filters, actor) {
    const scope = await this.resolveActorScope(actor.id);
    const constrainedFilters = this.applyScopeConstraints(filters, scope);

    const { total, rows } = await MaterialsRepository.findAll({
      organization_id: constrainedFilters.organization_id,
      mine_id: constrainedFilters.mine_id,
      category: constrainedFilters.category,
      status: constrainedFilters.status,
      search: constrainedFilters.search,
      start_date: constrainedFilters.start_date,
      end_date: constrainedFilters.end_date,
      limit: pagination.limit,
      offset: pagination.offset,
      sort: pagination.sort,
      order: pagination.order,
    });

    const meta = buildMeta(total, pagination.page, pagination.limit);

    return {
      materials: rows,
      meta,
      applied_scope: {
        role_type: scope.roleType,
        is_global: scope.isGlobalSuperAdmin,
        organization_id: constrainedFilters.organization_id || null,
        organization_name: scope.actorOrgName,
        mine_id: constrainedFilters.mine_id || null,
        mine_name: scope.actorMineName,
      },
    };
  }

  static async getSummary(filters, actor) {
    const scope = await this.resolveActorScope(actor.id);
    const constrainedFilters = this.applyScopeConstraints(filters, scope);

    const summary = await MaterialsRepository.getSummary({
      organization_id: constrainedFilters.organization_id,
      mine_id: constrainedFilters.mine_id,
      category: constrainedFilters.category,
      start_date: constrainedFilters.start_date,
      end_date: constrainedFilters.end_date,
    });

    return {
      ...summary,
      applied_scope: {
        role_type: scope.roleType,
        is_global: scope.isGlobalSuperAdmin,
        organization_id: constrainedFilters.organization_id || null,
        organization_name: scope.actorOrgName,
        mine_id: constrainedFilters.mine_id || null,
        mine_name: scope.actorMineName,
      },
    };
  }

  static async getMaterialById(id, actor) {
    const material = await MaterialsRepository.findById(id);
    if (!material) {
      throw ApiError.notFound(`Material inward consignment with ID ${id} not found`);
    }

    const scope = await this.resolveActorScope(actor.id);

    // Check authorization to view this particular material record
    if (!scope.isGlobalSuperAdmin) {
      if (scope.roleType === 'ORG_ADMIN') {
        if (Number(material.organization_id) !== scope.actorOrgId) {
          throw ApiError.forbidden('Access denied to material records outside your organization');
        }
      } else {
        // Mine scoped
        if (Number(material.mine_id) !== scope.actorMineId) {
          throw ApiError.forbidden('Access denied to material records outside your assigned mine branch');
        }
      }
    }

    return material;
  }

  static async createMaterialLog(data, actor, ipAddress = null) {
    const scope = await this.resolveActorScope(actor.id);

    let targetOrgId = data.organization_id;
    let targetMineId = data.mine_id;

    if (scope.isGlobalSuperAdmin) {
      // If Super Admin didn't specify mine, fetch default first active mine
      if (!targetMineId) {
        const { rows } = await MinesRepository.findAll({ limit: 1, offset: 0, sort: 'id', order: 'ASC' });
        if (rows && rows.length > 0) {
          targetMineId = rows[0].id;
          targetOrgId = rows[0].organization_id;
        } else {
          throw ApiError.badRequest('No active mine branch available to assign material log');
        }
      } else {
        const mine = await MinesRepository.findById(targetMineId);
        if (!mine) throw ApiError.badRequest(`Mine with ID ${targetMineId} does not exist`);
        targetOrgId = mine.organization_id;
      }
    } else if (scope.roleType === 'ORG_ADMIN') {
      targetOrgId = scope.actorOrgId;
      if (!targetMineId) {
        // Find first mine in org
        const { rows } = await MinesRepository.findAll({ organization_id: targetOrgId, limit: 1, offset: 0, sort: 'id', order: 'ASC' });
        if (rows && rows.length > 0) {
          targetMineId = rows[0].id;
        } else {
          throw ApiError.badRequest('No mine branch found in your organization to assign material log');
        }
      } else {
        const mine = await MinesRepository.findById(targetMineId);
        if (!mine || Number(mine.organization_id) !== targetOrgId) {
          throw ApiError.badRequest(`Mine with ID ${targetMineId} does not belong to your organization`);
        }
      }
    } else {
      // Mine Admin or Staff: locked to their assigned mine
      if (!scope.actorMineId || !scope.actorOrgId) {
        throw ApiError.forbidden('Your account is not assigned to an active mine station to log materials');
      }
      targetOrgId = scope.actorOrgId;
      targetMineId = scope.actorMineId;
    }

    // Auto-calculate Net Weight if gross and tare are supplied and net is missing
    let netWeight = data.net_weight_tons;
    if (data.gross_weight_tons && data.tare_weight_tons && (netWeight === undefined || netWeight === null)) {
      netWeight = Math.max(0, Number(data.gross_weight_tons) - Number(data.tare_weight_tons));
    }

    // Generate unique consignment number
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const consignmentNumber = `MAT-${new Date().getFullYear()}-${randomSuffix}`;

    const newLogData = {
      ...data,
      consignment_number: consignmentNumber,
      organization_id: targetOrgId,
      mine_id: targetMineId,
      net_weight_tons: netWeight,
      logged_by_user_id: actor.id,
      inspected_by: data.inspected_by || (data.inspection_status === 'PASSED' ? `${actor.first_name || actor.username} (Receiving Staff)` : null),
    };

    const logId = await MaterialsRepository.create(newLogData);
    const createdRecord = await MaterialsRepository.findById(logId);

    await logAudit({
      userId: actor.id,
      organizationId: targetOrgId,
      mineId: targetMineId,
      action: AUDIT_ACTION.CREATE,
      entityType: ENTITY_TYPE.MATERIAL_INWARD || 'MATERIAL_INWARD',
      entityId: logId,
      newData: createdRecord,
      ipAddress,
    });

    return createdRecord;
  }

  static async updateInspectionStatus(id, data, actor, ipAddress = null) {
    const existing = await this.getMaterialById(id, actor);

    await MaterialsRepository.updateStatus(id, {
      inspection_status: data.inspection_status,
      inspected_by: data.inspected_by,
      remarks: data.remarks,
    });

    const updated = await MaterialsRepository.findById(id);

    await logAudit({
      userId: actor.id,
      organizationId: existing.organization_id,
      mineId: existing.mine_id,
      action: AUDIT_ACTION.UPDATE,
      entityType: ENTITY_TYPE.MATERIAL_INWARD || 'MATERIAL_INWARD',
      entityId: id,
      oldData: existing,
      newData: updated,
      ipAddress,
    });

    return updated;
  }

  static async deleteMaterialLog(id, actor, ipAddress = null) {
    const existing = await this.getMaterialById(id, actor);

    await MaterialsRepository.delete(id);

    await logAudit({
      userId: actor.id,
      organizationId: existing.organization_id,
      mineId: existing.mine_id,
      action: AUDIT_ACTION.DELETE,
      entityType: ENTITY_TYPE.MATERIAL_INWARD || 'MATERIAL_INWARD',
      entityId: id,
      oldData: existing,
      ipAddress,
    });

    return { message: 'Material inward log deleted successfully' };
  }
}

export default MaterialsService;
