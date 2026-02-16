/**
 * Formats a date to ISO string (YYYY-MM-DD)
 * @param {Date|string|number} date Date object or value
 * @returns {string} ISO date string
 */
const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

/**
 * Gets start and end of day for a date
 * @param {string} dateStr ISO date string
 * @returns {object} { start, end } Date objects
 */
const getDayRange = (dateStr) => {
    const start = new Date(dateStr);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateStr);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

module.exports = { formatDate, getDayRange };
