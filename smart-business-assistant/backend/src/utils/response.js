/**
 * Standard API response format
 * @param {Response} res Express response object
 * @param {number} status HTTP status code
 * @param {boolean} success Success flag
 * @param {any} data Response data
 * @param {string} message Optional message
 */
const sendResponse = (res, status, success, data = null, message = '') => {
    res.status(status).json({
        success,
        data,
        message,
        timestamp: new Date().toISOString()
    });
};

module.exports = { sendResponse };
