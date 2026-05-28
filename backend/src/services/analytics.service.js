import analyticsRepository from '../repositories/analytics.repository.js';

/**
 * Service layer orchestrating domain logic for Analytics.
 */
export const analyticsService = {
  /**
   * Fetch all Analytics elements.
   */
  async getAll() {
    return analyticsRepository.findAll();
  },

  /**
   * Fetch Analytics record by its ID.
   * @param {string} id - Record ID
   */
  async getById(id) {
    return analyticsRepository.findById(id);
  },

  /**
   * Create a new Analytics record.
   * @param {Object} data - Form data
   */
  async create(data) {
    return analyticsRepository.create(data);
  },
};

export default analyticsService;
