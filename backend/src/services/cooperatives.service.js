import cooperativesRepository from '../repositories/cooperatives.repository.js';
import businessesRepository from '../repositories/businesses.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';

export const cooperativesService = {
  /**
   * Registers a new cooperative entity profile.
   */
  async createCooperative(data) {
    const existingName = await cooperativesRepository.findByName(data.cooperativeName);
    if (existingName) {
      throw new ConflictError('A cooperative with this name already exists');
    }

    const existingReg = await cooperativesRepository.findByRegNumber(data.registrationNumber);
    if (existingReg) {
      throw new ConflictError('A cooperative with this registration number already exists');
    }

    return cooperativesRepository.createCooperative(data);
  },

  /**
   * Retrieves cooperative details by ID.
   */
  async getCooperative(id) {
    const cooperative = await cooperativesRepository.findById(id);
    if (!cooperative) {
      throw new NotFoundError('Cooperative not found');
    }
    return cooperative;
  },

  /**
   * Modifies an existing cooperative profile.
   */
  async updateCooperative(id, data) {
    const cooperative = await this.getCooperative(id);

    if (data.cooperativeName && data.cooperativeName !== cooperative.cooperativeName) {
      const existingName = await cooperativesRepository.findByName(data.cooperativeName);
      if (existingName) {
        throw new ConflictError('A cooperative with this name already exists');
      }
    }

    return cooperativesRepository.updateCooperative(id, data);
  },

  /**
   * Deletes a cooperative entity.
   */
  async deleteCooperative(id) {
    await this.getCooperative(id);
    return cooperativesRepository.deleteCooperative(id);
  },

  /**
   * Retrieves all registered cooperatives.
   */
  async getAll() {
    return cooperativesRepository.findAll();
  },

  /**
   * Lists all businesses associated with a cooperative.
   */
  async getBusinesses(cooperativeId) {
    await this.getCooperative(cooperativeId);
    return cooperativesRepository.findBusinesses(cooperativeId);
  },

  /**
   * Links a business to a cooperative membership roster.
   */
  async addBusiness(cooperativeId, businessId) {
    await this.getCooperative(cooperativeId);

    const business = await businessesRepository.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    return cooperativesRepository.addBusiness(cooperativeId, businessId);
  },

  /**
   * Removes business from a cooperative.
   */
  async removeBusiness(cooperativeId, businessId) {
    await this.getCooperative(cooperativeId);

    const business = await businessesRepository.findById(businessId);
    if (!business || business.cooperativeId !== cooperativeId) {
      throw new NotFoundError('Business not found or does not belong to this cooperative');
    }

    return cooperativesRepository.removeBusiness(businessId);
  },
};

export default cooperativesService;
