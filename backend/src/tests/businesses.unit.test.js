import { jest } from '@jest/globals';

// ============================================================
// Unit tests for businessesService business logic
// ============================================================

const mockBusinessRepo = {
  findById: jest.fn(),
  findByRegNumber: jest.fn(),
  findByTaxId: jest.fn(),
  createBusiness: jest.fn(),
  updateBusiness: jest.fn(),
  deleteBusiness: jest.fn(),
  updateStatus: jest.fn(),
  updateVerification: jest.fn(),
  getStatistics: jest.fn(),
  addMember: jest.fn(),
  getMembers: jest.fn(),
  findMemberById: jest.fn(),
  updateMemberRole: jest.fn(),
  removeMember: jest.fn(),
};

jest.unstable_mockModule('../repositories/businesses.repository.js', () => ({
  default: mockBusinessRepo,
  businessRepository: mockBusinessRepo,
}));

// businesses.service.js exports `businessesService`
const { businessesService } = await import('../services/businesses.service.js');

describe('BusinessesService — Unit Tests', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('getBusiness()', () => {
    it('should throw NotFoundError when business does not exist', async () => {
      mockBusinessRepo.findById.mockResolvedValue(null);
      await expect(businessesService.getBusiness('non-existent-id')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should return business data when found', async () => {
      const biz = { id: 'bus-1', businessName: 'Mamma Honey' };
      mockBusinessRepo.findById.mockResolvedValue(biz);
      const result = await businessesService.getBusiness('bus-1');
      expect(result.businessName).toBe('Mamma Honey');
    });
  });

  describe('verifyBusiness()', () => {
    it('should throw NotFoundError when business does not exist', async () => {
      mockBusinessRepo.findById.mockResolvedValue(null);
      // verifyBusiness(id, userRole, verificationStatus)
      await expect(
        businessesService.verifyBusiness('no-id', 'PlatformAdmin', 'VERIFIED')
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should call updateVerification and updateStatus when verifying a business', async () => {
      const biz = { id: 'bus-1', verificationStatus: 'PENDING', members: [] };
      mockBusinessRepo.findById.mockResolvedValue(biz);
      mockBusinessRepo.updateVerification.mockResolvedValue({ ...biz, verificationStatus: 'VERIFIED' });
      mockBusinessRepo.updateStatus.mockResolvedValue({ ...biz, status: 'ACTIVE' });

      await businessesService.verifyBusiness('bus-1', 'PlatformAdmin', 'VERIFIED');

      expect(mockBusinessRepo.updateVerification).toHaveBeenCalledWith('bus-1', 'VERIFIED');
      expect(mockBusinessRepo.updateStatus).toHaveBeenCalledWith('bus-1', 'ACTIVE');
    });
  });

  describe('deleteBusiness()', () => {
    it('should throw NotFoundError for unknown business', async () => {
      mockBusinessRepo.findById.mockResolvedValue(null);
      // deleteBusiness(id, userId, userRole)
      await expect(
        businessesService.deleteBusiness('bus-missing', 'usr-1', 'Entrepreneur')
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw ForbiddenError when non-owner tries to delete', async () => {
      mockBusinessRepo.findById.mockResolvedValue({
        id: 'bus-1',
        ownerId: 'usr-owner',
        members: [],
      });
      await expect(
        businessesService.deleteBusiness('bus-1', 'usr-other', 'Entrepreneur')
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should call deleteBusiness repo method for valid owner', async () => {
      mockBusinessRepo.findById.mockResolvedValue({
        id: 'bus-1',
        ownerId: 'usr-owner',
        members: [],
      });
      mockBusinessRepo.deleteBusiness.mockResolvedValue({ id: 'bus-1' });

      await businessesService.deleteBusiness('bus-1', 'usr-owner', 'Entrepreneur');
      expect(mockBusinessRepo.deleteBusiness).toHaveBeenCalledWith('bus-1');
    });
  });
});
