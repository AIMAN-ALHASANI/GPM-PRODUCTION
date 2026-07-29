/**
 * GPM Number Formatting Utility
 * Centralised helper — always renders WESTERN (ASCII) digits: 1234, not ١٢٣٤
 * Do NOT use toLocaleString('ar-SA') or 'ar-EG' for display — they produce Arabic-Indic digits.
 */

/**
 * Format any number with comma-separated thousands using western digits.
 * @param {number|string|null|undefined} value
 * @param {number} decimals  – number of decimal places (default 0)
 * @returns {string}  e.g. 12,345
 */
export const formatNumber = (value, decimals = 0) => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value ?? '');
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a date string/Date object using western digits and Arabic month names.
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d)) return String(date);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  // Use ar-EG for Arabic month names but then replace Arabic-Indic digits with western ones
  const formatted = d.toLocaleDateString('ar-EG', defaultOptions);
  return toWesternDigits(formatted);
};

/**
 * Format a full date-time string using western digits.
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date, options = {}) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d)) return String(date);
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  const formatted = d.toLocaleString('ar-EG', defaultOptions);
  return toWesternDigits(formatted);
};

/**
 * Replace any Arabic-Indic or Extended Arabic-Indic digits with western digits (0-9).
 * Covers: ٠١٢٣٤٥٦٧٨٩  and  ۰۱۲۳۴۵۶۷۸۹
 * @param {string} str
 * @returns {string}
 */
export const toWesternDigits = (str) => {
  if (!str) return '';
  return String(str)
    // Arabic-Indic (U+0660–U+0669)
    .replace(/[\u0660-\u0669]/g, (c) => c.charCodeAt(0) - 0x0660)
    // Extended Arabic-Indic (U+06F0–U+06F9)
    .replace(/[\u06F0-\u06F9]/g, (c) => c.charCodeAt(0) - 0x06F0);
};

export default formatNumber;
