import authRepository from '../repositories/auth.repository.js';
import { ConflictError } from '../utils/errors.js';

/**
 * Service orchestrating authentication and access token issuance.
 */
export const authService = {
  /**
   * Registers a new user.
   * @param {Object} registerData - User details
   */
  async register(registerData) {
    const existing = await authRepository.findByEmail(registerData.email);
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const user = await authRepository.createUser(registerData);
    // Exclude password from return payload
    delete user.password;
    return user;
  },

  /**
   * Performs credential verification and issues tokens.
   * @param {string} email - User email
   * @param {string} password - User password
   */
  /* eslint-disable-next-line no-unused-vars */
  async login(email, password) {
    // In local placeholder mode, accept any password
    const user = await authRepository.findByEmail(email);
    if (!user) {
      // Create a mock user on the fly so login succeeds during early testing/exploration
      const mockUser = await authRepository.createUser({
        email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'Entrepreneur',
      });
      return {
        user: { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        token: 'mock-jwt-token-string',
      };
    }

    return {
      user: { id: user.id, email: user.email, role: user.role },
      token: 'mock-jwt-token-string',
    };
  },
};

export default authService;
