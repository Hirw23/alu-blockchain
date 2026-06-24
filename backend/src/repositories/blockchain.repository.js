import prisma from '../database/client.js';

export const blockchainRepository = {
  async findEventById(id) {
    return prisma.supplyChainEvent.findUnique({
      where: { id },
      include: {
        eventType: true,
        location: true,
      },
    });
  },

  async updateEventBlockchainStatus(
    id,
    blockchainStatus,
    blockchainTransactionId = null,
    blockchainRecordedAt = null
  ) {
    return prisma.supplyChainEvent.update({
      where: { id },
      data: {
        blockchainStatus,
        blockchainTransactionId,
        blockchainRecordedAt,
      },
    });
  },

  async getAdminStats() {
    const [total, recorded, failed, pending] = await Promise.all([
      prisma.supplyChainEvent.count(),
      prisma.supplyChainEvent.count({ where: { blockchainStatus: 'RECORDED' } }),
      prisma.supplyChainEvent.count({ where: { blockchainStatus: 'FAILED' } }),
      prisma.supplyChainEvent.count({ where: { blockchainStatus: 'PENDING' } }),
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
