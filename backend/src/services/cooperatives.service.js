import cooperativesRepository from '../repositories/cooperatives.repository.js';

/**
 * Service layer orchestrating domain logic for Cooperatives.
 */
export const cooperativesService = {
  /**
   * Fetch all Cooperatives elements.
   */
  async getAll() {
    return cooperativesRepository.findAll();
  },

  /**
   * Fetch Cooperatives record by its ID.
   * @param {string} id - Record ID
   */
  async getById(id) {
    return cooperativesRepository.findById(id);
  },

  /**
   * Create a new Cooperatives record.
   * @param {Object} data - Form data
   */
  async create(data) {
    return cooperativesRepository.create(data);
  },
};

export default cooperativesService;
