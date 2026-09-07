import { ContractorsService } from './contractors.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class ContractorsController {
  static listContractors = asyncHandler(async (req, res) => {
    const { status, limit, offset } = req.query;
    const data = await ContractorsService.listContractors(req.user.id, {
      status,
      limit: +limit || 50,
      offset: +offset || 0,
    });
    res.json({ success: true, data });
  });

  static createContractor = asyncHandler(async (req, res) => {
    const data = await ContractorsService.createContractor(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static listContracts = asyncHandler(async (req, res) => {
    const { contractor_id, status, limit, offset } = req.query;
    const data = await ContractorsService.listContracts(req.user.id, {
      contractor_id,
      status,
      limit: +limit || 50,
      offset: +offset || 0,
    });
    res.json({ success: true, data });
  });

  static createContract = asyncHandler(async (req, res) => {
    const data = await ContractorsService.createContract(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static listWorkers = asyncHandler(async (req, res) => {
    const { contractor_id, training_status, limit, offset } = req.query;
    const data = await ContractorsService.listWorkers(req.user.id, {
      contractor_id,
      training_status,
      limit: +limit || 50,
      offset: +offset || 0,
    });
    res.json({ success: true, data });
  });

  static createWorker = asyncHandler(async (req, res) => {
    const data = await ContractorsService.createWorker(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  });

  static summary = asyncHandler(async (req, res) => {
    const data = await ContractorsService.getSummary(req.user.id);
    res.json({ success: true, data });
  });
}

export default ContractorsController;
