import notificationsRepository from '../repositories/notifications.repository.js';

/**
 * Service layer orchestrating domain logic for Notifications.
 */
export const notificationsService = {
  /**
   * Fetch all Notifications elements.
   */
  async getAll() {
    return notificationsRepository.findAll();
  },

  /**
   * Fetch Notifications record by its ID.
   * @param {string} id - Record ID
   */
  async getById(id) {
    return notificationsRepository.findById(id);
  },

  /**
   * Create a new Notifications record.
   * @param {Object} data - Form data
   */
  async create(data) {
    return notificationsRepository.create(data);
  },
};

export default notificationsService;
