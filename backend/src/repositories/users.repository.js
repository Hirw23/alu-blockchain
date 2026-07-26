import prisma from '../database/client.js';

/**
 * Repository performing user querying and updates.
 */
export const usersRepository = {
  /**
   * Retrieves profile details by id.
   * @param {string} id - User UUID
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  },

  /**
   * Updates profile details.
   * @param {string} id - User UUID
   * @param {Object} updateData - Data fields to update
   */
  async updateProfile(id, updateData) {
    return prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });
  },
};

export default usersRepository;
