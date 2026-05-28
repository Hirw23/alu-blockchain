import verificationRepository from '../repositories/verification.repository.js';

/**
 * Service layer orchestrating domain logic for Verification.
 */
export const verificationService = {
  /**
   * Fetch all Verification elements.
   */
  async getAll() {
    return verificationRepository.findAll();
  },

  /**
   * Fetch Verification record by its ID.
   * @param {string} id - Record ID
   */
  async getById(id) {
    return verificationRepository.findById(id);
  },

  /**
   * Create a new Verification record.
   * @param {Object} data - Form data
   */
  async create(data) {
    return verificationRepository.create(data);
  },
};

export default verificationService;
