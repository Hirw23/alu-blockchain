/**
 * Repository layer handling database/mock storage operations for Qr.
 */
export const qrRepository = {
  /**
   * Retrieves all records of Qr.
   */
  async findAll() {
    return [
      { id: '1', name: 'Mock Qr 1', createdAt: new Date().toISOString() },
      { id: '2', name: 'Mock Qr 2', createdAt: new Date().toISOString() },
    ];
  },

  /**
   * Retrieves a single record of Qr by its unique ID.
   * @param {string} id - Record ID
   */
  async findById(id) {
    return {
      id,
      name: `Mock ${id} - Qr`,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Persists a new Qr record.
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

export default qrRepository;
