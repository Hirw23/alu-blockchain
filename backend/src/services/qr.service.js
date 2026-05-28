import qrRepository from '../repositories/qr.repository.js';

/**
 * Service layer orchestrating domain logic for Qr.
 */
export const qrService = {
  /**
   * Fetch all Qr elements.
   */
  async getAll() {
    return qrRepository.findAll();
  },

  /**
   * Fetch Qr record by its ID.
   * @param {string} id - Record ID
   */
  async getById(id) {
    return qrRepository.findById(id);
  },

  /**
   * Create a new Qr record.
   * @param {Object} data - Form data
   */
  async create(data) {
    return qrRepository.create(data);
  },
};

export default qrService;
