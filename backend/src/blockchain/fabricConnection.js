import fs from 'fs';
import { createPrivateKey } from 'crypto';
import grpc from '@grpc/grpc-js';
import { connect, signers } from '@hyperledger/fabric-gateway';
import { blockchainConfig } from '../config/blockchain.js';

let gateway;
let client;
let contract;

const readFirstPrivateKey = (keyPath) => {
  const stats = fs.statSync(keyPath);
  if (stats.isDirectory()) {
    const [firstKey] = fs.readdirSync(keyPath);
    if (!firstKey) {
      throw new Error(`No private key found in ${keyPath}`);
    }
    return fs.readFileSync(`${keyPath}/${firstKey}`);
  }

  return fs.readFileSync(keyPath);
};

const assertFabricFiles = () => {
  const requiredPaths = [
    blockchainConfig.fabric.tlsCertPath,
    blockchainConfig.fabric.identityCertPath,
    blockchainConfig.fabric.identityKeyPath,
  ];

  for (const filePath of requiredPaths) {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error(`Fabric identity material is missing: ${filePath || 'undefined path'}`);
    }
  }
};

export const connectFabric = async () => {
  if (!blockchainConfig.enabled) {
    return null;
  }

  if (contract) {
    return contract;
  }

  assertFabricFiles();

  const tlsRootCert = fs.readFileSync(blockchainConfig.fabric.tlsCertPath);
  const identityCert = fs.readFileSync(blockchainConfig.fabric.identityCertPath);
  const identityKey = createPrivateKey(readFirstPrivateKey(blockchainConfig.fabric.identityKeyPath));

  client = new grpc.Client(blockchainConfig.fabric.peerEndpoint, grpc.credentials.createSsl(tlsRootCert), {
    'grpc.ssl_target_name_override': blockchainConfig.fabric.peerHostAlias,
  });

  gateway = connect({
    client,
    identity: {
      mspId: blockchainConfig.fabric.mspId,
      credentials: identityCert,
    },
    signer: signers.newPrivateKeySigner(identityKey),
  });

  const network = gateway.getNetwork(blockchainConfig.fabric.channelName);
  contract = network.getContract(blockchainConfig.fabric.chaincodeName);
  return contract;
};

export const getFabricContract = async () => {
  if (contract) {
    return contract;
  }

  return connectFabric();
};

export const disconnectFabric = async () => {
  contract = null;

  if (gateway) {
    gateway.close();
    gateway = null;
  }

  if (client) {
    client.close();
    client = null;
  }
};

export default {
  connectFabric,
  getFabricContract,
  disconnectFabric,
};
