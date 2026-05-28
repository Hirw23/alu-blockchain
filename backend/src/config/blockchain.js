import dotenv from 'dotenv';
dotenv.config();

/**
 * Blockchain configuration for Hyperledger Fabric or relevant ledgers.
 */
export const blockchainConfig = {
  url: process.env.BLOCKCHAIN_URL || 'grpc://localhost:7051',
  channel: process.env.BLOCKCHAIN_CHANNEL || 'mychannel',
  chaincode: process.env.BLOCKCHAIN_CHAINCODE || 'supplychain',
};

export default blockchainConfig;
