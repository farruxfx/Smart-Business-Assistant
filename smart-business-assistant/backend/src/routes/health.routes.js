const express = require('express');
const router = express.Router();
const { sendResponse } = require('../utils/response');

router.get('/', (req, res) => {
    sendResponse(res, 200, true, {
        uptime: process.uptime(),
        timestamp: Date.now()
    }, 'Server is healthy');
});

module.exports = router;
