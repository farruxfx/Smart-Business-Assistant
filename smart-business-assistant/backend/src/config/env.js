require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5050,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AI_MODE: process.env.AI_MODE || 'auto' // auto, simulated, openai
};
