import prisma from '../database/client.js';

export const businessesRepository = {
  /**
   * Retrieves a Business by its unique ID, embedding nested details.
   */
  async findById(id) {
    return prisma.business.findUnique({
      where: { id },
      include: {
        address: true,
        documents: true,
        cooperative: true,
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });
  },

  /**
   * Finds a Business by registration number.
   */
  async findByRegNumber(registrationNumber) {
    return prisma.business.findUnique({
      where: { registrationNumber },
    });
  },

  /**
   * Finds a Business by tax ID.
   */
  async findByTaxId(taxIdentificationNumber) {
    return prisma.business.findUnique({
      where: { taxIdentificationNumber },
    });
  },

  /**
   * Creates a Business and assigns the owner as an Owner role member in a transaction.
   */
  async createBusiness(ownerId, data) {
    return prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          ownerId,
          ...data,
        },
      });

      // Create owner membership entry
      await tx.businessMember.create({
        data: {
          businessId: business.id,
          userId: ownerId,
          role: 'Owner',
        },
      });

      return tx.business.findUnique({
        where: { id: business.id },
        include: { address: true, cooperative: true },
      });
    });
  },

  /**
   * Modifies an existing business record.
   */
  async updateBusiness(id, data) {
    return prisma.business.update({
      where: { id },
      data,
      include: { address: true, cooperative: true },
    });
  },

  /**
   * Deletes a business record.
   */
  async deleteBusiness(id) {
    return prisma.business.delete({
      where: { id },
    });
  },

  /**
   * Retrieves a list of businesses owned by or associated with a User.
   */
  async findUserBusinesses(userId) {
    return prisma.business.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: { address: true, cooperative: true },
    });
  },

  /**
   * Performs dynamic search, filtering, and paging of businesses.
   */
  async searchBusinesses(filters) {
    const {
      q,
      registrationNumber,
      industry,
      businessType,
      verificationStatus,
      status,
      cooperativeId,
      ownerId,
      page,
      limit,
      sortBy,
      sortOrder,
    } = filters;

    const skip = (page - 1) * limit;

    // Build dynamic Prisma query filter tree
    const where = {};

    if (q) {
      where.OR = [
        { businessName: { contains: q, mode: 'insensitive' } },
        { tradingName: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (registrationNumber) {
      where.registrationNumber = registrationNumber;
    }
    if (industry) {
      where.industry = { equals: industry, mode: 'insensitive' };
    }
    if (businessType) {
      where.businessType = { equals: businessType, mode: 'insensitive' };
    }
    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }
    if (status) {
      where.status = status;
    }
    if (cooperativeId) {
      where.cooperativeId = cooperativeId;
    }
    if (ownerId) {
      where.ownerId = ownerId;
    }

    const [items, total] = await prisma.$transaction([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: { address: true, cooperative: true },
      }),
      prisma.business.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * Upserts the physical address details of a business.
   */
  async setAddress(businessId, addressData) {
    return prisma.businessAddress.upsert({
      where: { businessId },
      update: addressData,
      create: {
        businessId,
        ...addressData,
      },
    });
  },

  /**
   * Retrieves the address of a business.
   */
  async getAddress(businessId) {
    return prisma.businessAddress.findUnique({
      where: { businessId },
    });
  },

  /**
   * Adds a document upload meta entry to a business.
   */
  async addDocument(businessId, uploadedBy, docData) {
    return prisma.businessDocument.create({
      data: {
        businessId,
        uploadedBy,
        ...docData,
      },
    });
  },

  /**
   * Retrieves all document uploads of a business.
   */
  async getDocuments(businessId) {
    return prisma.businessDocument.findMany({
      where: { businessId },
    });
  },

  /**
   * Finds a specific BusinessDocument by its ID.
   */
  async findDocumentById(id) {
    return prisma.businessDocument.findUnique({
      where: { id },
    });
  },

  /**
   * Verifies the upload status of a document.
   */
  async verifyDocument(id, verificationStatus) {
    return prisma.businessDocument.update({
      where: { id },
      data: { verificationStatus },
    });
  },

  /**
   * Deletes a document upload record.
   */
  async deleteDocument(id) {
    return prisma.businessDocument.delete({
      where: { id },
    });
  },

  /**
   * Assigns a User as a business member.
   */
  async addMember(businessId, userId, role) {
    return prisma.businessMember.create({
      data: {
        businessId,
        userId,
        role,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  },

  /**
   * Retrieves memberships assigned to a business.
   */
  async getMembers(businessId) {
    return prisma.businessMember.findMany({
      where: { businessId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  },

  /**
   * Finds a BusinessMember record by ID.
   */
  async findMemberById(id) {
    return prisma.businessMember.findUnique({
      where: { id },
    });
  },

  /**
   * Modifies role classification of a member.
   */
  async updateMemberRole(id, role) {
    return prisma.businessMember.update({
      where: { id },
      data: { role },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  },

  /**
   * Removes a member from a business.
   */
  async removeMember(id) {
    return prisma.businessMember.delete({
      where: { id },
    });
  },

  /**
   * Updates general lifecycle status of a business.
   */
  async updateStatus(id, status) {
    return prisma.business.update({
      where: { id },
      data: { status },
    });
  },

  /**
   * Updates auditor verification status of a business.
   */
  async updateVerification(id, verificationStatus) {
    return prisma.business.update({
      where: { id },
      data: { verificationStatus },
    });
  },

  /**
   * Compiles business statistics counts.
   */
  async getStatistics(id) {
    const memberCount = await prisma.businessMember.count({
      where: { businessId: id },
    });

    return {
      productsCount: 0,
      supplyChainEventsCount: 0,
      qrCodesGeneratedCount: 0,
      productVerificationsCount: 0,
      membersCount: memberCount,
    };
  },
};

export default businessesRepository;
