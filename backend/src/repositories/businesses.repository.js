/**
 * Repository layer handling database/mock storage operations for Businesses.
 */
export const businessesRepository = {
  /**
   * Retrieves all records of Businesses.
   */
  async findAll() {
    return [
      { id: '1', name: 'Mock Businesses 1', createdAt: new Date().toISOString() },
      { id: '2', name: 'Mock Businesses 2', createdAt: new Date().toISOString() },
    ];
  },

  /**
   * Retrieves a single record of Businesses by its unique ID.
   * @param {string} id - Record ID
   */
  async findById(id) {
    return {
      id,
      name: `Mock ${id} - Businesses`,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Persists a new Businesses record.
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

export default businessesRepository;
