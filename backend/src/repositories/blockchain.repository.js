/**
 * Repository layer handling database/mock storage operations for Blockchain.
 */
export const blockchainRepository = {
  /**
   * Retrieves all records of Blockchain.
   */
  async findAll() {
    return [
      { id: '1', name: 'Mock Blockchain 1', createdAt: new Date().toISOString() },
      { id: '2', name: 'Mock Blockchain 2', createdAt: new Date().toISOString() },
    ];
  },

  /**
   * Retrieves a single record of Blockchain by its unique ID.
   * @param {string} id - Record ID
   */
  async findById(id) {
    return {
      id,
      name: `Mock ${id} - Blockchain`,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Persists a new Blockchain record.
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

export default blockchainRepository;
