import productsRepository from '../repositories/products.repository.js';

/**
 * Service layer orchestrating domain logic for Products.
 */
export const productsService = {
  /**
   * Fetch all Products elements.
   */
  async getAll() {
    return productsRepository.findAll();
  },

  /**
   * Fetch Products record by its ID.
   * @param {string} id - Record ID
   */
  async getById(id) {
    return productsRepository.findById(id);
  },

  /**
   * Create a new Products record.
   * @param {Object} data - Form data
   */
  async create(data) {
    return productsRepository.create(data);
  },
};

export default productsService;
