import { jest } from '@jest/globals';

// ============================================================
// Unit tests for authService business logic
// Mocks the repository and crypto layers directly
// ============================================================

const mockAuthRepo = {
  findByEmail: jest.fn(),
  findRoleByName: jest.fn(),
  createUser: jest.fn(),
  createEmailVerificationToken: jest.fn(),
  findEmailVerificationToken: jest.fn(),
  updateEmailVerificationToken: jest.fn(),
  updateUserEmailVerified: jest.fn(),
  updateUser: jest.fn(),
  findPasswordResetToken: jest.fn(),
  createPasswordResetToken: jest.fn(),
  updatePasswordResetToken: jest.fn(),
};

jest.unstable_mockModule('../repositories/auth.repository.js', () => ({
  default: mockAuthRepo,
  authRepository: mockAuthRepo,
}));

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    genSalt: jest.fn().mockResolvedValue('salt'),
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn(),
  },
}));

const { authService } = await import('../services/auth.service.js');

describe('AuthService — Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register()', () => {
    it('should throw ConflictError when email already exists', async () => {
      mockAuthRepo.findByEmail.mockResolvedValue({ id: 'usr-1', email: 'alice@example.com' });

      await expect(
        authService.register({ email: 'alice@example.com', password: 'pass123', firstName: 'A', lastName: 'B' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('should throw NotFoundError when Entrepreneur role is not seeded', async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);
      mockAuthRepo.findRoleByName.mockResolvedValue(null);

      await expect(
        authService.register({ email: 'new@example.com', password: 'pass123', firstName: 'A', lastName: 'B' })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should successfully create a user and return data without passwordHash', async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);
      mockAuthRepo.findRoleByName.mockResolvedValue({ id: 'role-1', name: 'Entrepreneur' });
      mockAuthRepo.createUser.mockResolvedValue({
        id: 'usr-1',
        email: 'new@example.com',
        firstName: 'Alice',
        lastName: 'Smith',
        passwordHash: 'hashed_password',
      });
      mockAuthRepo.createEmailVerificationToken.mockResolvedValue({ token: 'tok-1' });

      const result = await authService.register({
        email: 'new@example.com',
        password: 'pass123',
        firstName: 'Alice',
        lastName: 'Smith',
      });

      expect(result.email).toBe('new@example.com');
      expect(result.passwordHash).toBeUndefined();
    });
  });

  describe('verifyEmail()', () => {
    it('should throw BadRequestError for unknown token', async () => {
      mockAuthRepo.findEmailVerificationToken.mockResolvedValue(null);
      await expect(authService.verifyEmail('bad-token')).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw BadRequestError for already-verified token', async () => {
      mockAuthRepo.findEmailVerificationToken.mockResolvedValue({ verified: true, expiresAt: new Date(Date.now() + 10000) });
      await expect(authService.verifyEmail('used-token')).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw BadRequestError for expired token', async () => {
      const past = new Date(Date.now() - 1000);
      mockAuthRepo.findEmailVerificationToken.mockResolvedValue({ verified: false, expiresAt: past });
      await expect(authService.verifyEmail('expired-token')).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});
