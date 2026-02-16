/**
 * Smart Business Assistant - Main Application Logic
 * Architecture: SPA with persistent state and local storage fallback
 */

const API_BASE = '/api';

// --- State Management ---
const store = {
    transactions: [],
    customers: [],
    debts: [],
    metrics: {
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0
    },
    user: {
        businessName: 'My Business',
        currency: 'UZS'
    },
    isOffline: false
};

// --- API Client ---
const api = {
    async request(endpoint, method = 'GET', body = null) {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (body) options.body = JSON.stringify(body);

            const res = await fetch(`${API_BASE}${endpoint}`, options);
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);

            const data = await res.json();
            return data;
        } catch (error) {
            console.error(error);
            setOfflineMode(true);
            return null; // Handle offline gracefully in components
        }
    },

    get: (url) => api.request(url),
    post: (url, data) => api.request(url, 'POST', data),
    patch: (url, data) => api.request(url, 'PATCH', data),
    delete: (url) => api.request(url, 'DELETE')
};

// --- Initialization ---
async function initApp() {
    setupNavigation();
    setupMobileNav();

    // Initial Data Load
    await loadData();

    // Default View
    navigateTo('dashboard');
}

async function loadData() {
    const res = await api.get('/data');
    if (res && res.success) {
        store.transactions = res.data.transactions;
        store.customers = res.data.customers;
        store.debts = res.data.debts;
        store.metrics = res.data.metrics;
        setOfflineMode(false);
    } else {
        // Simple offline fallback (mock or localstorage could go here)
        setOfflineMode(true);
    }
}

function setOfflineMode(isOffline) {
    store.isOffline = isOffline;
    const badge = document.getElementById('offline-badge');
    if (badge) badge.style.display = isOffline ? 'block' : 'none';
}

// --- Navigation ---
function navigateTo(viewName) {
    // Update active nav state
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.view === viewName);
    });

    // Update Page Title
    const titles = {
        'dashboard': 'Dashboard',
        'accounting': 'Accounting',
        'customers': 'Customers',
        'debts': 'Debts (Qarz daftar)',
        'ai-chat': 'AI Assistant',
        'settings': 'Settings'
    };
    document.getElementById('page-title').innerText = titles[viewName];

    // Render View
    const container = document.getElementById('view-container');
    container.innerHTML = ''; // Clear current view

    switch (viewName) {
        case 'dashboard': renderDashboard(container); break;
        case 'accounting': renderAccounting(container); break;
        case 'customers': renderCustomers(container); break;
        case 'debts': renderDebts(container); break;
        case 'ai-chat': renderAIChat(container); break;
        case 'settings': renderSettings(container); break;
    }
}

function setupNavigation() {
    document.querySelectorAll('.sidebar .nav-item').forEach(el => {
        el.addEventListener('click', () => navigateTo(el.dataset.view));
    });
}

function setupMobileNav() {
    document.querySelectorAll('.mobile-nav .nav-item').forEach(el => {
        if (el.dataset.view) {
            el.addEventListener('click', () => navigateTo(el.dataset.view));
        }
    });
}


// --- Views ---

// 1. Dashboard
function renderDashboard(container) {
    const { totalRevenue, totalExpenses, netIncome } = store.metrics;

    const html = `
        <div class="stats-grid">
            <div class="card stat-card">
                <h3>Total Revenue</h3>
                <div class="value text-success">+${formatCurrency(totalRevenue)}</div>
            </div>
            <div class="card stat-card">
                <h3>Total Expenses</h3>
                <div class="value text-danger">-${formatCurrency(totalExpenses)}</div>
            </div>
            <div class="card stat-card">
                <h3>Net Income</h3>
                 <div class="value" style="color: ${netIncome >= 0 ? 'var(--success)' : 'var(--danger)'}">
                    ${formatCurrency(netIncome)}
                </div>
            </div>
        </div>
        
        <div class="card" style="height: 300px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
            [Simulated Revenue Chart Canvas would go here]
            <br>
            (Implement strict canvas drawing in next version)
        </div>
        
        <div class="card" style="margin-top: 1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <h3>Recent Activity</h3>
            </div>
            <div class="list-group">
                ${store.transactions.slice(-5).reverse().map(t => `
                    <div class="list-item">
                        <div>
                            <div style="font-weight:500;">${t.category}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted);">${formatDate(t.createdAt)}</div>
                        </div>
                        <div class="${t.type === 'income' ? 'text-success' : 'text-danger'}" style="font-weight:600;">
                            ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                        </div>
                    </div>
                `).join('') || '<div style="text-align:center; padding:1rem; color:var(--text-muted)">No activity yet</div>'}
            </div>
        </div>
    `;
    container.innerHTML = html;
}

