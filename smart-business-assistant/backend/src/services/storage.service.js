const fs = require('fs').promises;
const path = require('path');
const { generateId } = require('../utils/id');

const DB_PATH = path.join(__dirname, '../../data/db.json');

// Initialize DB if not exists
const initDB = async () => {
    try {
        await fs.access(DB_PATH);
    } catch (error) {
        const initialData = {
            transactions: [],
            customers: [],
            debts: [],
            metrics: {
                totalRevenue: 0,
                totalExpenses: 0,
                netIncome: 0
            }
        };
        await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
    }
};

const readData = async () => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        await initDB();
        return await readData();
    }
};

const writeData = async (data) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};

const getItems = async (collection) => {
    const data = await readData();
    return data[collection] || [];
};

const addItem = async (collection, item) => {
    const data = await readData();
    if (!data[collection]) data[collection] = [];

    const newItem = { id: generateId(), createdAt: new Date().toISOString(), ...item };
    data[collection].push(newItem);

    // Update metrics if transaction
    if (collection === 'transactions') {
        updateMetrics(data);
    }

    await writeData(data);
    return newItem;
};

const updateItem = async (collection, id, updates) => {
    const data = await readData();
    if (!data[collection]) return null;

    const index = data[collection].findIndex(item => item.id === id);
    if (index === -1) return null;

    data[collection][index] = { ...data[collection][index], ...updates, updatedAt: new Date().toISOString() };

    if (collection === 'transactions') {
        updateMetrics(data);
    }

    await writeData(data);
    return data[collection][index];
};

const deleteItem = async (collection, id) => {
    const data = await readData();
    if (!data[collection]) return false;

    const initialLength = data[collection].length;
    data[collection] = data[collection].filter(item => item.id !== id);

    if (data[collection].length !== initialLength) {
        if (collection === 'transactions') {
            updateMetrics(data);
        }
        await writeData(data);
        return true;
    }
    return false;
};

const updateMetrics = (data) => {
    const transactions = data.transactions || [];
    const revenue = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    data.metrics = {
        totalRevenue: revenue,
        totalExpenses: expenses,
        netIncome: revenue - expenses
    };
};

module.exports = {
    initDB,
    readData,
    writeData,
    getItems,
    addItem,
    updateItem,
    deleteItem
};
