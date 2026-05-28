import usersRepository from '../repositories/users.repository.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Service coordinating user details extraction and profile updates.
 */
export const usersService = {
  /**
   * Retrieves profile of user.
   * @param {string} id - User ID
   */
  async getProfile(id) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  },

  /**
   * Updates profile values.
   * @param {string} id - User ID
   * @param {Object} updateData - Values to update
   */
  async updateProfile(id, updateData) {
    return usersRepository.updateProfile(id, updateData);
  },
};

export default usersService;
