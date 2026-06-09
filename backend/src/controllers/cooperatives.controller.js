import cooperativesService from '../services/cooperatives.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const cooperativesController = {
  create: asyncHandler(async (req, res) => {
    const cooperative = await cooperativesService.createCooperative(req.body);
    res.status(201).json(successResponse('Cooperative registered successfully', { cooperative }));
  }),

  getAll: asyncHandler(async (req, res) => {
    const items = await cooperativesService.getAll();
    res.status(200).json(successResponse('Cooperatives retrieved successfully', { items }));
  }),

  getById: asyncHandler(async (req, res) => {
    const cooperative = await cooperativesService.getCooperative(req.params.id);
    res.status(200).json(successResponse('Cooperative retrieved successfully', { cooperative }));
  }),

  update: asyncHandler(async (req, res) => {
    const cooperative = await cooperativesService.updateCooperative(req.params.id, req.body);
    res
      .status(200)
      .json(successResponse('Cooperative details updated successfully', { cooperative }));
  }),

  delete: asyncHandler(async (req, res) => {
    await cooperativesService.deleteCooperative(req.params.id);
    res.status(200).json(successResponse('Cooperative deleted successfully'));
  }),

  getBusinesses: asyncHandler(async (req, res) => {
    const items = await cooperativesService.getBusinesses(req.params.id);
    res
      .status(200)
      .json(successResponse('Cooperative businesses retrieved successfully', { items }));
  }),

  addBusiness: asyncHandler(async (req, res) => {
    const { businessId } = req.body;
    const business = await cooperativesService.addBusiness(req.params.id, businessId);
    res
      .status(200)
      .json(successResponse('Business bound to cooperative membership roster', { business }));
  }),

  removeBusiness: asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    await cooperativesService.removeBusiness(req.params.id, businessId);
    res.status(200).json(successResponse('Business removed from cooperative membership roster'));
  }),
};

export default cooperativesController;
