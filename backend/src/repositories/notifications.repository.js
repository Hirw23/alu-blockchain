/**
 * Repository layer handling database/mock storage operations for Notifications.
 */
export const notificationsRepository = {
  /**
   * Retrieves all records of Notifications.
   */
  async findAll() {
    return [
      { id: '1', name: 'Mock Notifications 1', createdAt: new Date().toISOString() },
      { id: '2', name: 'Mock Notifications 2', createdAt: new Date().toISOString() },
    ];
  },

  /**
   * Retrieves a single record of Notifications by its unique ID.
   * @param {string} id - Record ID
   */
  async findById(id) {
    return {
      id,
      name: `Mock ${id} - Notifications`,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Persists a new Notifications record.
   * @param {Object} data - Input fields
   */
  async create(data) {
    return {
      id: `mock_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
  },
};

export default notificationsRepository;
