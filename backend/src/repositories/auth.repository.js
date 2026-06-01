import prisma from '../database/client.js';

export const authRepository = {
  /**
   * Retrieves a User by their unique email.
   * @param {string} email - Email address
   */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  },

  /**
   * Retrieves a User by their primary ID.
   * @param {string} id - User UUID
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  },

  /**
   * Finds a Role by its unique name string.
   * @param {string} name - Role name
   */
  async findRoleByName(name) {
    return prisma.role.findUnique({
      where: { name },
    });
  },

  /**
   * Persists a new User record.
   * @param {Object} userData - User record details
   */
  async createUser(userData) {
    return prisma.user.create({
      data: userData,
      include: { role: true },
    });
  },

  /**
   * Saves a new RefreshToken.
   */
  async createRefreshToken(userId, token, expiresAt) {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  },

  /**
   * Retrieves a RefreshToken details.
   */
  async findRefreshToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  /**
   * Revokes a specific RefreshToken.
   */
  async revokeRefreshToken(token) {
    return prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  },

  /**
   * Revokes all refresh tokens issued to a User.
   */
  async revokeUserRefreshTokens(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  },

  /**
   * Saves a new EmailVerificationToken.
   */
  async createEmailVerificationToken(userId, token, expiresAt) {
    return prisma.emailVerificationToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  },

  /**
   * Retrieves an EmailVerificationToken.
   */
  async findEmailVerificationToken(token) {
    return prisma.emailVerificationToken.findUnique({
      where: { token },
    });
  },

  /**
   * Updates verification state of an EmailVerificationToken.
   */
  async updateEmailVerificationToken(token, verified) {
    return prisma.emailVerificationToken.update({
      where: { token },
      data: { verified },
    });
  },

  /**
   * Updates verification status of a User.
   */
  async updateUserEmailVerified(userId, verified = true) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: verified },
    });
  },

  /**
   * Saves a new PasswordResetToken.
   */
  async createPasswordResetToken(userId, token, expiresAt) {
    return prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  },

  /**
   * Retrieves a PasswordResetToken.
   */
  async findPasswordResetToken(token) {
    return prisma.passwordResetToken.findUnique({
      where: { token },
    });
  },

  /**
   * Updates used state of a PasswordResetToken.
   */
  async updatePasswordResetToken(token, used) {
    return prisma.passwordResetToken.update({
      where: { token },
      data: { used },
    });
  },

  /**
   * Updates a User's password hash.
   */
  async updateUserPassword(userId, passwordHash) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },

  /**
   * Updates basic User profile details.
   */
  async updateUserProfile(userId, data) {
    return prisma.user.update({
      where: { id: userId },
      data,
      include: { role: true },
    });
  },
};

export default authRepository;