// 2. Accounting
function renderAccounting(container) {
    const html = `
        <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;">
            <button class="btn btn-primary" onclick="showAddTransactionModal()">+ New Transaction</button>
        </div>
        
        <div class="card">
             <div class="list-group">
                ${store.transactions.slice().reverse().map(t => `
                    <div class="list-item">
                        <div style="display:flex; gap:1rem; align-items:center;">
                            <div style="width:40px; height:40px; border-radius:50%; background:${t.type === 'income' ? '#dcfce7' : '#fee2e2'}; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                                ${t.type === 'income' ? '💰' : '💸'}
                            </div>
                            <div>
                                <div style="font-weight:500;">${t.category}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">
                                    ${t.description || 'No description'} • ${formatDate(t.createdAt)}
                                </div>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <div class="${t.type === 'income' ? 'text-success' : 'text-danger'}" style="font-weight:600; font-size:1.1rem;">
                                ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                            </div>
                            <button class="btn btn-ghost" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="deleteTransaction('${t.id}')">Delete</button>
                        </div>
                    </div>
                `).join('') || '<div style="padding:2rem; text-align:center; color:var(--text-muted);">No transactions found</div>'}
            </div>
        </div>
    `;
    container.innerHTML = html;
}

// 3. Customers
function renderCustomers(container) {
    const html = `
        <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;">
            <button class="btn btn-primary" onclick="showAddCustomerModal()">+ Add Customer</button>
        </div>
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
            ${store.customers.map(c => `
                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.5rem;">
                        <h3 style="font-size:1.1rem; color:var(--text-main); font-weight:600;">${c.name}</h3>
                        <button class="btn btn-ghost" onclick="deleteCustomer('${c.id}')">×</button>
                    </div>
                    <div style="color:var(--text-muted); font-size:0.9rem; margin-bottom:0.2rem;">📞 ${c.phone}</div>
                    ${c.email ? `<div style="color:var(--text-muted); font-size:0.9rem;">✉️ ${c.email}</div>` : ''}
                    <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border); display:flex; gap:0.5rem;">
                         <button class="btn btn-ghost" style="font-size:0.8rem; flex:1;">History</button>
                         <button class="btn btn-ghost" style="font-size:0.8rem; flex:1;">SMS</button>
                    </div>
                </div>
            `).join('') || '<div style="grid-column: 1/-1; text-align:center; padding:2rem; color:var(--text-muted);">No customers yet</div>'}
        </div>
    `;
    container.innerHTML = html;
}

// 4. Debts
function renderDebts(container) {
    const html = `
        <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;">
            <button class="btn btn-primary" onclick="showAddDebtModal()">+ Record Debt</button>
        </div>
        <div class="card">
            <div class="list-group">
                 ${store.debts.map(d => {
        const isPaid = d.status === 'paid';
        return `
                     <div class="list-item" style="opacity: ${isPaid ? 0.6 : 1}">
                        <div>
                             <div style="font-weight:600;">${d.customerName}</div>
                             <div style="font-size:0.8rem; color:var(--text-muted);">Due: ${d.dueDate}</div>
                             ${isPaid ? '<span class="status-badge" style="background:var(--success);">PAID</span>' : ''}
                        </div>
                        <div style="text-align:right;">
                            <div style="font-weight:700; font-size:1.1rem; color:var(--danger);">${formatCurrency(d.amount - (d.paidAmount || 0))}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted);">of ${formatCurrency(d.amount)}</div>
                            ${!isPaid ? `<button class="btn btn-primary" style="margin-top:0.5rem; padding:0.25rem 0.5rem; font-size:0.8rem;" onclick="showPayDebtModal('${d.id}')">Mark Paid</button>` : ''}
                        </div>
                    </div>
                 `}).join('') || '<div style="padding:2rem; text-align:center; color:var(--text-muted);">No debts recorded</div>'}
            </div>
        </div>
    `;
    container.innerHTML = html;
}

