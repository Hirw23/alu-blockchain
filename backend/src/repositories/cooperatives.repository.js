/**
 * Repository layer handling database/mock storage operations for Cooperatives.
 */
export const cooperativesRepository = {
  /**
   * Retrieves all records of Cooperatives.
   */
  async findAll() {
    return [
      { id: '1', name: 'Mock Cooperatives 1', createdAt: new Date().toISOString() },
      { id: '2', name: 'Mock Cooperatives 2', createdAt: new Date().toISOString() },
    ];
  },

  /**
   * Retrieves a single record of Cooperatives by its unique ID.
   * @param {string} id - Record ID
   */
  async findById(id) {
    return {
      id,
      name: `Mock ${id} - Cooperatives`,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Persists a new Cooperatives record.
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

export default cooperativesRepository;
