/**
 * Formats a date to ISO string.
 * @param {Date|string|number} [date=new Date()] - Date input
 * @returns {string} ISO Date String
 */
export const toISOString = (date = new Date()) => {
  return new Date(date).toISOString();
};

/**
 * Returns timestamp in seconds.
 * @param {Date|string|number} [date=new Date()] - Date input
 * @returns {number} Epoch timestamp in seconds
 */
export const getEpochSeconds = (date = new Date()) => {
  return Math.floor(new Date(date).getTime() / 1000);
};

export default {
  toISOString,
  getEpochSeconds,
};
