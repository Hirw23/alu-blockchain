import adminRepository from '../repositories/admin.repository.js';

/**
 * Service layer orchestrating domain logic for Admin.
 */
export const adminService = {
  /**
   * Fetch all Admin elements.
   */
  async getAll() {
    return adminRepository.findAll();
  },

  /**
   * Fetch Admin record by its ID.
   * @param {string} id - Record ID
   */
  async getById(id) {
    return adminRepository.findById(id);
  },

  /**
   * Create a new Admin record.
   * @param {Object} data - Form data
   */
  async create(data) {
    return adminRepository.create(data);
  },
};

export default adminService;
