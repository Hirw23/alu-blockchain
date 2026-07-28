import prisma from '../database/client.js';
import { blockchainConfig } from '../config/blockchain.js';

export const blockchainRepository = {
  async findEventById(id) {
    return prisma.supplyChainEvent.findUnique({
      where: { id },
      include: {
        eventType: true,
        location: true,
        attachments: true,
        performer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  async findProductById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        business: {
          include: {
            members: true,
          },
        },
        category: true,
        variants: true,
        images: true,
        documents: true,
      },
    });
  },

  async findIdentityById(id) {
    return prisma.productIdentity.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });
  },

  async updateEventBlockchainStatus(id, data) {
    return prisma.supplyChainEvent.update({
      where: { id },
      data,
    });
  },

  async updateProductBlockchainStatus(id, data) {
    return prisma.product.update({
      where: { id },
      data,
    });
  },

  async updateIdentityBlockchainStatus(id, data) {
    return prisma.productIdentity.update({
      where: { id },
      data,
    });
  },

  async findPendingEvents(limit = 25) {
    return prisma.supplyChainEvent.findMany({
      where: {
        eventStatus: { in: ['CONFIRMED', 'LOCKED'] },
        blockchainStatus: { in: ['PENDING', 'FAILED'] },
        blockchainRetryCount: { lt: blockchainConfig.maxRetries },
      },
      include: {
        eventType: true,
        location: true,
        attachments: true,
        performer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ blockchainRetryCount: 'asc' }, { occurredAt: 'asc' }],
      take: limit,
    });
  },

  async findPendingProducts(limit = 25) {
    return prisma.product.findMany({
      where: {
        blockchainStatus: { in: ['PENDING', 'FAILED'] },
        blockchainRetryCount: { lt: blockchainConfig.maxRetries },
      },
      include: {
        business: true,
        category: true,
        variants: true,
        images: true,
        documents: true,
      },
      orderBy: [{ blockchainRetryCount: 'asc' }, { createdAt: 'asc' }],
      take: limit,
    });
  },

  async findPendingIdentities(limit = 25) {
    return prisma.productIdentity.findMany({
      where: {
        blockchainStatus: { in: ['PENDING', 'FAILED'] },
        blockchainRetryCount: { lt: blockchainConfig.maxRetries },
      },
      include: {
        product: true,
      },
      orderBy: [{ blockchainRetryCount: 'asc' }, { generatedAt: 'asc' }],
      take: limit,
    });
  },

  async findRecentProducts(limit = 20) {
    return prisma.product.findMany({
      include: {
        business: { select: { businessName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  async findRecentIdentities(limit = 20) {
    return prisma.productIdentity.findMany({
      include: {
        product: { select: { productName: true } },
      },
      orderBy: { generatedAt: 'desc' },
      take: limit,
    });
  },

  async findEventByTransactionId(transactionId) {
    return prisma.supplyChainEvent.findFirst({
      where: { blockchainTransactionId: transactionId },
      include: {
        eventType: true,
      },
    });
  },

  async findProductByTransactionId(transactionId) {
    return prisma.product.findFirst({
      where: { blockchainTransactionId: transactionId },
      include: {
        business: true,
        category: true,
      },
    });
  },

  async findIdentityByTransactionId(transactionId) {
    return prisma.productIdentity.findFirst({
      where: { blockchainTransactionId: transactionId },
      include: {
        product: true,
      },
    });
  },

  async getAdminStats() {
    const confirmedWhere = { blockchainStatus: { in: ['CONFIRMED', 'RECORDED'] } };
    const failedWhere = { blockchainStatus: 'FAILED' };
    const pendingWhere = { blockchainStatus: { in: ['PENDING', 'PROCESSING'] } };

    const [
      eventTotal, eventConfirmed, eventFailed, eventPending,
      productTotal, productConfirmed, productFailed, productPending,
      identityTotal, identityConfirmed, identityFailed, identityPending,
    ] = await Promise.all([
      prisma.supplyChainEvent.count(),
      prisma.supplyChainEvent.count({ where: confirmedWhere }),
      prisma.supplyChainEvent.count({ where: failedWhere }),
      prisma.supplyChainEvent.count({ where: pendingWhere }),
      prisma.product.count(),
      prisma.product.count({ where: confirmedWhere }),
      prisma.product.count({ where: failedWhere }),
      prisma.product.count({ where: pendingWhere }),
      prisma.productIdentity.count(),
      prisma.productIdentity.count({ where: confirmedWhere }),
      prisma.productIdentity.count({ where: failedWhere }),
      prisma.productIdentity.count({ where: pendingWhere }),
    ]);

    const total = eventTotal + productTotal + identityTotal;
    const recorded = eventConfirmed + productConfirmed + identityConfirmed;
    const failed = eventFailed + productFailed + identityFailed;
    const pending = eventPending + productPending + identityPending;

    return {
      totalBlockchainRecords: total,
      successfulRecords: recorded,
      failedRecords: failed,
      pendingRecords: pending,
      blockchainRecordingRate: total > 0 ? (recorded / total) * 100 : 0,
      byRecordType: {
        events: { total: eventTotal, confirmed: eventConfirmed, failed: eventFailed, pending: eventPending },
        products: { total: productTotal, confirmed: productConfirmed, failed: productFailed, pending: productPending },
        identities: { total: identityTotal, confirmed: identityConfirmed, failed: identityFailed, pending: identityPending },
      },
    };
  },
};

export default blockchainRepository;
