'use strict';

const { Contract } = require('fabric-contract-api');
const stringify = require('json-stable-stringify');

const asBoolean = (value) => value === 'true' || value === true;

const parseBuffer = (buffer) => {
  if (!buffer || buffer.length === 0) {
    return null;
  }

  return JSON.parse(buffer.toString('utf8'));
};

const getTimestampIso = (ctx) => {
  const timestamp = ctx.stub.getTxTimestamp();
  const millis =
    Number(timestamp.seconds.low || timestamp.seconds) * 1000 +
    Math.floor(Number(timestamp.nanos || 0) / 1000000);
  return new Date(millis).toISOString();
};

const eventKey = (eventId) => `event:${eventId}`;
const productKey = (productId) => `product:${productId}`;
const identityKey = (identityId) => `identity:${identityId}`;

class SupplyChainContract extends Contract {
  async Ping(ctx) {
    return JSON.stringify({
      ok: true,
      txId: ctx.stub.getTxID(),
      chaincodeVersion: '1.1.0',
      timestamp: getTimestampIso(ctx),
    });
  }

  async RegisterProduct(ctx, productId, businessId, productDataHash) {
    const key = productKey(productId);
    const exists = await this.ProductExists(ctx, productId);
    if (asBoolean(exists)) {
      throw new Error(`Product ${productId} already exists`);
    }

    const record = {
      productId,
      businessId,
      productDataHash,
      registeredAt: getTimestampIso(ctx),
      updatedAt: getTimestampIso(ctx),
      txId: ctx.stub.getTxID(),
      blockNumber: '',
    };

    await ctx.stub.putState(key, Buffer.from(stringify(record)));
    return JSON.stringify(record);
  }

  // Re-anchors a product after its off-chain record changes. Reuses the product's
  // existing ledger key so Fabric's own key-history (GetProductHistory) captures every
  // revision, instead of overwriting RegisterProduct's provenance with a second "register".
  async UpdateProduct(ctx, productId, businessId, productDataHash) {
    const key = productKey(productId);
    const existingBuffer = await ctx.stub.getState(key);
    if (!existingBuffer || existingBuffer.length === 0) {
      throw new Error(`Product ${productId} does not exist`);
    }

    const existing = parseBuffer(existingBuffer);
    const record = {
      ...existing,
      productId,
      businessId,
      productDataHash,
      updatedAt: getTimestampIso(ctx),
      txId: ctx.stub.getTxID(),
      blockNumber: '',
    };

    await ctx.stub.putState(key, Buffer.from(stringify(record)));
    return JSON.stringify(record);
  }

  async GetProductHistory(ctx, productId) {
    const iterator = await ctx.stub.getHistoryForKey(productKey(productId));
    const entries = [];

    while (true) {
      const item = await iterator.next();
      if (item.value) {
        entries.push({
          txId: item.value.txId,
          timestamp: item.value.timestamp
            ? new Date(
                Number(item.value.timestamp.seconds.low || item.value.timestamp.seconds) * 1000
              ).toISOString()
            : null,
          isDelete: item.value.isDelete,
          value: parseBuffer(item.value.value),
        });
      }

      if (item.done) {
        await iterator.close();
        break;
      }
    }

    return JSON.stringify(entries);
  }

  async RegisterIdentity(ctx, identityId, productId, businessId, identityDataHash) {
    const key = identityKey(identityId);
    const exists = await this.IdentityExists(ctx, identityId);
    if (asBoolean(exists)) {
      throw new Error(`Identity ${identityId} already exists`);
    }

    const record = {
      identityId,
      productId,
      businessId,
      identityDataHash,
      registeredAt: getTimestampIso(ctx),
      txId: ctx.stub.getTxID(),
      blockNumber: '',
    };

    await ctx.stub.putState(key, Buffer.from(stringify(record)));
    return JSON.stringify(record);
  }

  async GetIdentity(ctx, identityId) {
    const record = await ctx.stub.getState(identityKey(identityId));
    if (!record || record.length === 0) {
      throw new Error(`Identity ${identityId} does not exist`);
    }
    return record.toString('utf8');
  }

  async IdentityExists(ctx, identityId) {
    const data = await ctx.stub.getState(identityKey(identityId));
    return String(!!data && data.length > 0);
  }

  async RecordEvent(
    ctx,
    eventId,
    productId,
    businessId,
    eventTypeCode,
    eventStatus,
    dataHash,
    recordedBy,
    occurredAt
  ) {
    if (!['CONFIRMED', 'LOCKED'].includes(eventStatus)) {
      throw new Error(`Unsupported eventStatus ${eventStatus}`);
    }

    const key = eventKey(eventId);
    const exists = await this.EventExists(ctx, eventId);
    if (asBoolean(exists)) {
      throw new Error(`Event ${eventId} already exists`);
    }

    const record = {
      eventId,
      productId,
      businessId,
      eventTypeCode,
      eventStatus,
      dataHash,
      recordedBy,
      occurredAt,
      anchoredAt: getTimestampIso(ctx),
      txId: ctx.stub.getTxID(),
      blockNumber: '',
    };

    await ctx.stub.putState(key, Buffer.from(stringify(record)));
    return JSON.stringify(record);
  }

  async GetEvent(ctx, eventId) {
    const record = await ctx.stub.getState(eventKey(eventId));
    if (!record || record.length === 0) {
      throw new Error(`Event ${eventId} does not exist`);
    }
    return record.toString('utf8');
  }

  async GetProduct(ctx, productId) {
    const record = await ctx.stub.getState(productKey(productId));
    if (!record || record.length === 0) {
      throw new Error(`Product ${productId} does not exist`);
    }
    return record.toString('utf8');
  }

  async GetEventHistory(ctx, eventId) {
    const iterator = await ctx.stub.getHistoryForKey(eventKey(eventId));
    const entries = [];

    while (true) {
      const item = await iterator.next();
      if (item.value) {
        entries.push({
          txId: item.value.txId,
          timestamp: item.value.timestamp
            ? new Date(
                Number(item.value.timestamp.seconds.low || item.value.timestamp.seconds) * 1000
              ).toISOString()
            : null,
          isDelete: item.value.isDelete,
          value: parseBuffer(item.value.value),
        });
      }

      if (item.done) {
        await iterator.close();
        break;
      }
    }

    return JSON.stringify(entries);
  }

  async GetProductTimeline(ctx, productId) {
    const iterator = await ctx.stub.getStateByRange('', '');
    const entries = [];

    while (true) {
      const item = await iterator.next();
      if (item.value && item.value.key.startsWith('event:')) {
        const value = parseBuffer(item.value.value);
        if (value && value.productId === productId) {
          entries.push(value);
        }
      }

      if (item.done) {
        await iterator.close();
        break;
      }
    }

    entries.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    return JSON.stringify(entries);
  }

  async EventExists(ctx, eventId) {
    const data = await ctx.stub.getState(eventKey(eventId));
    return String(!!data && data.length > 0);
  }

  async ProductExists(ctx, productId) {
    const data = await ctx.stub.getState(productKey(productId));
    return String(!!data && data.length > 0);
  }
}

module.exports = SupplyChainContract;
