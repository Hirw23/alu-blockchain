import fs from 'fs';
import path from 'path';
import analyticsRepository from '../repositories/analytics.repository.js';
import { NotFoundError } from '../utils/errors.js';

export const reportsService = {
  // =========================================================================
  // REPORT DEFINITIONS
  // =========================================================================

  async createDefinition(userId, data) {
    return analyticsRepository.createDefinition(userId, data);
  },

  async getDefinitions(userId) {
    return analyticsRepository.getDefinitions(userId);
  },

  async getDefinition(id) {
    const definition = await analyticsRepository.findDefinitionById(id);
    if (!definition) {
      throw new NotFoundError('Report definition not found');
    }
    return definition;
  },

  async deleteDefinition(id) {
    await this.getDefinition(id);
    return analyticsRepository.deleteDefinition(id);
  },

  // =========================================================================
  // EXPORT ENGINE
  // =========================================================================

  async exportReport(definitionId, userId, format) {
    const definition = await this.getDefinition(definitionId);

    const uploadsDir = path.resolve('uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const filename = `report-${definition.id}-${Date.now()}.${format.toLowerCase()}`;
    const filePath = path.join(uploadsDir, filename);

    // Mock content generation to avoid large binaries overhead
    const mockContent = {
      reportName: definition.name,
      reportType: definition.reportType,
      filters: JSON.parse(definition.filters),
      exportedAt: new Date().toISOString(),
      data: [
        { metric: 'Registered Products', value: 12 },
        { metric: 'Scans TotalCount', value: 154 },
      ],
    };

    if (format === 'JSON') {
      fs.writeFileSync(filePath, JSON.stringify(mockContent, null, 2));
    } else if (format === 'CSV') {
      const csvStr = 'Metric,Value\nRegistered Products,12\nScans TotalCount,154';
      fs.writeFileSync(filePath, csvStr);
    } else if (format === 'EXCEL') {
      fs.writeFileSync(filePath, `MOCK-EXCEL-BINARY-DATA:${JSON.stringify(mockContent)}`);
    } else {
      // PDF
      fs.writeFileSync(filePath, `MOCK-PDF-DOCUMENT-SHEET:${definition.name}`);
    }

    // Save history logs
    const report = await analyticsRepository.createGeneratedReport(
      definition.id,
      userId,
      format,
      filePath
    );

    return report;
  },

  async getExportHistory(definitionId) {
    await this.getDefinition(definitionId);
    return analyticsRepository.getGeneratedReports(definitionId);
  },

  // =========================================================================
  // SCHEDULED REPORTS CONTRACTS
  // =========================================================================

  async createSchedule(data) {
    await this.getDefinition(data.reportDefinitionId);
    return analyticsRepository.createSchedule(data.reportDefinitionId, data);
  },

  async getSchedules() {
    return analyticsRepository.getSchedules();
  },

  async updateSchedule(id, data) {
    return analyticsRepository.updateSchedule(id, data);
  },

  async deleteSchedule(id) {
    return analyticsRepository.deleteSchedule(id);
  },
};

export default reportsService;
