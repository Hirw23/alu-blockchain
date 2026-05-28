import blockchainRepository from '../repositories/blockchain.repository.js';

/**
 * Service layer orchestrating domain logic for Blockchain.
 */
export const blockchainService = {
  /**
   * Fetch all Blockchain elements.
   */
  async getAll() {
    return blockchainRepository.findAll();
  },

  /**
   * Fetch Blockchain record by its ID.
   * @param {string} id - Record ID
   */
  async getById(id) {
    return blockchainRepository.findById(id);
  },

  /**
   * Create a new Blockchain record.
   * @param {Object} data - Form data
   */
  async create(data) {
    return blockchainRepository.create(data);
  },
};

export default blockchainService;
