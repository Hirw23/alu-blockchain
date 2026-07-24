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

  async getAdminStats() {
    const [total, recorded, failed, pending] = await Promise.all([
      prisma.supplyChainEvent.count(),
      prisma.supplyChainEvent.count({ where: { blockchainStatus: { in: ['CONFIRMED', 'RECORDED'] } } }),
      prisma.supplyChainEvent.count({ where: { blockchainStatus: 'FAILED' } }),
      prisma.supplyChainEvent.count({
        where: { blockchainStatus: { in: ['PENDING', 'PROCESSING'] } },
      }),
    ]);

    return {
      totalBlockchainRecords: total,
      successfulRecords: recorded,
      failedRecords: failed,
      pendingRecords: pending,
      blockchainRecordingRate: total > 0 ? (recorded / total) * 100 : 0,
    };
  },
};

export default blockchainRepository;
