import prisma from '../database/client.js';

export const cooperativesRepository = {
  /**
   * Registers a new cooperative entity profile.
   */
  async createCooperative(data) {
    return prisma.cooperative.create({ data });
  },

  /**
   * Retrieves cooperative details by ID.
   */
  async findById(id) {
    return prisma.cooperative.findUnique({
      where: { id },
    });
  },

  /**
   * Finds cooperative profile by registration number.
   */
  async findByRegNumber(registrationNumber) {
    return prisma.cooperative.findUnique({
      where: { registrationNumber },
    });
  },

  /**
   * Finds cooperative profile by name.
   */
  async findByName(cooperativeName) {
    return prisma.cooperative.findUnique({
      where: { cooperativeName },
    });
  },

  /**
   * Modifies an existing cooperative profile.
   */
  async updateCooperative(id, data) {
    return prisma.cooperative.update({
      where: { id },
      data,
    });
  },

  /**
   * Deletes a cooperative entity listing.
   */
  async deleteCooperative(id) {
    return prisma.cooperative.delete({
      where: { id },
    });
  },

  /**
   * Retrieves all cooperatives.
   */
  async findAll() {
    return prisma.cooperative.findMany();
  },

  /**
   * Lists all businesses linked to a cooperative.
   */
  async findBusinesses(cooperativeId) {
    return prisma.business.findMany({
      where: { cooperativeId },
      include: { address: true },
    });
  },

  /**
   * Binds a business listing as a cooperative member.
   */
  async addBusiness(cooperativeId, businessId) {
    return prisma.business.update({
      where: { id: businessId },
      data: { cooperativeId },
      include: { cooperative: true },
    });
  },

  /**
   * Unbinds/Removes a business from a cooperative.
   */
  async removeBusiness(businessId) {
    return prisma.business.update({
      where: { id: businessId },
      data: { cooperativeId: null },
      include: { cooperative: true },
    });
  },
};

export default cooperativesRepository;
