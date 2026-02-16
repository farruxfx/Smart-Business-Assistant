const express = require('express');
const router = express.Router();
const dataController = require('../controllers/data.controller');

// Data
router.get('/data', dataController.getData);

// Transactions
router.post('/transactions', dataController.createTransaction);
router.patch('/transactions/:id', dataController.updateTransaction);
router.delete('/transactions/:id', dataController.deleteTransaction);

// Customers
router.post('/customers', dataController.createCustomer);
router.patch('/customers/:id', dataController.updateCustomer);
router.delete('/customers/:id', dataController.deleteCustomer);

// Debts
router.post('/debts', dataController.createDebt);
router.patch('/debts/:id', dataController.updateDebt);
router.post('/debts/:id/pay', dataController.payDebt);
router.delete('/debts/:id', dataController.deleteDebt);

module.exports = router;
