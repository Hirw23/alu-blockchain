import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import authRepository from '../repositories/auth.repository.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.utils.js';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from '../utils/errors.js';

export const authService = {
  /**
   * Registers a new User.
   */
  async register(registerData) {
    const existing = await authRepository.findByEmail(registerData.email);
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    // Default registration role is Entrepreneur
    const defaultRole = await authRepository.findRoleByName('Entrepreneur');
    if (!defaultRole) {
      throw new NotFoundError('Default Entrepreneur role was not seeded');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerData.password, salt);

    const user = await authRepository.createUser({
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      email: registerData.email,
      passwordHash,
      phoneNumber: registerData.phoneNumber || null,
      profileImage: registerData.profileImage || null,
      roleId: defaultRole.id,
    });

    // Create email verification token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry
    await authRepository.createEmailVerificationToken(user.id, token, expiresAt);

    delete user.passwordHash;
    user.verificationToken = token;
    return user;
  },

  /**
   * Verifies a user email using verification token.
   */
  async verifyEmail(token) {
    const verificationToken = await authRepository.findEmailVerificationToken(token);
    if (!verificationToken) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    if (verificationToken.verified) {
      throw new BadRequestError('Email address is already verified');
    }

    if (new Date() > new Date(verificationToken.expiresAt)) {
      throw new BadRequestError('Verification token has expired');
    }

    // Update token and user
    await authRepository.updateEmailVerificationToken(token, true);
    await authRepository.updateUserEmailVerified(verificationToken.userId, true);

    return { message: 'Email address verified successfully' };
  },

  /**
   * User login.
   */
  async login(email, password) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw new ForbiddenError('Your email address has not been verified yet');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError('Your account has been deactivated');
    }

    // Generate tokens
    const payload = { id: user.id, email: user.email, role: user.role.name };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
    await authRepository.createRefreshToken(user.id, refreshToken, expiresAt);

    delete user.passwordHash;
    return {
      user,
      accessToken,
      refreshToken,
    };
  },

  /**
   * Invalidate Refresh Token on logout.
   */
  async logout(refreshToken) {
    try {
      await authRepository.revokeRefreshToken(refreshToken);
    } catch {
      // Avoid failing on redundant logout revokes
    }
    return { message: 'Logged out successfully' };
  },

  /**
   * Rotates access and refresh tokens.
   */
  async refresh(token) {
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const savedToken = await authRepository.findRefreshToken(token);

    // Token reuse threat detection
    if (!savedToken || savedToken.revoked || new Date() > new Date(savedToken.expiresAt)) {
      if (savedToken && savedToken.revoked) {
        // Reuse detected! Invalidate all refresh tokens for that user
        await authRepository.revokeUserRefreshTokens(savedToken.userId);
        console.warn(
          `[Security Alert] Refresh token reuse detected for User ${savedToken.userId}. Revoked all tokens.`
        );
      }
      throw new UnauthorizedError('Invalid, expired or revoked refresh token');
    }

    // Rotate token: revoke old token
    await authRepository.revokeRefreshToken(token);

    // Generate new family
    const user = savedToken.user;
    const payload = { id: user.id, email: user.email, role: decoded.role };
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authRepository.createRefreshToken(user.id, newRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  /**
   * Request password reset token.
   */
  async forgotPassword(email) {
    const user = await authRepository.findByEmail(email);
    // Silent fail in response to avoid user enumeration, but perform actions if exists
    let resetToken;
    if (user) {
      resetToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour reset token expiry
      await authRepository.createPasswordResetToken(user.id, resetToken, expiresAt);
    }

    return {
      message: 'If this email is registered, a password reset token has been sent',
      resetToken,
    };
  },

  /**
   * Reset password using token.
   */
  async resetPassword(token, newPassword) {
    const resetToken = await authRepository.findPasswordResetToken(token);
    if (!resetToken || resetToken.used || new Date() > new Date(resetToken.expiresAt)) {
      throw new BadRequestError('Invalid, used or expired reset token');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password, token state, and revoke refresh tokens
    await authRepository.updateUserPassword(resetToken.userId, passwordHash);
    await authRepository.updatePasswordResetToken(token, true);
    await authRepository.revokeUserRefreshTokens(resetToken.userId);

    return { message: 'Password reset successfully. Please log in with your new password' };
  },

  /**
   * Update authenticated password.
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatch) {
      throw new BadRequestError('Current password value is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await authRepository.updateUserPassword(userId, passwordHash);
    await authRepository.revokeUserRefreshTokens(userId);

    return { message: 'Password updated successfully' };
  },

  /**
   * Get Current User Details.
   */
  async getMe(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    delete user.passwordHash;
    return user;
  },

  /**
   * Update Profile Details.
   */
  async updateProfile(userId, profileData) {
    const updated = await authRepository.updateUserProfile(userId, profileData);
    delete updated.passwordHash;
    return updated;
  },
};

export default authService;
