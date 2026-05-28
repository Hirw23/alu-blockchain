import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

/**
 * Generates a new random UUID v4.
 * @returns {string} UUID v4
 */
export const generateUUID = () => {
  return uuidv4();
};

/**
 * Validates if a string is a valid UUID.
 * @param {string} uuid - UUID string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidUUID = (uuid) => {
  return uuidValidate(uuid);
};

export default {
  generateUUID,
  isValidUUID,
};
