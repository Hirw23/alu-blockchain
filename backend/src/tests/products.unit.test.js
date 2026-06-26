import { jest } from '@jest/globals';

// ============================================================
// Unit tests for productsService business logic
// ============================================================

const mockProductRepo = {
  createProduct: jest.fn(),
  findById: jest.fn(),
  findByProductCode: jest.fn(),
  findBySku: jest.fn(),
  findByBarcode: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
  searchProducts: jest.fn(),
  findUserProducts: jest.fn(),
  createCategory: jest.fn(),
  findCategoryById: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  findAllCategories: jest.fn(),
};

const mockBusinessRepo = {
  findById: jest.fn(),
};

jest.unstable_mockModule('../repositories/products.repository.js', () => ({
  default: mockProductRepo,
  productsRepository: mockProductRepo,
}));

jest.unstable_mockModule('../repositories/businesses.repository.js', () => ({
  default: mockBusinessRepo,
  businessRepository: mockBusinessRepo,
}));

// products.service.js exports `productsService`
const { productsService } = await import('../services/products.service.js');

describe('ProductsService — Unit Tests', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('getProduct()', () => {
    it('should throw NotFoundError when product does not exist', async () => {
      mockProductRepo.findById.mockResolvedValue(null);
      await expect(productsService.getProduct('no-id')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should return product data when found', async () => {
      const product = { id: 'prod-1', productName: 'Organic Honey' };
      mockProductRepo.findById.mockResolvedValue(product);
      const result = await productsService.getProduct('prod-1');
      expect(result.productName).toBe('Organic Honey');
    });
  });

  describe('registerProduct()', () => {
    it('should throw ForbiddenError when business is not verified', async () => {
      // registerProduct(createdBy, data)
      mockBusinessRepo.findById.mockResolvedValue({
        id: 'bus-1',
        ownerId: 'usr-1',
        status: 'ACTIVE',
        verificationStatus: 'PENDING',
        members: [],
      });
      // These need to return null so uniqueness checks pass before hitting business check
      mockProductRepo.findBySku.mockResolvedValue(null);
      mockProductRepo.findByBarcode.mockResolvedValue(null);
      mockProductRepo.findByProductCode.mockResolvedValue(null);
      mockProductRepo.findCategoryById.mockResolvedValue({ id: 'cat-1' });

      await expect(
        productsService.registerProduct('usr-1', {
          businessId: 'bus-1',
          categoryId: 'cat-1',
          productName: 'Honey',
          productCode: 'P001',
          sku: 'SKU-001',
          barcode: 'BAR-001',
          productType: 'Raw',
          countryOfOrigin: 'Rwanda',
          unitOfMeasure: 'KG',
        })
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should throw ConflictError when SKU is already registered', async () => {
      mockBusinessRepo.findById.mockResolvedValue({
        id: 'bus-1',
        ownerId: 'usr-1',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        members: [],
      });
      mockProductRepo.findBySku.mockResolvedValue({ id: 'existing-prod' });

      await expect(
        productsService.registerProduct('usr-1', {
          businessId: 'bus-1',
          categoryId: 'cat-1',
          productName: 'Honey',
          productCode: 'P001',
          sku: 'SKU-001',
          barcode: 'BAR-001',
          productType: 'Raw',
          countryOfOrigin: 'Rwanda',
          unitOfMeasure: 'KG',
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('deleteProduct()', () => {
    it('should throw NotFoundError when product does not exist', async () => {
      mockProductRepo.findById.mockResolvedValue(null);
      // deleteProduct(id, userId, userRole)
      await expect(productsService.deleteProduct('no-id', 'usr-1', 'Entrepreneur'))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw ForbiddenError for non-owner trying to delete', async () => {
      mockProductRepo.findById.mockResolvedValue({
        id: 'prod-1',
        business: {
          ownerId: 'usr-owner',
          status: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          members: [],
        },
      });

      await expect(
        productsService.deleteProduct('prod-1', 'usr-other', 'Entrepreneur')
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should call deleteProduct repo for the product owner', async () => {
      mockProductRepo.findById.mockResolvedValue({
        id: 'prod-1',
        business: {
          ownerId: 'usr-owner',
          status: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          members: [],
        },
      });
      mockProductRepo.deleteProduct.mockResolvedValue({ id: 'prod-1' });

      await productsService.deleteProduct('prod-1', 'usr-owner', 'Entrepreneur');
      expect(mockProductRepo.deleteProduct).toHaveBeenCalledWith('prod-1');
    });
  });
});
