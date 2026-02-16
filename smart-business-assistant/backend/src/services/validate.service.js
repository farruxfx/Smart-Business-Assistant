const validateTransaction = (data) => {
    const errors = [];
    if (!data.amount || isNaN(data.amount)) errors.push('Valid amount is required');
    if (!data.type || !['income', 'expense'].includes(data.type)) errors.push('Type must be income or expense');
    if (!data.category) errors.push('Category is required');
    return errors;
};

const validateCustomer = (data) => {
    const errors = [];
    if (!data.name) errors.push('Name is required');
    if (!data.phone) errors.push('Phone is required');
    return errors;
};

const validateDebt = (data) => {
    const errors = [];
    if (!data.customerName) errors.push('Customer name is required');
    if (!data.amount || isNaN(data.amount)) errors.push('Valid amount is required');
    if (!data.dueDate) errors.push('Due date is required');
    return errors;
};

module.exports = {
    validateTransaction,
    validateCustomer,
    validateDebt
};
