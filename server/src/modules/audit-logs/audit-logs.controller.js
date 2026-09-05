import AuditLogsService from './audit-logs.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { parsePagination } from '../../utils/pagination.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class AuditLogsController {
  static list = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query, ['id', 'created_at', 'action', 'entity_type']);
    const filters = {
      user_id: req.query.user_id,
      organization_id: req.query.organization_id,
      mine_id: req.query.mine_id,
      action: req.query.action,
      entity_type: req.query.entity_type,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    const { logs, meta } = await AuditLogsService.listAuditLogs(pagination, filters);
    return ApiResponse.success(res, logs, 'Audit logs retrieved successfully', 200, meta);
  });

  static getById = asyncHandler(async (req, res) => {
    const log = await AuditLogsService.getAuditLogById(req.params.id);
    return ApiResponse.success(res, log, 'Audit log details retrieved successfully');
  });
}

export default AuditLogsController;
