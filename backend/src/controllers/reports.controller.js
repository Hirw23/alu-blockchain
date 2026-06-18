import reportsService from '../services/reports.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';
import fs from 'fs';

export const reportsController = {
  createDefinition: asyncHandler(async (req, res) => {
    const definition = await reportsService.createDefinition(req.user.id, req.body);
    res.status(201).json(successResponse('Report definition created successfully', { definition }));
  }),

  getDefinitions: asyncHandler(async (req, res) => {
    const definitions = await reportsService.getDefinitions(req.user.id);
    res.status(200).json(successResponse('Report definitions retrieved', { definitions }));
  }),

  getDefinition: asyncHandler(async (req, res) => {
    const definition = await reportsService.getDefinition(req.params.id);
    res.status(200).json(successResponse('Report definition details', { definition }));
  }),

  deleteDefinition: asyncHandler(async (req, res) => {
    await reportsService.deleteDefinition(req.params.id);
    res.status(200).json(successResponse('Report definition deleted successfully'));
  }),

  exportReport: asyncHandler(async (req, res) => {
    const report = await reportsService.exportReport(req.params.id, req.user.id, req.body.format);
    res.status(201).json(successResponse('Report exported successfully', { report }));
  }),

  downloadReport: asyncHandler(async (req, res) => {
    // Retrieve latest exported file from history
    const history = await reportsService.getExportHistory(req.params.id);
    if (history.length === 0) {
      return res.status(404).json({ message: 'No exported file found for this report definition' });
    }

    const latest = history[history.length - 1];

    if (!fs.existsSync(latest.filePath)) {
      return res.status(404).json({ message: 'Export file has expired or was removed' });
    }

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="report-${req.params.id}.${latest.format.toLowerCase()}"`
    );
    if (latest.format === 'JSON') {
      res.setHeader('Content-Type', 'application/json');
    } else if (latest.format === 'CSV') {
      res.setHeader('Content-Type', 'text/csv');
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    const stream = fs.createReadStream(latest.filePath);
    stream.pipe(res);
  }),

  getExportHistory: asyncHandler(async (req, res) => {
    const history = await reportsService.getExportHistory(req.params.id);
    res.status(200).json(successResponse('Generated exports history list', { history }));
  }),

  createSchedule: asyncHandler(async (req, res) => {
    const schedule = await reportsService.createSchedule(req.body);
    res
      .status(201)
      .json(successResponse('Report schedule task registered successfully', { schedule }));
  }),

  getSchedules: asyncHandler(async (req, res) => {
    const schedules = await reportsService.getSchedules();
    res.status(200).json(successResponse('Active reports schedules list', { schedules }));
  }),

  updateSchedule: asyncHandler(async (req, res) => {
    const schedule = await reportsService.updateSchedule(req.params.id, req.body);
    res.status(200).json(successResponse('Report schedule updated successfully', { schedule }));
  }),

  deleteSchedule: asyncHandler(async (req, res) => {
    await reportsService.deleteSchedule(req.params.id);
    res.status(200).json(successResponse('Report schedule deleted successfully'));
  }),
};

export default reportsController;
