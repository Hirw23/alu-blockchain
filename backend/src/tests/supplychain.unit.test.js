import { jest } from '@jest/globals';

// ============================================================
// Unit tests for supplychainService business logic
// Tests the workflow guard, immutability, and access control
// ============================================================

const mockSupplychainRepo = {
  findById: jest.fn(),
  findTimeline: jest.fn(),
  findEventTypeById: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  updateStatus: jest.fn(),
  findCommentById: jest.fn(),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
  findAllEventTypes: jest.fn(),
};

const mockProductsService = {
  getProduct: jest.fn(),
};

jest.unstable_mockModule('../repositories/supplychain.repository.js', () => ({
  default: mockSupplychainRepo,
  supplychainRepository: mockSupplychainRepo,
}));

jest.unstable_mockModule('../services/products.service.js', () => ({
  default: mockProductsService,
  productsService: mockProductsService,
}));

const { supplychainService } = await import('../services/supplychain.service.js');

const activeBusiness = {
  id: 'bus-1',
  ownerId: 'usr-1',
  status: 'ACTIVE',
  verificationStatus: 'VERIFIED',
  members: [],
};

describe('SupplychainService — Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getEvent()', () => {
    it('should throw NotFoundError when event does not exist', async () => {
      mockSupplychainRepo.findById.mockResolvedValue(null);
      await expect(supplychainService.getEvent('no-id')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should return event when found', async () => {
      const evt = { id: 'evt-1', title: 'Harvested Logs' };
      mockSupplychainRepo.findById.mockResolvedValue(evt);
      const result = await supplychainService.getEvent('evt-1');
      expect(result.title).toBe('Harvested Logs');
    });
  });

  describe('updateEvent()', () => {
    it('should throw ForbiddenError for LOCKED events', async () => {
      mockSupplychainRepo.findById.mockResolvedValue({
        id: 'evt-locked',
        eventStatus: 'LOCKED',
        productId: 'prod-1',
      });
      mockProductsService.getProduct.mockResolvedValue({ business: activeBusiness });

      await expect(
        supplychainService.updateEvent('evt-locked', 'usr-1', 'Entrepreneur', { title: 'New title' })
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should update an unlocked event successfully', async () => {
      mockSupplychainRepo.findById.mockResolvedValue({
        id: 'evt-1',
        eventStatus: 'DRAFT',
        productId: 'prod-1',
      });
      mockProductsService.getProduct.mockResolvedValue({ business: activeBusiness });
      mockSupplychainRepo.updateEvent.mockResolvedValue({ id: 'evt-1', title: 'Updated' });

      const result = await supplychainService.updateEvent('evt-1', 'usr-1', 'Entrepreneur', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });
  });

  describe('deleteComment()', () => {
    it('should throw NotFoundError for non-existent comment', async () => {
      mockSupplychainRepo.findCommentById.mockResolvedValue(null);
      await expect(
        supplychainService.deleteComment('evt-1', 'cmt-bad', 'usr-1', 'Entrepreneur')
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw ForbiddenError when non-author tries to delete comment', async () => {
      mockSupplychainRepo.findCommentById.mockResolvedValue({
        id: 'cmt-1',
        eventId: 'evt-1',
        userId: 'usr-owner',
      });

      await expect(
        supplychainService.deleteComment('evt-1', 'cmt-1', 'usr-other', 'Entrepreneur')
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe('getCurrentStage()', () => {
    it('should return Pending stage when no confirmed events exist', async () => {
      mockProductsService.getProduct.mockResolvedValue({ business: activeBusiness });
      mockSupplychainRepo.findTimeline.mockResolvedValue([
        { eventStatus: 'DRAFT', eventType: { name: 'Harvested', category: 'Production' }, occurredAt: new Date() },
      ]);

      const result = await supplychainService.getCurrentStage('prod-1');
      expect(result.stage).toBe('Pending');
    });

    it('should return the last confirmed event stage', async () => {
      mockProductsService.getProduct.mockResolvedValue({ business: activeBusiness });
      mockSupplychainRepo.findTimeline.mockResolvedValue([
        { eventStatus: 'CONFIRMED', eventType: { name: 'Processed', category: 'Production' }, occurredAt: new Date() },
      ]);

      const result = await supplychainService.getCurrentStage('prod-1');
      expect(result.stage).toBe('Processed');
    });
  });
});
