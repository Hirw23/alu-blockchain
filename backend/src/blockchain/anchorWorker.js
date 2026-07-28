import blockchainRepository from '../repositories/blockchain.repository.js';
import blockchainService from '../services/blockchain.service.js';
import { blockchainConfig } from '../config/blockchain.js';

let poller = null;
let isRunning = false;

const processProducts = async () => {
  const products = await blockchainRepository.findPendingProducts();
  for (const product of products) {
    try {
      await blockchainService.anchorProduct(product);
    } catch (error) {
      console.error(`Product anchoring failed for ${product.id}:`, error.message);
    }
  }
};

const processEvents = async () => {
  const events = await blockchainRepository.findPendingEvents();
  for (const event of events) {
    try {
      await blockchainService.anchorEvent(event);
    } catch (error) {
      console.error(`Event anchoring failed for ${event.id}:`, error.message);
    }
  }
};

const processIdentities = async () => {
  const identities = await blockchainRepository.findPendingIdentities();
  for (const identity of identities) {
    try {
      await blockchainService.anchorIdentity(identity);
    } catch (error) {
      console.error(`Identity anchoring failed for ${identity.id}:`, error.message);
    }
  }
};

export const processPendingAnchors = async () => {
  if (isRunning || !blockchainConfig.enabled) {
    return;
  }

  isRunning = true;
  try {
    await processProducts();
    await processEvents();
    await processIdentities();
  } finally {
    isRunning = false;
  }
};

export const startAnchorWorker = () => {
  if (!blockchainConfig.enabled || !blockchainConfig.autoAnchor || poller) {
    return null;
  }

  poller = setInterval(() => {
    processPendingAnchors().catch((error) => {
      console.error('Background blockchain anchor worker failure:', error.message);
    });
  }, blockchainConfig.anchorPollMs);

  return poller;
};

export const stopAnchorWorker = () => {
  if (poller) {
    clearInterval(poller);
    poller = null;
  }
};

export default {
  processPendingAnchors,
  startAnchorWorker,
  stopAnchorWorker,
};
