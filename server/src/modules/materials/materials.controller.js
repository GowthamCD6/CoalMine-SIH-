import MaterialsService from './materials.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { parsePagination } from '../../utils/pagination.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getClientIp } from '../../middlewares/audit.middleware.js';

export class MaterialsController {
  static list = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query, ['created_at', 'quantity', 'material_name', 'consignment_number', 'inspection_status']);
    const filters = {
      organization_id: req.query.organization_id,
      mine_id: req.query.mine_id,
      category: req.query.category,
      status: req.query.status,
      search: req.query.search,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    const result = await MaterialsService.listMaterials(pagination, filters, req.user);
    return ApiResponse.success(
      res,
      result.materials,
      'Material inward logs retrieved successfully',
      200,
      { ...result.meta, applied_scope: result.applied_scope }
    );
  });

  static getSummary = asyncHandler(async (req, res) => {
    const filters = {
      organization_id: req.query.organization_id,
      mine_id: req.query.mine_id,
      category: req.query.category,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    const summary = await MaterialsService.getSummary(filters, req.user);
    return ApiResponse.success(res, summary, 'Material quantities and intelligence summary retrieved successfully');
  });

  static getById = asyncHandler(async (req, res) => {
    const material = await MaterialsService.getMaterialById(req.params.id, req.user);
    return ApiResponse.success(res, material, 'Material consignment details retrieved successfully');
  });

  static create = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const newMaterial = await MaterialsService.createMaterialLog(req.body, req.user, ipAddress);
    return ApiResponse.created(res, newMaterial, 'Inward material logged successfully at mine gate');
  });

  static updateStatus = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const updated = await MaterialsService.updateInspectionStatus(req.params.id, req.body, req.user, ipAddress);
    return ApiResponse.success(res, updated, 'Inspection status updated successfully');
  });

  static delete = asyncHandler(async (req, res) => {
    const ipAddress = getClientIp(req);
    const result = await MaterialsService.deleteMaterialLog(req.params.id, req.user, ipAddress);
    return ApiResponse.success(res, result, 'Material consignment deleted successfully');
  });
}

export default MaterialsController;
