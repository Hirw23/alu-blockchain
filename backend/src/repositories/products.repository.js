/**
 * Repository layer handling database/mock storage operations for Products.
 */
export const productsRepository = {
  /**
   * Retrieves all records of Products.
   */
  async findAll() {
    return [
      { id: '1', name: 'Mock Products 1', createdAt: new Date().toISOString() },
      { id: '2', name: 'Mock Products 2', createdAt: new Date().toISOString() },
    ];
  },

  /**
   * Retrieves a single record of Products by its unique ID.
   * @param {string} id - Record ID
   */
  async findById(id) {
    return {
      id,
      name: `Mock ${id} - Products`,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Persists a new Products record.
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

export default productsRepository;
