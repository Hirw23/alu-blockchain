import prisma from '../database/client.js';

export const supplychainRepository = {
  // =========================================================================
  // EVENT TYPE QUERIES
  // =========================================================================

  async findAllEventTypes() {
    return prisma.supplyChainEventType.findMany({
      orderBy: { name: 'asc' },
    });
  },

  async findEventTypeById(id) {
    return prisma.supplyChainEventType.findUnique({
      where: { id },
    });
  },

  async findEventTypeByName(name) {
    return prisma.supplyChainEventType.findUnique({
      where: { name },
    });
  },

  // =========================================================================
  // EVENT QUERIES & TRANSACTIONS
  // =========================================================================

  async createEvent(performedBy, businessId, data) {
    const { location, attachments, ...eventData } = data;

    return prisma.$transaction(async (tx) => {
      // Find the highest sequence number for this specific product to ensure ordering continuity
      const agg = await tx.supplyChainEvent.aggregate({
        where: { productId: eventData.productId },
        _max: { sequenceNumber: true },
      });
      const nextSequence = (agg._max.sequenceNumber || 0) + 1;

      return tx.supplyChainEvent.create({
        data: {
          performedBy,
          businessId,
          sequenceNumber: nextSequence,
          ...eventData,
          location: location ? { create: location } : undefined,
          attachments:
            attachments && attachments.length > 0
              ? {
                  create: attachments.map((att) => ({
                    ...att,
                    uploadedBy: performedBy,
                  })),
                }
              : undefined,
        },
        include: {
          location: true,
          attachments: true,
          eventType: true,
          performer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    });
  },

  async findById(id) {
    return prisma.supplyChainEvent.findUnique({
      where: { id },
      include: {
        location: true,
        attachments: true,
        eventType: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        performer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  async updateEvent(id, data) {
    return prisma.supplyChainEvent.update({
      where: { id },
      data,
      include: {
        location: true,
        attachments: true,
        eventType: true,
      },
    });
  },

  async deleteEvent(id) {
    return prisma.supplyChainEvent.delete({
      where: { id },
    });
  },

  async updateStatus(id, eventStatus) {
    return prisma.supplyChainEvent.update({
      where: { id },
      data: { eventStatus },
      include: {
        eventType: true,
      },
    });
  },

  async searchEvents(filters) {
    const { q, productId, businessId, eventTypeId, eventStatus, page, limit, sortBy, sortOrder } =
      filters;

    const skip = (page - 1) * limit;
    const where = {};

    if (productId) where.productId = productId;
    if (businessId) where.businessId = businessId;
    if (eventTypeId) where.eventTypeId = eventTypeId;
    if (eventStatus) where.eventStatus = eventStatus;

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await prisma.$transaction([
      prisma.supplyChainEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          eventType: true,
          location: true,
          attachments: true,
        },
      }),
      prisma.supplyChainEvent.count({ where }),
    ]);

    return { items, total };
  },

  async findTimeline(productId) {
    return prisma.supplyChainEvent.findMany({
      where: { productId },
      orderBy: { sequenceNumber: 'asc' },
      include: {
        eventType: true,
        location: true,
        attachments: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },

  // =========================================================================
  // LOCATION QUERIES
  // =========================================================================

  async updateLocation(eventId, data) {
    return prisma.supplyChainLocation.upsert({
      where: { eventId },
      update: data,
      create: { eventId, ...data },
    });
  },

  async findLocation(eventId) {
    return prisma.supplyChainLocation.findUnique({
      where: { eventId },
    });
  },

  // =========================================================================
  // ATTACHMENT QUERIES
  // =========================================================================

  async addAttachment(eventId, uploadedBy, data) {
    return prisma.supplyChainAttachment.create({
      data: {
        eventId,
        uploadedBy,
        ...data,
      },
    });
  },

  async findAttachmentById(id) {
    return prisma.supplyChainAttachment.findUnique({
      where: { id },
    });
  },

  async deleteAttachment(id) {
    return prisma.supplyChainAttachment.delete({
      where: { id },
    });
  },

  async getAttachments(eventId) {
    return prisma.supplyChainAttachment.findMany({
      where: { eventId },
      orderBy: { uploadedAt: 'desc' },
    });
  },

  // =========================================================================
  // COMMENT QUERIES
  // =========================================================================

  async addComment(eventId, userId, comment) {
    return prisma.supplyChainComment.create({
      data: {
        eventId,
        userId,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  async findCommentById(id) {
    return prisma.supplyChainComment.findUnique({
      where: { id },
    });
  },

  async deleteComment(id) {
    return prisma.supplyChainComment.delete({
      where: { id },
    });
  },

  async getComments(eventId) {
    return prisma.supplyChainComment.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },
};

export default supplychainRepository;
