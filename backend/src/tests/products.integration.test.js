import request from 'supertest';
import { jest } from '@jest/globals';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
  business: {
    findUnique: jest.fn(),
  },
  productCategory: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  product: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  productVariant: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  productImage: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  productDocument: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
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

describe('Products & Catalog API Endpoints', () => {
  let entrepreneurToken;
  const testBusinessId = 'e2098b6b-8d42-4521-888b-4456b3302343';
  const testCategoryId = 'd3098b6b-8d42-4521-888b-4456b3302344';

  beforeAll(() => {
    entrepreneurToken = signAccessToken({
      id: 'usr-entrepreneur-123',
      email: 'ent@test.com',
      role: 'Entrepreneur',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock user profile resolver response for all authentication middleware checks
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'usr-entrepreneur-123',
      status: 'ACTIVE',
      role: {
        name: 'Entrepreneur',
        permissions: [
          { permission: { name: 'product:create' } },
          { permission: { name: 'product:update' } },
          { permission: { name: 'product:view' } },
          { permission: { name: 'product:delete' } },
          { permission: { name: 'product:archive' } },
          { permission: { name: 'product:manage-images' } },
          { permission: { name: 'product:manage-documents' } },
          { permission: { name: 'product:manage-categories' } },
          { permission: { name: 'product:view-statistics' } },
        ],
      },
    });

    // Default mock business query response (active and verified)
    prismaMock.business.findUnique.mockResolvedValue({
      id: testBusinessId,
      ownerId: 'usr-entrepreneur-123',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      members: [],
    });
  });

  describe('POST /api/v1/products', () => {
    it('should validate creation fields and return 422', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send({ productName: 'Honey' });

      expect(res.statusCode).toBe(422);
    });

    it('should prevent registration for non-verified businesses', async () => {
      prismaMock.business.findUnique.mockResolvedValue({
        id: testBusinessId,
        ownerId: 'usr-entrepreneur-123',
        status: 'ACTIVE',
        verificationStatus: 'PENDING',
        members: [],
      });

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send({
          businessId: testBusinessId,
          categoryId: testCategoryId,
          productName: 'Mamma Honey Organic',
          productCode: 'PROD-HONEY-01',
          sku: 'SKU-HONEY-01',
          barcode: 'BARCODE-HONEY-01',
          productType: 'Raw',
          countryOfOrigin: 'Rwanda',
          unitOfMeasure: 'KG',
          quantity: 100,
        });

      expect(res.statusCode).toBe(403);
    });

    it('should register a new product successfully', async () => {
      prismaMock.productCategory.findUnique.mockResolvedValue({ id: testCategoryId });
      prismaMock.product.findUnique.mockResolvedValue(null); // Unique checks pass

      const mockProduct = {
        id: 'prod-honey-123',
        productName: 'Mamma Honey Organic',
        productCode: 'PROD-HONEY-01',
        sku: 'SKU-HONEY-01',
        barcode: 'BARCODE-HONEY-01',
        status: 'DRAFT',
      };

      prismaMock.product.create.mockResolvedValue(mockProduct);

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send({
          businessId: testBusinessId,
          categoryId: testCategoryId,
          productName: 'Mamma Honey Organic',
          productCode: 'PROD-HONEY-01',
          sku: 'SKU-HONEY-01',
          barcode: 'BARCODE-HONEY-01',
          productType: 'Raw',
          countryOfOrigin: 'Rwanda',
          unitOfMeasure: 'KG',
          quantity: 100,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.productName).toBe('Mamma Honey Organic');
    });

    it('should block duplicate SKU registration', async () => {
      prismaMock.productCategory.findUnique.mockResolvedValue({ id: testCategoryId });
      prismaMock.product.findUnique.mockResolvedValue({ id: 'existing-prod-id' }); // SKU exists

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${entrepreneurToken}`)
        .send({
          businessId: testBusinessId,
          categoryId: testCategoryId,
          productName: 'Mamma Honey Organic',
          productCode: 'PROD-HONEY-01',
          sku: 'SKU-HONEY-01',
          barcode: 'BARCODE-HONEY-01',
          productType: 'Raw',
          countryOfOrigin: 'Rwanda',
          unitOfMeasure: 'KG',
          quantity: 100,
        });

      expect(res.statusCode).toBe(409);
    });
  });

  describe('GET /api/v1/products/:id/statistics', () => {
    it('should retrieve metrics and placeholders for a product', async () => {
      prismaMock.product.findUnique.mockResolvedValue({
        id: 'prod-honey-123',
        productName: 'Mamma Honey Organic',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        category: { categoryName: 'Food' },
        business: { businessName: 'Mamma Honey Corp' },
        images: [],
        documents: [],
      });

      const res = await request(app)
        .get('/api/v1/products/prod-honey-123/statistics')
        .set('Authorization', `Bearer ${entrepreneurToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.statistics.productAgeDays).toBeDefined();
      expect(res.body.data.statistics.supplyChainEventsCount).toBe(0);
    });
  });

  describe('GET /api/v1/product-categories/tree', () => {
    it('should build hierarchical category tree structure', async () => {
      prismaMock.productCategory.findMany.mockResolvedValue([
        { id: 'cat-root', categoryName: 'Agriculture', parentCategoryId: null },
        { id: 'cat-child', categoryName: 'Coffee', parentCategoryId: 'cat-root' },
      ]);

      const res = await request(app)
        .get('/api/v1/product-categories/tree')
        .set('Authorization', `Bearer ${entrepreneurToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tree.length).toBe(1);
      expect(res.body.data.tree[0].subCategories.length).toBe(1);
    });
  });
});
