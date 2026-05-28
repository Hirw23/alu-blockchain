/**
 * Repository layer handling database/mock storage operations for Supplychain.
 */
export const supplychainRepository = {
  /**
   * Retrieves all records of Supplychain.
   */
  async findAll() {
    return [
      { id: '1', name: 'Mock Supplychain 1', createdAt: new Date().toISOString() },
      { id: '2', name: 'Mock Supplychain 2', createdAt: new Date().toISOString() },
    ];
  },

  /**
   * Retrieves a single record of Supplychain by its unique ID.
   * @param {string} id - Record ID
   */
  async findById(id) {
    return {
      id,
      name: `Mock ${id} - Supplychain`,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Persists a new Supplychain record.
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

export default supplychainRepository;
