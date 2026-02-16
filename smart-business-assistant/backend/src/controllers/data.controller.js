const storage = require('../services/storage.service');
const validate = require('../services/validate.service');
const { sendResponse } = require('../utils/response');

// Generic error handler wrapper
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        console.error(err);
        sendResponse(res, 500, false, null, 'Server Error');
    });
};

const getData = catchAsync(async (req, res) => {
    const data = await storage.readData();
    sendResponse(res, 200, true, data);
});

// Transactions
const createTransaction = catchAsync(async (req, res) => {
    const errors = validate.validateTransaction(req.body);
    if (errors.length > 0) return sendResponse(res, 400, false, errors, 'Validation Error');

    const transaction = await storage.addItem('transactions', req.body);
    sendResponse(res, 201, true, transaction, 'Transaction created');
});

const updateTransaction = catchAsync(async (req, res) => {
    const updated = await storage.updateItem('transactions', req.params.id, req.body);
    if (!updated) return sendResponse(res, 404, false, null, 'Transaction not found');
    sendResponse(res, 200, true, updated, 'Transaction updated');
});

const deleteTransaction = catchAsync(async (req, res) => {
    const deleted = await storage.deleteItem('transactions', req.params.id);
    if (!deleted) return sendResponse(res, 404, false, null, 'Transaction not found');
    sendResponse(res, 200, true, null, 'Transaction deleted');
});

// Customers
const createCustomer = catchAsync(async (req, res) => {
    const errors = validate.validateCustomer(req.body);
    if (errors.length > 0) return sendResponse(res, 400, false, errors, 'Validation Error');

    const customer = await storage.addItem('customers', req.body);
    sendResponse(res, 201, true, customer, 'Customer created');
});

const updateCustomer = catchAsync(async (req, res) => {
    const updated = await storage.updateItem('customers', req.params.id, req.body);
    if (!updated) return sendResponse(res, 404, false, null, 'Customer not found');
    sendResponse(res, 200, true, updated, 'Customer updated');
});

const deleteCustomer = catchAsync(async (req, res) => {
    const deleted = await storage.deleteItem('customers', req.params.id);
    if (!deleted) return sendResponse(res, 404, false, null, 'Customer not found');
    sendResponse(res, 200, true, null, 'Customer deleted');
});

// Debts
const createDebt = catchAsync(async (req, res) => {
    const errors = validate.validateDebt(req.body);
    if (errors.length > 0) return sendResponse(res, 400, false, errors, 'Validation Error');

    // Auto-calculate status
    const debt = { ...req.body, status: 'unpaid', paidAmount: 0 };
    const result = await storage.addItem('debts', debt);
    sendResponse(res, 201, true, result, 'Debt created');
});

const updateDebt = catchAsync(async (req, res) => {
    const updated = await storage.updateItem('debts', req.params.id, req.body);
    if (!updated) return sendResponse(res, 404, false, null, 'Debt not found');
    sendResponse(res, 200, true, updated, 'Debt updated');
});

const payDebt = catchAsync(async (req, res) => {
    const { amount } = req.body;
    const debt = (await storage.getItems('debts')).find(d => d.id === req.params.id);
    if (!debt) return sendResponse(res, 404, false, null, 'Debt not found');

    const newPaidAmount = (debt.paidAmount || 0) + Number(amount);
    const updates = {
        paidAmount: newPaidAmount,
        status: newPaidAmount >= debt.amount ? 'paid' : 'partial'
    };

    const updated = await storage.updateItem('debts', req.params.id, updates);

    // Also record as income transaction if requested? Prompt implied just payment tracking.
    // Let's create an income transaction for this debt payment automatically for better accounting
    await storage.addItem('transactions', {
        amount: Number(amount),
        type: 'income',
        category: 'Debt Repayment',
        description: `Payment for debt: ${debt.description || 'Debt'} (${debt.customerName})`,
        date: new Date().toISOString()
    });

    sendResponse(res, 200, true, updated, 'Payment recorded');
});

const deleteDebt = catchAsync(async (req, res) => {
    const deleted = await storage.deleteItem('debts', req.params.id);
    if (!deleted) return sendResponse(res, 404, false, null, 'Debt not found');
    sendResponse(res, 200, true, null, 'Debt deleted');
});

module.exports = {
    getData,
    createTransaction, updateTransaction, deleteTransaction,
    createCustomer, updateCustomer, deleteCustomer,
    createDebt, updateDebt, payDebt, deleteDebt
};
