const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config/env');
const { initDB } = require('./src/services/storage.service');

// Routes
const healthRoutes = require('./src/routes/health.routes');
const dataRoutes = require('./src/routes/data.routes');
const aiRoutes = require('./src/routes/ai.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api', dataRoutes);
app.use('/api/ai', aiRoutes);

// Static files (Frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Server
const startServer = async () => {
    await initDB();
    app.listen(config.PORT, () => {
        console.log(`Smart Business Assistant running on http://localhost:${config.PORT}`);
    });
};

startServer();
