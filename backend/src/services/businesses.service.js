import businessesRepository from '../repositories/businesses.repository.js';

/**
 * Service layer orchestrating domain logic for Businesses.
 */
export const businessesService = {
  /**
   * Fetch all Businesses elements.
   */
  async getAll() {
    return businessesRepository.findAll();
  },

  /**
   * Fetch Businesses record by its ID.
   * @param {string} id - Record ID
   */
  async getById(id) {
    return businessesRepository.findById(id);
  },

  /**
   * Create a new Businesses record.
   * @param {Object} data - Form data
   */
  async create(data) {
    return businessesRepository.create(data);
  },
};

export default businessesService;
