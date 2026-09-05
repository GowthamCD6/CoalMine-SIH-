import AuditLogsRepository from './audit-logs.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { buildMeta } from '../../utils/pagination.js';

export class AuditLogsService {
  static async listAuditLogs(pagination, filters) {
    const { total, rows } = await AuditLogsRepository.findAll({
      user_id: filters.user_id,
      organization_id: filters.organization_id,
      mine_id: filters.mine_id,
      action: filters.action,
      entity_type: filters.entity_type,
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: pagination.limit,
      offset: pagination.offset,
      sort: pagination.sort,
      order: pagination.order,
    });

    const meta = buildMeta(total, pagination.page, pagination.limit);
    return { logs: rows, meta };
  }

  static async getAuditLogById(id) {
    const log = await AuditLogsRepository.findById(id);
    if (!log) {
      throw ApiError.notFound(`Audit log entry with ID ${id} not found`);
    }
    return log;
  }
}

export default AuditLogsService;
