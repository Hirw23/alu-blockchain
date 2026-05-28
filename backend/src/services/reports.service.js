import reportsRepository from '../repositories/reports.repository.js';

/**
 * Service layer orchestrating domain logic for Reports.
 */
export const reportsService = {
  /**
   * Fetch all Reports elements.
   */
  async getAll() {
    return reportsRepository.findAll();
  },

  /**
   * Fetch Reports record by its ID.
   * @param {string} id - Record ID
   */
  async getById(id) {
    return reportsRepository.findById(id);
  },

  /**
   * Create a new Reports record.
   * @param {Object} data - Form data
   */
  async create(data) {
    return reportsRepository.create(data);
  },
};

export default reportsService;
