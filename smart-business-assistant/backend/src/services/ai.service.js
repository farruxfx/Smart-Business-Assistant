const config = require('../config/env');

const SIMULATED_RESPONSES = [
    "Based on your recent data, your revenue is growing steadily. Consider increasing marketing spend.",
    "Cash flow looks positive this month. Good job keeping expenses low.",
    "You have a few overdue debts. I recommend sending a friendly reminder to your customers.",
    "Your top expense category is 'Inventory'. You might want to negotiate better rates with suppliers.",
    "Profit margin is currently at 20%. Industry average is 15%, so you are doing well!"
];

const generateSimulatedResponse = (context) => {
    // Simple logic to pick a response based on context if possible, otherwise random
    const { metrics } = context;
    if (metrics && metrics.netIncome < 0) {
        return "Your net income is currently negative. Review your recent expenses to find areas for cost cutting.";
    }
    return SIMULATED_RESPONSES[Math.floor(Math.random() * SIMULATED_RESPONSES.length)];
};

const chatWithAI = async (messages, context) => {
    const mode = config.AI_MODE;
    const apiKey = config.OPENAI_API_KEY;

    if (mode === 'simulated' || !apiKey) {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            reply: generateSimulatedResponse(context),
            mode: 'simulated'
        };
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are a helpful business assistant for a small business. 
                        Context: ${JSON.stringify(context)}. 
                        Keep answers concise and practical.`
                    },
                    ...messages
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("OpenAI Error:", data.error);
            throw new Error(data.error.message);
        }

        return {
            reply: data.choices[0].message.content,
            mode: 'openai'
        };

    } catch (error) {
        console.error("AI Service Error:", error);
        return {
            reply: "I'm having trouble connecting to the AI brain right now. " + generateSimulatedResponse(context),
            mode: 'fallback-simulated'
        };
    }
};

module.exports = { chatWithAI };
