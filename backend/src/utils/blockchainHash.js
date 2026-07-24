import crypto from 'crypto';
import stringify from 'json-stable-stringify';

export const toCanonicalJson = (value) => stringify(value);

export const sha256 = (value) =>
  crypto.createHash('sha256').update(value).digest('hex');

export const createCanonicalHash = (value) => sha256(toCanonicalJson(value));

export default {
  toCanonicalJson,
  sha256,
  createCanonicalHash,
};
