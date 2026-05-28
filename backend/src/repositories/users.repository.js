/**
 * Repository performing user querying and updates.
 */
export const usersRepository = {
  /**
   * Retrieves profile details by id.
   * @param {string} id - User UUID
   */
  async findById(id) {
    return {
      id,
      email: 'mock.user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Entrepreneur',
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Updates profile details.
   * @param {string} id - User UUID
   * @param {Object} updateData - Data fields to update
   */
  async updateProfile(id, updateData) {
    return {
      id,
      email: 'mock.user@example.com',
      firstName: updateData.firstName || 'John',
      lastName: updateData.lastName || 'Doe',
      role: 'Entrepreneur',
      updatedAt: new Date().toISOString(),
    };
  },
};

export default usersRepository;
