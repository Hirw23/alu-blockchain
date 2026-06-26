import request from 'supertest';
import { jest } from '@jest/globals';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  emailVerificationToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  passwordResetToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

// Mock the database client provider module
jest.unstable_mockModule('../database/client.js', () => {
  return {
    prisma: prismaMock,
    default: prismaMock,
  };
});

// Import app after registering module mock
const { default: app } = await import('../app.js');

describe('Authentication API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should validate registration request body and return 400 on error', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({ email: 'invalid-email' });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should successfully register a new Entrepreneur user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.role.findUnique.mockResolvedValue({ id: 'role-1', name: 'Entrepreneur' });
      prismaMock.user.create.mockResolvedValue({
        id: 'usr-1',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        role: { name: 'Entrepreneur' },
        emailVerified: false,
      });
      prismaMock.emailVerificationToken.create.mockResolvedValue({
        token: 'verify-token-123',
      });

      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'alice@example.com',
        password: 'securePassword123',
        firstName: 'Alice',
        lastName: 'Smith',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('alice@example.com');
    });

    it('should return 409 Conflict if email is already registered', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'usr-1', email: 'alice@example.com' });

      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'alice@example.com',
        password: 'securePassword123',
        firstName: 'Alice',
        lastName: 'Smith',
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should fail to login with non-existent email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'notfound@example.com',
        password: 'anyPassword',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
