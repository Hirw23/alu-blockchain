import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const resolveFromBackend = (value) =>
  value ? path.resolve(process.cwd(), value) : null;

export const blockchainConfig = {
  enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
  autoAnchor: process.env.BLOCKCHAIN_AUTO_ANCHOR !== 'false',
  anchorPollMs: Number(process.env.BLOCKCHAIN_ANCHOR_POLL_MS || 5000),
  maxRetries: Number(process.env.BLOCKCHAIN_MAX_RETRIES || 5),
  fabric: {
    channelName: process.env.FABRIC_CHANNEL_NAME || 'supplychainchannel',
    chaincodeName: process.env.FABRIC_CHAINCODE_NAME || 'supplychain-cc',
    mspId: process.env.FABRIC_MSP_ID || 'PlatformOrgMSP',
    peerEndpoint: process.env.FABRIC_PEER_ENDPOINT || 'localhost:7051',
    peerHostAlias: process.env.FABRIC_PEER_HOST_ALIAS || 'peer0.org1.example.com',
    tlsCertPath: resolveFromBackend(process.env.FABRIC_TLS_CERT_PATH),
    identityCertPath: resolveFromBackend(process.env.FABRIC_IDENTITY_CERT_PATH),
    identityKeyPath: resolveFromBackend(process.env.FABRIC_IDENTITY_KEY_PATH),
    // Optional: only needed for gateways (e.g. Kaleido) that require HTTP Basic Auth
    // on top of the mTLS identity to reach the peer's gRPC endpoint at all. Self-hosted
    // Fabric networks (e.g. the local test-network) leave these unset.
    appCredId: process.env.FABRIC_APP_CRED_ID || null,
    appCredSecret: process.env.FABRIC_APP_CRED_SECRET || null,
  },
};

export default blockchainConfig;
