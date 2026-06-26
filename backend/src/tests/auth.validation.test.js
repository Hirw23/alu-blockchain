import { registerSchema, loginSchema, changePasswordSchema, resetPasswordSchema } from '../schemas/auth.schema.js';

// ============================================================
// Validation tests for auth Joi schemas
// ============================================================

describe('Auth Schemas — Validation Tests', () => {
  describe('registerSchema', () => {
    const valid = {
      email: 'alice@example.com',
      password: 'secure123',
      firstName: 'Alice',
      lastName: 'Smith',
    };

    it('should pass for a fully valid payload', () => {
      const { error } = registerSchema.validate(valid);
      expect(error).toBeUndefined();
    });

    it('should fail when email is malformed', () => {
      const { error } = registerSchema.validate({ ...valid, email: 'not-an-email' });
      expect(error).toBeDefined();
      expect(error.message).toContain('valid email');
    });

    it('should fail when email is missing', () => {
      const { error } = registerSchema.validate({ ...valid, email: undefined });
      expect(error).toBeDefined();
    });

    it('should fail when password is too short (< 6 characters)', () => {
      const { error } = registerSchema.validate({ ...valid, password: '123' });
      expect(error).toBeDefined();
      expect(error.message).toContain('6 characters');
    });

    it('should fail when firstName is missing', () => {
      const { error } = registerSchema.validate({ ...valid, firstName: undefined });
      expect(error).toBeDefined();
    });

    it('should fail when lastName is missing', () => {
      const { error } = registerSchema.validate({ ...valid, lastName: undefined });
      expect(error).toBeDefined();
    });

    it('should accept optional phoneNumber', () => {
      const { error } = registerSchema.validate({ ...valid, phoneNumber: '+250788123456' });
      expect(error).toBeUndefined();
    });

    it('should fail when profileImage is not a valid URI', () => {
      const { error } = registerSchema.validate({ ...valid, profileImage: 'not-a-url' });
      expect(error).toBeDefined();
    });
  });

  describe('loginSchema', () => {
    it('should pass for valid credentials', () => {
      const { error } = loginSchema.validate({ email: 'user@test.com', password: 'pass' });
      expect(error).toBeUndefined();
    });

    it('should fail when email is missing', () => {
      const { error } = loginSchema.validate({ password: 'pass' });
      expect(error).toBeDefined();
    });

    it('should fail when password is missing', () => {
      const { error } = loginSchema.validate({ email: 'user@test.com' });
      expect(error).toBeDefined();
    });
  });

  describe('changePasswordSchema', () => {
    it('should pass when all fields match correctly', () => {
      const { error } = changePasswordSchema.validate({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        newPasswordConfirmation: 'newpass123',
      });
      expect(error).toBeUndefined();
    });

    it('should fail when confirmation does not match new password', () => {
      const { error } = changePasswordSchema.validate({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        newPasswordConfirmation: 'DIFFERENT',
      });
      expect(error).toBeDefined();
      expect(error.message).toContain('does not match');
    });
  });

  describe('resetPasswordSchema', () => {
    it('should pass with a valid token and strong password', () => {
      const { error } = resetPasswordSchema.validate({ token: 'reset-tok-123', password: 'newpass123' });
      expect(error).toBeUndefined();
    });

    it('should fail when token is missing', () => {
      const { error } = resetPasswordSchema.validate({ password: 'newpass123' });
      expect(error).toBeDefined();
    });
  });
});
