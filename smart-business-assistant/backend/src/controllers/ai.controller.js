const aiService = require('../services/ai.service');
const { sendResponse } = require('../utils/response');

const chat = async (req, res) => {
    try {
        const { messages, context } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return sendResponse(res, 400, false, null, 'Messages array is required');
        }

        const result = await aiService.chatWithAI(messages, context || {});
        sendResponse(res, 200, true, result);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, null, 'AI Service Error');
    }
};

module.exports = { chat };
