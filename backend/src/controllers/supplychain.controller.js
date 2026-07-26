import supplychainService from '../services/supplychain.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildFileUrl } from '../middleware/upload.js';

export const supplychainController = {
  create: asyncHandler(async (req, res) => {
    const event = await supplychainService.recordEvent(req.user.id, req.user.role, req.body);
    res.status(201).json(successResponse('Supply chain event recorded successfully', { event }));
  }),

  getAll: asyncHandler(async (req, res) => {
    const filters = {
      q: req.query.q,
      productId: req.query.productId,
      businessId: req.query.businessId,
      eventTypeId: req.query.eventTypeId,
      eventStatus: req.query.eventStatus,
      page: parseInt(req.query.page || '1', 10),
      limit: parseInt(req.query.limit || '10', 10),
      sortBy: req.query.sortBy || 'occurredAt',
      sortOrder: req.query.sortOrder || 'desc',
    };

    const { items, total } = await supplychainService.search(filters);

    const meta = {
      totalItems: total,
      totalPages: Math.ceil(total / filters.limit),
      currentPage: filters.page,
      limit: filters.limit,
    };

    res
      .status(200)
      .json(successResponse('Supply chain events retrieved successfully', { items }, meta));
  }),

  getById: asyncHandler(async (req, res) => {
    const event = await supplychainService.getEvent(req.params.id);
    res.status(200).json(successResponse('Event profile retrieved successfully', { event }));
  }),

  update: asyncHandler(async (req, res) => {
    const event = await supplychainService.updateEvent(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(200).json(successResponse('Event details updated successfully', { event }));
  }),

  delete: asyncHandler(async (req, res) => {
    await supplychainService.deleteEvent(req.params.id, req.user.id, req.user.role);
    res.status(200).json(successResponse('Event deleted successfully'));
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const event = await supplychainService.updateStatus(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.status
    );
    res.status(200).json(successResponse('Event status updated', { event }));
  }),

  getEventTypes: asyncHandler(async (req, res) => {
    const items = await supplychainService.getEventTypes();
    res.status(200).json(successResponse('Event types catalog retrieved successfully', { items }));
  }),

  getTimeline: asyncHandler(async (req, res) => {
    const timeline = await supplychainService.getTimeline(req.params.id);
    res
      .status(200)
      .json(successResponse('Chronological product timeline retrieved successfully', { timeline }));
  }),

  getCurrentStage: asyncHandler(async (req, res) => {
    const stageDetails = await supplychainService.getCurrentStage(req.params.id);
    res.status(200).json(successResponse('Product current stage details', stageDetails));
  }),

  postComment: asyncHandler(async (req, res) => {
    const comment = await supplychainService.postComment(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.comment
    );
    res.status(201).json(successResponse('Audit comment posted successfully', { comment }));
  }),

  deleteComment: asyncHandler(async (req, res) => {
    await supplychainService.deleteComment(
      req.params.id,
      req.params.commentId,
      req.user.id,
      req.user.role
    );
    res.status(200).json(successResponse('Audit comment deleted successfully'));
  }),

  updateLocation: asyncHandler(async (req, res) => {
    const location = await supplychainService.updateLocation(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(200).json(successResponse('Event location metrics updated', { location }));
  }),

  addAttachment: asyncHandler(async (req, res) => {
    const attachment = await supplychainService.addAttachment(req.params.id, req.user.id, req.user.role, {
      ...req.body,
      fileName: req.file.originalname,
      fileUrl: buildFileUrl(req, req.file.filename),
    });
    res
      .status(201)
      .json(successResponse('Attachment record catalogued successfully', { attachment }));
  }),

  deleteAttachment: asyncHandler(async (req, res) => {
    await supplychainService.deleteAttachment(
      req.params.id,
      req.params.attachmentId,
      req.user.id,
      req.user.role
    );
    res.status(200).json(successResponse('Event attachment deleted successfully'));
  }),
};

export default supplychainController;
