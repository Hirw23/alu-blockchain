/**
 * Repository layer handling database/mock storage operations for Reports.
 */
export const reportsRepository = {
  /**
   * Retrieves all records of Reports.
   */
  async findAll() {
    return [
      { id: '1', name: 'Mock Reports 1', createdAt: new Date().toISOString() },
      { id: '2', name: 'Mock Reports 2', createdAt: new Date().toISOString() },
    ];
  },

  /**
   * Retrieves a single record of Reports by its unique ID.
   * @param {string} id - Record ID
   */
  async findById(id) {
    return {
      id,
      name: `Mock ${id} - Reports`,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Persists a new Reports record.
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

export default reportsRepository;
