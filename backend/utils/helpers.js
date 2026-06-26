/**
 * Create a standardized API error that can be caught by the central error handler.
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error}
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Wrap async route handlers to catch errors without try/catch boilerplate.
 * Usage: router.get('/route', asyncHandler(controller.method))
 * @param {Function} fn - Async express handler
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Add a given number of months to a date string (YYYY-MM-DD)
 * @param {string} dateStr - Base date
 * @param {number} months - Number of months to add
 * @returns {string} - Result date as YYYY-MM-DD
 */
const addMonthsToDate = (dateStr, months) => {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

/**
 * Get the difference in months between two dates
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {number} - Difference in months
 */
const diffInMonths = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
};

/**
 * Send a standardized JSON success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {any} data - Payload data
 */
const sendSuccess = (res, statusCode = 200, message = 'تمت العملية بنجاح.', data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

module.exports = {
  createError,
  asyncHandler,
  addMonthsToDate,
  diffInMonths,
  sendSuccess,
};