// 5. AI Chat
function renderAIChat(container) {
    container.innerHTML = `
        <div class="chat-container">
            <div id="chat-messages" class="chat-messages">
                <div class="message assistant">
                    Hello! I'm your smart business assistant. Ask me about your revenue, profit, or for business advice.
                </div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" class="form-control" placeholder="Ask something..." onkeypress="if(event.key==='Enter') sendChatMessage()">
                <button class="btn btn-primary" onclick="sendChatMessage()">Send</button>
            </div>
        </div>
    `;
}

// 6. Settings
function renderSettings(container) {
    container.innerHTML = `
        <div class="card">
            <h3>AppSettings</h3>
            <div class="form-group" style="margin-top:1rem;">
                <label class="form-label">Business Name</label>
                <input type="text" class="form-control" value="${store.user.businessName}" onchange="store.user.businessName = this.value">
            </div>
            <div class="form-group">
                <label class="form-label">Currency</label>
                <select class="form-control" onchange="store.user.currency = this.value; navigateTo('settings')">
                     <option value="UZS" ${store.user.currency === 'UZS' ? 'selected' : ''}>UZS (Uzbek Soum)</option>
                     <option value="USD" ${store.user.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                </select>
            </div>
            <div style="margin-top:2rem;">
                <p style="color:var(--text-muted); font-size:0.9rem;">Version: 1.0.0 (MVP)</p>
            </div>
        </div>
    `;
}


// --- Actions & Modals ---

function showModal(content) {
    const overlay = document.getElementById('modal-container');
    const contentBox = overlay.querySelector('.modal-content');
    contentBox.innerHTML = content;
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('open'), 10);

    // Close on click outside
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
    };
}

function closeModal() {
    const overlay = document.getElementById('modal-container');
    overlay.classList.remove('open');
    setTimeout(() => overlay.classList.add('hidden'), 200);
}

// Transaction Actions
window.showAddTransactionModal = () => {
    showModal(`
        <h3>New Transaction</h3>
        <div class="form-group">
            <label class="form-label">Type</label>
            <select id="t-type" class="form-control">
                <option value="income">Income (Kirish)</option>
                <option value="expense">Expense (Chiqish)</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Amount</label>
            <input type="number" id="t-amount" class="form-control" placeholder="0">
        </div>
        <div class="form-group">
            <label class="form-label">Category</label>
            <input type="text" id="t-category" class="form-control" placeholder="e.g. Sales, Rent">
        </div>
         <div class="form-group">
            <label class="form-label">Description (Optional)</label>
            <input type="text" id="t-desc" class="form-control" placeholder="Notes">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:1.5rem;">
            <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitTransaction()">Save</button>
        </div>
    `);
};

window.submitTransaction = async () => {
    const type = document.getElementById('t-type').value;
    const amount = Number(document.getElementById('t-amount').value);
    const category = document.getElementById('t-category').value;
    const description = document.getElementById('t-desc').value;

    if (!amount || !category) return showToast('Please fill required fields', 'error');

    const res = await api.post('/transactions', { type, amount, category, description });
    if (res && res.success) {
        showToast('Transaction saved');
        closeModal();
        await loadData();
        navigateTo('accounting');
    } else {
        showToast(res?.message || 'Error saving transaction', 'error');
    }
};

window.deleteTransaction = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    const res = await api.delete(`/transactions/${id}`);
    if (res && res.success) {
        showToast('Deleted');
        await loadData();
        navigateTo('accounting');
    }
};

