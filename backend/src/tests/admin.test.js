import request from 'supertest';
import { jest } from '@jest/globals';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  announcement: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  platformSetting: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  featureFlag: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  maintenanceWindow: {
    findMany: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

// Mock database client module
jest.unstable_mockModule('../database/client.js', () => {
  return {
    prisma: prismaMock,
    default: prismaMock,
  };
});

// Import app after mock registration
const { default: app } = await import('../app.js');
const { signAccessToken } = await import('../utils/jwt.utils.js');

describe('Platform Administration API Endpoints', () => {
  let adminToken;
  let entrepreneurToken;

  beforeAll(() => {
    adminToken = signAccessToken({
      id: 'usr-admin-123',
      email: 'admin@test.com',
      role: 'PlatformAdmin',
    });
    entrepreneurToken = signAccessToken({
      id: 'usr-ent-123',
      email: 'ent@test.com',
      role: 'Entrepreneur',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock user profile resolver response
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'usr-admin-123',
      status: 'ACTIVE',
      role: {
        name: 'PlatformAdmin',
        permissions: [
          { permission: { name: 'admin:view' } },
          { permission: { name: 'admin:manage' } },
          { permission: { name: 'audit:view' } },
          { permission: { name: 'settings:update' } },
          { permission: { name: 'features:update' } },
          { permission: { name: 'maintenance:manage' } },
        ],
      },
    });

    // Default setting for Maintenance Mode is false
    prismaMock.platformSetting.findUnique.mockResolvedValue({
      settingKey: 'Maintenance Mode',
      settingValue: 'false',
    });
    prismaMock.maintenanceWindow.findMany.mockResolvedValue([]);
  });

  describe('GET /api/v1/health', () => {
    it('should return system health and details check results', async () => {
      prismaMock.$queryRaw.mockResolvedValue([1]);

      const res = await request(app).get('/api/v1/health').send();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('HEALTHY');
    });
  });

  describe('GET /api/v1/admin/settings', () => {
    it('should load configuration list', async () => {
      prismaMock.platformSetting.findMany.mockResolvedValue([
        { settingKey: 'Registration Enabled', settingValue: 'true' },
      ]);

      const res = await request(app)
        .get('/api/v1/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.settings.length).toBe(1);
    });

    it('should block non-admins from settings retrieval', async () => {
      // Mock user as standard entrepreneur (who does not have settings:update)
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'usr-ent-123',
        status: 'ACTIVE',
        role: {
          name: 'Entrepreneur',
          permissions: [],
        },
      });

      const res = await request(app)
        .get('/api/v1/admin/settings')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send();

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PATCH /api/v1/admin/features/:id', () => {
    it('should update feature flags status toggle', async () => {
      prismaMock.featureFlag.update.mockResolvedValue({
        id: 'flag-123',
        featureName: 'Blockchain Enabled',
        enabled: true,
      });

      const res = await request(app)
        .patch('/api/v1/admin/features/flag-123')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ enabled: true });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.flag.enabled).toBe(true);
    });
  });

  describe('Maintenance Mode Interceptor', () => {
    it('should return 503 Service Unavailable for public endpoints when active', async () => {
      // Toggle maintenance mode to active
      prismaMock.platformSetting.findUnique.mockResolvedValue({
        settingKey: 'Maintenance Mode',
        settingValue: 'true',
      });

      // Mock client user identity as non-admin Entrepreneur
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'usr-ent-123',
        status: 'ACTIVE',
        role: {
          name: 'Entrepreneur',
          permissions: [],
        },
      });

      // Request normal settings (or any other protected operational route)
      const res = await request(app)
        .get('/api/v1/admin/settings')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send();

      expect(res.statusCode).toBe(503);
      expect(res.body.message).toContain('scheduled maintenance');
    });

    it('should allow authenticated PlatformAdmin users to bypass maintenance lockouts', async () => {
      // Toggle maintenance mode to active
      prismaMock.platformSetting.findUnique.mockResolvedValue({
        settingKey: 'Maintenance Mode',
        settingValue: 'true',
      });

      prismaMock.platformSetting.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      // PlatformAdmin is bypass-capable, does not get 503, gets 200 settings
      expect(res.statusCode).toBe(200);
    });
  });
});
