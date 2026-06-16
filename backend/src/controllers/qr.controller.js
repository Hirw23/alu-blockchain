import qrService from '../services/qr.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const qrController = {
  createIdentity: asyncHandler(async (req, res) => {
    const identity = await qrService.createIdentity(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(201).json(successResponse('Digital identity registered successfully', { identity }));
  }),

  getIdentity: asyncHandler(async (req, res) => {
    const identity = await qrService.getIdentity(req.params.id);
    res.status(200).json(successResponse('Digital identity details retrieved', { identity }));
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const identity = await qrService.updateStatus(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.status
    );
    res.status(200).json(successResponse('Digital identity status updated', { identity }));
  }),

  deleteIdentity: asyncHandler(async (req, res) => {
    await qrService.deleteIdentity(req.params.id, req.user.id, req.user.role);
    res.status(200).json(successResponse('Digital identity deleted successfully'));
  }),

  generateQr: asyncHandler(async (req, res) => {
    const asset = await qrService.generateQr(req.params.id, req.user.id, req.user.role, req.body);
    res.status(201).json(successResponse('QR Code generated successfully', { asset }));
  }),

  bulkGenerate: asyncHandler(async (req, res) => {
    const assets = await qrService.bulkGenerate(req.user.id, req.user.role, req.body);
    res.status(201).json(successResponse('Bulk QR Code generation complete', { assets }));
  }),

  previewQr: asyncHandler(async (req, res) => {
    const format = req.query.format || 'PNG';
    const result = await qrService.previewQr(req.params.id, req.user.id, req.user.role, format);

    if (format === 'SVG') {
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.status(200).send(result);
    }

    res.setHeader('Content-Type', 'image/png');
    return res.status(200).send(result);
  }),

  verifyToken: asyncHandler(async (req, res) => {
    const token = req.params.verificationToken;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '';
    const metadata = {
      userAgent: req.headers['user-agent'],
      browser: req.query.browser,
      deviceType: req.query.deviceType,
      operatingSystem: req.query.operatingSystem,
      country: req.query.country,
    };

    const outcome = await qrService.verifyToken(token, clientIp, metadata);
    res.status(200).json(successResponse('Product verification result', outcome));
  }),

  getVerifications: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);

    const { items, total } = await qrService.getVerificationHistory(req.params.id, page, limit);

    const meta = {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    };

    res.status(200).json(successResponse('Verification scans history retrieved', { items }, meta));
  }),

  getStatistics: asyncHandler(async (req, res) => {
    const statistics = await qrService.getProductStatistics(req.params.id);
    res.status(200).json(successResponse('Product verification stats', { statistics }));
  }),

  getLatestScan: asyncHandler(async (req, res) => {
    const scan = await qrService.getLatestScan(req.params.id);
    res.status(200).json(successResponse('Latest verification scan event details', { scan }));
  }),

  getAssets: asyncHandler(async (req, res) => {
    const assets = await qrService.getAssets(req.params.id);
    res.status(200).json(successResponse('Digital identity QR assets list', { assets }));
  }),

  deleteAsset: asyncHandler(async (req, res) => {
    await qrService.deleteAsset(req.params.id, req.params.assetId, req.user.id, req.user.role);
    res.status(200).json(successResponse('QR Code asset deleted successfully'));
  }),
};

export default qrController;
