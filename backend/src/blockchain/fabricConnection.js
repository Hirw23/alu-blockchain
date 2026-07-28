import fs from 'fs';
import { createPrivateKey } from 'crypto';
import grpc from '@grpc/grpc-js';
import { connect, signers } from '@hyperledger/fabric-gateway';
import { blockchainConfig } from '../config/blockchain.js';

let gateway;
let client;
let contract;
let connecting;

// grpc-js has no default deadline: if the peer is unreachable (dropped packets, not
// even an active refusal), a call can hang forever instead of failing. That turns any
// network hiccup into a permanently-stuck request -- the health check never resolves,
// so the admin UI's "Promise.all" never settles either. Bounding every call type here
// makes "Fabric is unreachable" surface as a fast ERROR instead of an infinite spinner.
const withDeadline = (ms) => () => ({ deadline: Date.now() + ms });

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

  // Without this guard, concurrent callers (the 5s anchor-worker tick racing a
  // healthCheck request, for example) would each see `contract` as null and race to
  // open their own grpc.Client/gateway -- piling up duplicate hung connections instead
  // of sharing one in-flight attempt.
  if (connecting) {
    return connecting;
  }

  connecting = doConnectFabric().finally(() => {
    connecting = null;
  });
  return connecting;
};

const doConnectFabric = async () => {
  assertFabricFiles();

  const tlsRootCert = fs.readFileSync(blockchainConfig.fabric.tlsCertPath);
  const identityCert = fs.readFileSync(blockchainConfig.fabric.identityCertPath);
  const identityKeyPem = readFirstPrivateKey(blockchainConfig.fabric.identityKeyPath);
  const identityKey = createPrivateKey(identityKeyPem);

  // Gateways like Kaleido terminate the peer's gRPC endpoint with mutual TLS and
  // reject any connection that doesn't present a client certificate at all (TLS
  // alert 42, "bad certificate") -- distinct from the mTLS-optional local
  // test-network. The same enrolled identity used to sign transactions below is
  // also an acceptable client certificate here, since it was issued by the same
  // Fabric CA the peer's own TLS cert chains back to.
  const channelCreds = grpc.credentials.createSsl(tlsRootCert, identityKeyPem, identityCert);
  const { appCredId, appCredSecret } = blockchainConfig.fabric;

  // Gateways like Kaleido authenticate the gRPC connection itself with HTTP Basic
  // Auth, separate from the mTLS Fabric identity used to sign transactions below.
  const transportCreds = appCredId && appCredSecret
    ? grpc.credentials.combineChannelCredentials(
        channelCreds,
        grpc.credentials.createFromMetadataGenerator((_params, callback) => {
          const metadata = new grpc.Metadata();
          const basicAuth = Buffer.from(`${appCredId}:${appCredSecret}`).toString('base64');
          metadata.set('Authorization', `Basic ${basicAuth}`);
          callback(null, metadata);
        })
      )
    : channelCreds;

  client = new grpc.Client(blockchainConfig.fabric.peerEndpoint, transportCreds, {
    'grpc.ssl_target_name_override': blockchainConfig.fabric.peerHostAlias,
  });

  gateway = connect({
    client,
    identity: {
      mspId: blockchainConfig.fabric.mspId,
      credentials: identityCert,
    },
    signer: signers.newPrivateKeySigner(identityKey),
    evaluateOptions: withDeadline(10_000),
    endorseOptions: withDeadline(15_000),
    submitOptions: withDeadline(10_000),
    commitStatusOptions: withDeadline(30_000),
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
