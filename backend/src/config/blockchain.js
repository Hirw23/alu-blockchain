import dotenv from 'dotenv';
dotenv.config();

/**
 * Blockchain configuration for Hyperledger Fabric or relevant ledgers.
 * BLOCKCHAIN_ENABLED=false runs the service in simulation mode.
 */
export const blockchainConfig = {
  enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
  url: process.env.BLOCKCHAIN_URL || 'grpc://localhost:7051',
  network: process.env.BLOCKCHAIN_NETWORK || 'mainchannel',
  channel: process.env.BLOCKCHAIN_CHANNEL || 'mainchannel',
  chaincode: process.env.BLOCKCHAIN_CHAINCODE || 'traceability',
};

export default blockchainConfig;
