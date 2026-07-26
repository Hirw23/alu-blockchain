import fs from 'fs';
import path from 'path';
import analyticsRepository from '../repositories/analytics.repository.js';
import prisma from '../database/client.js';
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

  /**
   * Computes real metrics for a report definition from the database,
   * scoped to filters.businessId when present.
   */
  async buildReportMetrics(definition) {
    let filters = {};
    try {
      filters = JSON.parse(definition.filters || '{}');
    } catch {
      filters = {};
    }
    const businessId = filters.businessId;
    const businessWhere = businessId ? { businessId } : {};

    switch (definition.reportType) {
      case 'PRODUCT': {
        const [total, active] = await Promise.all([
          prisma.product.count({ where: businessWhere }),
          prisma.product.count({ where: { ...businessWhere, status: 'ACTIVE' } }),
        ]);
        return [
          { metric: 'Total Products', value: total },
          { metric: 'Active Products', value: active },
        ];
      }
      case 'SUPPLY_CHAIN': {
        const [total, confirmed] = await Promise.all([
          prisma.supplyChainEvent.count({ where: businessWhere }),
          prisma.supplyChainEvent.count({ where: { ...businessWhere, eventStatus: 'CONFIRMED' } }),
        ]);
        return [
          { metric: 'Total Supply Chain Events', value: total },
          { metric: 'Confirmed Events', value: confirmed },
        ];
      }
      case 'VERIFICATION': {
        const verificationWhere = businessId ? { productIdentity: { businessId } } : {};
        const [total, successful] = await Promise.all([
          prisma.verificationEvent.count({ where: verificationWhere }),
          prisma.verificationEvent.count({
            where: { ...verificationWhere, verificationStatus: 'SUCCESS' },
          }),
        ]);
        return [
          { metric: 'Total Verification Scans', value: total },
          { metric: 'Successful Verifications', value: successful },
        ];
      }
      case 'COOPERATIVE': {
        const [total, active] = await Promise.all([
          prisma.cooperative.count(),
          prisma.cooperative.count({ where: { status: 'ACTIVE' } }),
        ]);
        return [
          { metric: 'Total Cooperatives', value: total },
          { metric: 'Active Cooperatives', value: active },
        ];
      }
      case 'SYSTEM_ACTIVITY': {
        const [users, businesses] = await Promise.all([prisma.user.count(), prisma.business.count()]);
        return [
          { metric: 'Registered Users', value: users },
          { metric: 'Registered Businesses', value: businesses },
        ];
      }
      case 'PLATFORM': {
        const [businesses, products, scans] = await Promise.all([
          prisma.business.count(),
          prisma.product.count(),
          prisma.verificationEvent.count(),
        ]);
        return [
          { metric: 'Total Businesses', value: businesses },
          { metric: 'Total Products', value: products },
          { metric: 'Total Verification Scans', value: scans },
        ];
      }
      case 'BUSINESS':
      default: {
        const [total, active] = await Promise.all([
          prisma.business.count({ where: businessWhere }),
          prisma.business.count({ where: { ...businessWhere, status: 'ACTIVE' } }),
        ]);
        return [
          { metric: 'Total Businesses', value: total },
          { metric: 'Active Businesses', value: active },
        ];
      }
    }
  },

  async exportReport(definitionId, userId, format) {
    const definition = await this.getDefinition(definitionId);

    const uploadsDir = path.resolve('uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const filename = `report-${definition.id}-${Date.now()}.${format.toLowerCase()}`;
    const filePath = path.join(uploadsDir, filename);

    const data = await this.buildReportMetrics(definition);
    const content = {
      reportName: definition.name,
      reportType: definition.reportType,
      filters: JSON.parse(definition.filters),
      exportedAt: new Date().toISOString(),
      data,
    };

    if (format === 'JSON') {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    } else if (format === 'CSV') {
      const csvRows = ['Metric,Value', ...data.map((d) => `${d.metric},${d.value}`)];
      fs.writeFileSync(filePath, csvRows.join('\n'));
    } else if (format === 'EXCEL') {
      // No xlsx-generation library is installed; write real data as a text placeholder.
      fs.writeFileSync(filePath, `MOCK-EXCEL-BINARY-DATA:${JSON.stringify(content)}`);
    } else {
      // No PDF-generation library is installed; write real data as a text placeholder.
      const lines = data.map((d) => `${d.metric}: ${d.value}`).join('\n');
      fs.writeFileSync(filePath, `MOCK-PDF-DOCUMENT-SHEET:${definition.name}\n${lines}`);
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
