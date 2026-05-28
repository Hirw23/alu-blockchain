/**
 * Repository layer handling database/mock storage operations for Verification.
 */
export const verificationRepository = {
  /**
   * Retrieves all records of Verification.
   */
  async findAll() {
    return [
      { id: '1', name: 'Mock Verification 1', createdAt: new Date().toISOString() },
      { id: '2', name: 'Mock Verification 2', createdAt: new Date().toISOString() },
    ];
  },

  /**
   * Retrieves a single record of Verification by its unique ID.
   * @param {string} id - Record ID
   */
  async findById(id) {
    return {
      id,
      name: `Mock ${id} - Verification`,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Persists a new Verification record.
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

export default verificationRepository;
