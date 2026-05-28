/**
 * Repository layer handling database/mock storage operations for Admin.
 */
export const adminRepository = {
  /**
   * Retrieves all records of Admin.
   */
  async findAll() {
    return [
      { id: '1', name: 'Mock Admin 1', createdAt: new Date().toISOString() },
      { id: '2', name: 'Mock Admin 2', createdAt: new Date().toISOString() },
    ];
  },

  /**
   * Retrieves a single record of Admin by its unique ID.
   * @param {string} id - Record ID
   */
  async findById(id) {
    return {
      id,
      name: `Mock ${id} - Admin`,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Persists a new Admin record.
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

export default adminRepository;
