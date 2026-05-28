/**
 * Placeholder user records store.
 */
const mockUsers = [];

/**
 * Repository handling user data access operations.
 */
export const authRepository = {
  /**
   * Finds a user by email.
   * @param {string} email - Email address
   */
  async findByEmail(email) {
    return mockUsers.find((user) => user.email === email) || null;
  },

  /**
   * Creates a new user record.
   * @param {Object} userData - User record fields
   */
  async createUser(userData) {
    const newUser = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  },
};

export default authRepository;
