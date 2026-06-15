import supplychainRepository from '../repositories/supplychain.repository.js';
import productsService from './products.service.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js';

const eventOrderWeight = {
  Harvested: 1,
  Manufactured: 1,
  Processed: 2,
  Packaged: 3,
  Inspected: 4,
  Certified: 5,
  Tested: 5,
  Stored: 6,
  'Warehouse Arrival': 7,
  'Warehouse Departure': 8,
  Dispatched: 9,
  Transported: 10,
  Delivered: 11,
  'Retail Arrival': 12,
  Purchased: 13,
  Returned: 14,
  Custom: 99,
};

/**
 * Access control helper checking business roles
 */
const checkEventManagementAccess = (business, userId, userRole) => {
  if (userRole === 'PlatformAdmin') return;
  if (business.ownerId === userId) return;

  const membership = business.members.find((m) => m.userId === userId);
  if (!membership || !['Owner', 'Manager'].includes(membership.role)) {
    throw new ForbiddenError('You do not have permission to manage events for this business');
  }
};

export const supplychainService = {
  // =========================================================================
  // EVENT TYPES
  // =========================================================================

  async getEventTypes() {
    return supplychainRepository.findAllEventTypes();
  },

  // =========================================================================
  // CORE EVENTS TRACE LOGIC
  // =========================================================================

  async recordEvent(userId, userRole, data) {
    const product = await productsService.getProduct(data.productId);

    // Business lifecycle checks
    const business = product.business;
    if (business.status !== 'ACTIVE' || business.verificationStatus !== 'VERIFIED') {
      throw new ForbiddenError('Only active, verified businesses can record supply chain events');
    }

    // Access control checks
    checkEventManagementAccess(business, userId, userRole);

    // Lifecycle check on product: must be ACTIVE
    if (product.status !== 'ACTIVE') {
      throw new BadRequestError('Only active products can participate in supply chain event logs');
    }

    // Resolve event type
    const eventType = await supplychainRepository.findEventTypeById(data.eventTypeId);
    if (!eventType) {
      throw new NotFoundError('Event type not found');
    }

    // Workflow transition check
    const timeline = await supplychainRepository.findTimeline(data.productId);
    const lastEvent = timeline
      .filter((e) => ['SUBMITTED', 'CONFIRMED', 'LOCKED'].includes(e.eventStatus))
      .pop(); // Get last recorded event in sequence

    if (lastEvent) {
      const prevWeight = eventOrderWeight[lastEvent.eventType.name] || 0;
      const nextWeight = eventOrderWeight[eventType.name] || 0;

      if (
        eventType.name !== 'Custom' &&
        lastEvent.eventType.name !== 'Custom' &&
        nextWeight < prevWeight
      ) {
        throw new BadRequestError(
          `Invalid workflow transition from ${lastEvent.eventType.name} to ${eventType.name}`
        );
      }
    }

    return supplychainRepository.createEvent(userId, business.id, data);
  },

  async getEvent(id) {
    const event = await supplychainRepository.findById(id);
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    return event;
  },

  async updateEvent(id, userId, userRole, updateData) {
    const event = await this.getEvent(id);
    const product = await productsService.getProduct(event.productId);

    // Access control
    checkEventManagementAccess(product.business, userId, userRole);

    // Immutability checks
    if (event.eventStatus === 'LOCKED') {
      throw new ForbiddenError('Locked events are immutable and cannot be updated');
    }

    return supplychainRepository.updateEvent(id, updateData);
  },

  async deleteEvent(id, userId, userRole) {
    const event = await this.getEvent(id);
    const product = await productsService.getProduct(event.productId);

    // Access control
    checkEventManagementAccess(product.business, userId, userRole);

    // Immutability checks
    if (event.eventStatus === 'LOCKED') {
      throw new ForbiddenError('Locked events are immutable and cannot be deleted');
    }

    return supplychainRepository.deleteEvent(id);
  },

  async updateStatus(id, userId, userRole, status) {
    const event = await this.getEvent(id);
    const product = await productsService.getProduct(event.productId);

    // Access control
    checkEventManagementAccess(product.business, userId, userRole);

    // Only PlatformAdmin or Owner can change status of LOCKED events or freeze them
    if (event.eventStatus === 'LOCKED' && userRole !== 'PlatformAdmin') {
      throw new ForbiddenError('Only platform administrators can modify locked events');
    }

    return supplychainRepository.updateStatus(id, status);
  },

  async search(filters) {
    return supplychainRepository.searchEvents(filters);
  },

  // =========================================================================
  // TIMELINES & CURRENT STAGE RESOLVER
  // =========================================================================

  async getTimeline(productId) {
    await productsService.getProduct(productId);
    return supplychainRepository.findTimeline(productId);
  },

  async getCurrentStage(productId) {
    await productsService.getProduct(productId);
    const timeline = await supplychainRepository.findTimeline(productId);

    // Get the latest confirmed/submitted event
    const lastEvent = timeline
      .filter((e) => ['SUBMITTED', 'CONFIRMED', 'LOCKED'].includes(e.eventStatus))
      .pop();

    if (!lastEvent) {
      return {
        stage: 'Pending',
        category: 'Production',
        lastUpdated: null,
      };
    }

    return {
      stage: lastEvent.eventType.name,
      category: lastEvent.eventType.category,
      lastUpdated: lastEvent.occurredAt,
    };
  },

  // =========================================================================
  // COMMENT OPERATIONS
  // =========================================================================

  async postComment(eventId, userId, userRole, commentText) {
    const event = await this.getEvent(eventId);
    const product = await productsService.getProduct(event.productId);

    // Users must belong to the business to comment, or be platform admins, or coop admins
    if (userRole !== 'PlatformAdmin' && product.business.ownerId !== userId) {
      const membership = product.business.members.find((m) => m.userId === userId);
      if (!membership) {
        throw new ForbiddenError(
          'You must be affiliated with this business to post audit comments'
        );
      }
    }

    return supplychainRepository.addComment(eventId, userId, commentText);
  },

  async deleteComment(eventId, commentId, userId, userRole) {
    const comment = await supplychainRepository.findCommentById(commentId);
    if (!comment || comment.eventId !== eventId) {
      throw new NotFoundError('Comment not found');
    }

    // Only the author or platform admin can delete a comment
    if (comment.userId !== userId && userRole !== 'PlatformAdmin') {
      throw new ForbiddenError('You can only delete your own comments');
    }

    return supplychainRepository.deleteComment(commentId);
  },

  // =========================================================================
  // LOCATION & ATTACHMENTS LOGIC
  // =========================================================================

  async updateLocation(eventId, userId, userRole, locationData) {
    const event = await this.getEvent(eventId);
    const product = await productsService.getProduct(event.productId);

    checkEventManagementAccess(product.business, userId, userRole);

    if (event.eventStatus === 'LOCKED') {
      throw new ForbiddenError('Locked events are immutable and locations cannot be modified');
    }

    return supplychainRepository.updateLocation(eventId, locationData);
  },

  async addAttachment(eventId, userId, userRole, attachmentData) {
    const event = await this.getEvent(eventId);
    const product = await productsService.getProduct(event.productId);

    checkEventManagementAccess(product.business, userId, userRole);

    if (event.eventStatus === 'LOCKED') {
      throw new ForbiddenError('Locked events are immutable and attachments cannot be modified');
    }

    return supplychainRepository.addAttachment(eventId, userId, attachmentData);
  },

  async deleteAttachment(eventId, attachmentId, userId, userRole) {
    const event = await this.getEvent(eventId);
    const product = await productsService.getProduct(event.productId);

    checkEventManagementAccess(product.business, userId, userRole);

    if (event.eventStatus === 'LOCKED') {
      throw new ForbiddenError('Locked events are immutable and attachments cannot be modified');
    }

    const attachment = await supplychainRepository.findAttachmentById(attachmentId);
    if (!attachment || attachment.eventId !== eventId) {
      throw new NotFoundError('Attachment not found');
    }

    return supplychainRepository.deleteAttachment(attachmentId);
  },
};

export default supplychainService;
