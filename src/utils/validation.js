// Validation helpers for TestMakerApp
/**
 * @param {string} text
 * @returns {boolean}
 */
export function isNonEmpty(text) {
  return typeof text === 'string' && text.trim().length > 0;
}
