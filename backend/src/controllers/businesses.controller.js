import businessesService from '../services/businesses.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const businessesController = {
  create: asyncHandler(async (req, res) => {
    const business = await businessesService.registerBusiness(req.user.id, req.body);
    res.status(201).json(successResponse('Business registered successfully', { business }));
  }),

  getAll: asyncHandler(async (req, res) => {
    const filters = {
      q: req.query.q,
      registrationNumber: req.query.registrationNumber,
      industry: req.query.industry,
      businessType: req.query.businessType,
      verificationStatus: req.query.verificationStatus,
      status: req.query.status,
      cooperativeId: req.query.cooperativeId,
      ownerId: req.query.ownerId,
      page: parseInt(req.query.page || '1', 10),
      limit: parseInt(req.query.limit || '10', 10),
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    };

    const { items, total } = await businessesService.search(filters);

    // pagination meta helper
    const meta = {
      totalItems: total,
      totalPages: Math.ceil(total / filters.limit),
      currentPage: filters.page,
      limit: filters.limit,
    };

    res.status(200).json(successResponse('Businesses retrieved successfully', { items }, meta));
  }),

  getById: asyncHandler(async (req, res) => {
    const business = await businessesService.getBusiness(req.params.id);
    res.status(200).json(successResponse('Business retrieved successfully', { business }));
  }),

  update: asyncHandler(async (req, res) => {
    const business = await businessesService.updateBusiness(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(200).json(successResponse('Business details updated successfully', { business }));
  }),

  delete: asyncHandler(async (req, res) => {
    await businessesService.deleteBusiness(req.params.id, req.user.id, req.user.role);
    res.status(200).json(successResponse('Business deleted successfully'));
  }),

  getMe: asyncHandler(async (req, res) => {
    const items = await businessesService.getMyBusinesses(req.user.id);
    res.status(200).json(successResponse('My businesses retrieved successfully', { items }));
  }),

  updateAddress: asyncHandler(async (req, res) => {
    const address = await businessesService.updateAddress(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(200).json(successResponse('Business address updated successfully', { address }));
  }),

  getAddress: asyncHandler(async (req, res) => {
    const address = await businessesService.getAddress(req.params.id);
    res.status(200).json(successResponse('Business address retrieved successfully', { address }));
  }),

  addDocument: asyncHandler(async (req, res) => {
    const document = await businessesService.addDocument(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(201).json(successResponse('Business document uploaded successfully', { document }));
  }),

  getDocuments: asyncHandler(async (req, res) => {
    const documents = await businessesService.getDocuments(req.params.id);
    res
      .status(200)
      .json(successResponse('Business documents retrieved successfully', { documents }));
  }),

  deleteDocument: asyncHandler(async (req, res) => {
    await businessesService.deleteDocument(
      req.params.id,
      req.params.documentId,
      req.user.id,
      req.user.role
    );
    res.status(200).json(successResponse('Business document deleted successfully'));
  }),

  verifyDocument: asyncHandler(async (req, res) => {
    const document = await businessesService.verifyDocument(
      req.params.id,
      req.params.documentId,
      req.user.role,
      req.body.verificationStatus
    );
    res
      .status(200)
      .json(successResponse('Business document verification state updated', { document }));
  }),

  addMember: asyncHandler(async (req, res) => {
    const member = await businessesService.addMember(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(201).json(successResponse('Business member assigned successfully', { member }));
  }),

  getMembers: asyncHandler(async (req, res) => {
    const members = await businessesService.getMembers(req.params.id);
    res
      .status(200)
      .json(successResponse('Business members roster retrieved successfully', { members }));
  }),

  updateMemberRole: asyncHandler(async (req, res) => {
    const member = await businessesService.updateMemberRole(
      req.params.id,
      req.params.memberId,
      req.user.id,
      req.user.role,
      req.body.role
    );
    res
      .status(200)
      .json(successResponse('Business member role classification updated', { member }));
  }),

  removeMember: asyncHandler(async (req, res) => {
    await businessesService.removeMember(
      req.params.id,
      req.params.memberId,
      req.user.id,
      req.user.role
    );
    res.status(200).json(successResponse('Business member removed successfully'));
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const business = await businessesService.updateStatus(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.status
    );
    res.status(200).json(successResponse('Business status updated successfully', { business }));
  }),

  verify: asyncHandler(async (req, res) => {
    const business = await businessesService.verifyBusiness(
      req.params.id,
      req.user.role,
      req.body.verificationStatus
    );
    res.status(200).json(successResponse('Business verification complete', { business }));
  }),

  getStatistics: asyncHandler(async (req, res) => {
    const statistics = await businessesService.getStatistics(req.params.id);
    res
      .status(200)
      .json(successResponse('Business statistics retrieved successfully', { statistics }));
  }),
};

export default businessesController;
