import supplychainRepository from '../repositories/supplychain.repository.js';

/**
 * Service layer orchestrating domain logic for Supplychain.
 */
export const supplychainService = {
  /**
   * Fetch all Supplychain elements.
   */
  async getAll() {
    return supplychainRepository.findAll();
  },

  /**
   * Fetch Supplychain record by its ID.
   * @param {string} id - Record ID
   */
  async getById(id) {
    return supplychainRepository.findById(id);
  },

  /**
   * Create a new Supplychain record.
   * @param {Object} data - Form data
   */
  async create(data) {
    return supplychainRepository.create(data);
  },
};

export default supplychainService;
