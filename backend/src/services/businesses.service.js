import businessesRepository from '../repositories/businesses.repository.js';
import { ConflictError, NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';

/**
 * Checks if a user has management permissions (Owner/Manager) for a business.
 */
const checkManagementAccess = (business, userId, userRole) => {
  if (userRole === 'PlatformAdmin') return; // Admin bypass
  if (business.ownerId === userId) return; // Owner bypass

  const membership = business.members.find((m) => m.userId === userId);
  if (!membership || !['Owner', 'Manager'].includes(membership.role)) {
    throw new ForbiddenError('You do not have management access for this business');
  }
};

/**
 * Checks if a user is the primary Owner of the business.
 */
const checkOwnerAccess = (business, userId, userRole) => {
  if (userRole === 'PlatformAdmin') return;
  if (business.ownerId !== userId) {
    throw new ForbiddenError('Only the business owner can perform this operation');
  }
};

export const businessesService = {
  /**
   * Registers a new business profile.
   */
  async registerBusiness(ownerId, data) {
    const existingReg = await businessesRepository.findByRegNumber(data.registrationNumber);
    if (existingReg) {
      throw new ConflictError('A business with this registration number already exists');
    }

    const existingTax = await businessesRepository.findByTaxId(data.taxIdentificationNumber);
    if (existingTax) {
      throw new ConflictError('A business with this tax identification number already exists');
    }

    return businessesRepository.createBusiness(ownerId, data);
  },

  /**
   * Retrieves profile details of a business.
   */
  async getBusiness(id) {
    const business = await businessesRepository.findById(id);
    if (!business) {
      throw new NotFoundError('Business not found');
    }
    return business;
  },

  /**
   * Modifies an existing business profile.
   */
  async updateBusiness(id, userId, userRole, data) {
    const business = await this.getBusiness(id);
    checkManagementAccess(business, userId, userRole);

    if (data.registrationNumber && data.registrationNumber !== business.registrationNumber) {
      const existingReg = await businessesRepository.findByRegNumber(data.registrationNumber);
      if (existingReg) {
        throw new ConflictError('A business with this registration number already exists');
      }
    }

    if (
      data.taxIdentificationNumber &&
      data.taxIdentificationNumber !== business.taxIdentificationNumber
    ) {
      const existingTax = await businessesRepository.findByTaxId(data.taxIdentificationNumber);
      if (existingTax) {
        throw new ConflictError('A business with this tax identification number already exists');
      }
    }

    return businessesRepository.updateBusiness(id, data);
  },

  /**
   * Deletes a business listing.
   */
  async deleteBusiness(id, userId, userRole) {
    const business = await this.getBusiness(id);
    checkOwnerAccess(business, userId, userRole);
    return businessesRepository.deleteBusiness(id);
  },

  /**
   * Performs advanced filters query searches.
   */
  async search(filters) {
    return businessesRepository.searchBusinesses(filters);
  },

  /**
   * Gets businesses owned or managed by active User.
   */
  async getMyBusinesses(userId) {
    return businessesRepository.findUserBusinesses(userId);
  },

  /**
   * Manages the address mapping details.
   */
  async updateAddress(id, userId, userRole, addressData) {
    const business = await this.getBusiness(id);
    checkManagementAccess(business, userId, userRole);
    return businessesRepository.setAddress(id, addressData);
  },

  /**
   * Retrieves address details.
   */
  async getAddress(id) {
    const address = await businessesRepository.getAddress(id);
    if (!address) {
      throw new NotFoundError('No address registered for this business');
    }
    return address;
  },

  /**
   * Uploads documents verification records.
   */
  async addDocument(id, userId, userRole, docData) {
    const business = await this.getBusiness(id);
    checkManagementAccess(business, userId, userRole);
    return businessesRepository.addDocument(id, userId, docData);
  },

  /**
   * Retrieves uploaded document list.
   */
  async getDocuments(id) {
    await this.getBusiness(id); // Throws 404 if business doesn't exist
    return businessesRepository.getDocuments(id);
  },

  /**
   * Removes an uploaded document listing.
   */
  async deleteDocument(id, documentId, userId, userRole) {
    const business = await this.getBusiness(id);
    checkManagementAccess(business, userId, userRole);

    const doc = await businessesRepository.findDocumentById(documentId);
    if (!doc || doc.businessId !== id) {
      throw new NotFoundError('Document not found or does not belong to this business');
    }

    return businessesRepository.deleteDocument(documentId);
  },

  /**
   * Audits/Verifies an uploaded document.
   */
  async verifyDocument(id, documentId, userRole, status) {
    if (userRole !== 'PlatformAdmin') {
      throw new ForbiddenError('Only platform administrators can verify business documents');
    }

    const business = await this.getBusiness(id);
    const doc = await businessesRepository.findDocumentById(documentId);
    if (!doc || doc.businessId !== business.id) {
      throw new NotFoundError('Document not found');
    }

    return businessesRepository.verifyDocument(documentId, status);
  },

  /**
   * Assigns a user to a business roster.
   */
  async addMember(id, userId, userRole, memberData) {
    const business = await this.getBusiness(id);
    checkManagementAccess(business, userId, userRole);

    // Verify if already registered
    const existing = business.members.find((m) => m.userId === memberData.userId);
    if (existing) {
      throw new ConflictError('User is already a member of this business');
    }

    return businessesRepository.addMember(id, memberData.userId, memberData.role);
  },

  /**
   * Retrieves members belonging to a business.
   */
  async getMembers(id) {
    await this.getBusiness(id);
    return businessesRepository.getMembers(id);
  },

  /**
   * Modifies role properties of business member.
   */
  async updateMemberRole(id, memberId, userId, userRole, newRole) {
    const business = await this.getBusiness(id);
    checkManagementAccess(business, userId, userRole);

    const member = await businessesRepository.findMemberById(memberId);
    if (!member || member.businessId !== id) {
      throw new NotFoundError('Member record not found');
    }

    // Owner cannot change their own role unless they assign someone else first
    if (member.userId === business.ownerId && newRole !== 'Owner') {
      throw new BadRequestError('Primary owner role cannot be modified');
    }

    return businessesRepository.updateMemberRole(memberId, newRole);
  },

  /**
   * Removes member registration.
   */
  async removeMember(id, memberId, userId, userRole) {
    const business = await this.getBusiness(id);
    checkManagementAccess(business, userId, userRole);

    const member = await businessesRepository.findMemberById(memberId);
    if (!member || member.businessId !== id) {
      throw new NotFoundError('Member record not found');
    }

    if (member.userId === business.ownerId) {
      throw new BadRequestError('Primary owner cannot be removed from business roster');
    }

    return businessesRepository.removeMember(memberId);
  },

  /**
   * Updates state status of a business.
   */
  async updateStatus(id, userId, userRole, newStatus) {
    const business = await this.getBusiness(id);

    // PlatformAdmin can set any status. Owners can only toggle DRAFT/SUBMITTED/PENDING_VERIFICATION
    if (userRole !== 'PlatformAdmin') {
      checkOwnerAccess(business, userId, userRole);
      if (!['DRAFT', 'SUBMITTED', 'PENDING_VERIFICATION'].includes(newStatus)) {
        throw new ForbiddenError('Unauthorized status change request');
      }
    }

    return businessesRepository.updateStatus(id, newStatus);
  },

  /**
   * Approves/Verifies business credentials.
   */
  async verifyBusiness(id, userRole, verificationStatus) {
    if (userRole !== 'PlatformAdmin') {
      throw new ForbiddenError('Only platform administrators can verify businesses');
    }

    await this.getBusiness(id);

    // If verified, automatically activate business status
    const status = verificationStatus === 'VERIFIED' ? 'ACTIVE' : 'SUBMITTED';

    await businessesRepository.updateVerification(id, verificationStatus);
    return businessesRepository.updateStatus(id, status);
  },

  /**
   * Compiles business stats.
   */
  async getStatistics(id) {
    await this.getBusiness(id);
    return businessesRepository.getStatistics(id);
  },
};

export default businessesService;