// Customer Actions
window.showAddCustomerModal = () => {
    showModal(`
        <h3>New Customer</h3>
        <div class="form-group">
            <label class="form-label">Name</label>
            <input type="text" id="c-name" class="form-control">
        </div>
        <div class="form-group">
            <label class="form-label">Phone</label>
            <input type="tel" id="c-phone" class="form-control" placeholder="+998...">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:1.5rem;">
            <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitCustomer()">Save</button>
        </div>
    `);
};

window.submitCustomer = async () => {
    const name = document.getElementById('c-name').value;
    const phone = document.getElementById('c-phone').value;

    if (!name || !phone) return showToast('Name and Phone required', 'error');

    const res = await api.post('/customers', { name, phone });
    if (res && res.success) {
        showToast('Customer saved');
        closeModal();
        await loadData();
        navigateTo('customers');
    }
};

window.deleteCustomer = async (id) => {
    if (!confirm('Delete customer?')) return;
    const res = await api.delete(`/customers/${id}`);
    if (res && res.success) {
        await loadData();
        navigateTo('customers');
    }
};

// Debt Actions
window.showAddDebtModal = () => {
    showModal(`
        <h3>Record Debt</h3>
        <div class="form-group">
            <label class="form-label">Customer Name</label>
            <input type="text" id="d-name" class="form-control" list="customer-list">
            <datalist id="customer-list">
                ${store.customers.map(c => `<option value="${c.name}">`).join('')}
            </datalist>
        </div>
         <div class="form-group">
            <label class="form-label">Amount</label>
            <input type="number" id="d-amount" class="form-control">
        </div>
        <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" id="d-date" class="form-control">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:1.5rem;">
            <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitDebt()">Save</button>
        </div>
    `);
};

window.submitDebt = async () => {
    const customerName = document.getElementById('d-name').value;
    const amount = Number(document.getElementById('d-amount').value);
    const dueDate = document.getElementById('d-date').value;

    if (!customerName || !amount || !dueDate) return showToast('All fields required', 'error');

    const res = await api.post('/debts', { customerName, amount, dueDate, description: 'Product purchase debt' });
    if (res && res.success) {
        showToast('Debt recorded');
        closeModal();
        await loadData();
        navigateTo('debts');
    }
};

window.showPayDebtModal = (id) => {
    showModal(`
        <h3>Pay Debt</h3>
        <p>How much is being paid?</p>
        <div class="form-group">
            <label class="form-label">Amount</label>
            <input type="number" id="p-amount" class="form-control">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:1.5rem;">
            <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitPayment('${id}')">Record Payment</button>
        </div>
    `);
};

window.submitPayment = async (id) => {
    const amount = Number(document.getElementById('p-amount').value);
    if (!amount) return;

    const res = await api.post(`/debts/${id}/pay`, { amount });
    if (res && res.success) {
        showToast('Payment recorded');
        closeModal();
        await loadData();
        navigateTo('debts');
    }
};


// AI Chat Functionality
window.sendChatMessage = async () => {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    const messagesDiv = document.getElementById('chat-messages');

    // Add User Message
    messagesDiv.innerHTML += `
        <div class="message user">${message}</div>
    `;
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Loading state
    const loadingId = 'loading-' + Date.now();
    messagesDiv.innerHTML += `<div id="${loadingId}" class="message assistant">Thinking...</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Call API
    try {
        const res = await api.post('/ai/chat', {
            messages: [{ role: 'user', content: message }],
            context: { metrics: store.metrics, businessName: store.user.businessName }
        });

        document.getElementById(loadingId).remove();

        if (res && res.success) {
            messagesDiv.innerHTML += `
                <div class="message assistant">${res.data.reply}</div>
            `;
        } else {
            messagesDiv.innerHTML += `
                <div class="message assistant" style="color:red">Error reaching AI.</div>
            `;
        }
    } catch (e) {
        document.getElementById(loadingId).innerText = "Error.";
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};


// --- Utils ---
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: store.user.currency }).format(amount);
}

function formatDate(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString();
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        background: ${type === 'error' ? '#fee2e2' : '#dcfce7'};
        color: ${type === 'error' ? '#ef4444' : '#10b981'};
        padding: 0.75rem 1.5rem;
        border-radius: 99px;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-weight: 600;
        animation: slideUp 0.3s ease;
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 200;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Start
initApp();
