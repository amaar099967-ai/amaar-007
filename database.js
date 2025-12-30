// database.js - Professional Version (Updated)
class ProfessionalDatabase {
    constructor() {
        this.dbName = 'ProfessionalAccountingDB';
        this.version = 2; // Updated version for new features
        this.init();
    }
    
    async init() {
        if (!window.indexedDB) {
            console.log("IndexedDB not supported, using localStorage");
            return this.initLocalStorage();
        }
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => {
                console.log("IndexedDB failed, falling back to localStorage");
                this.initLocalStorage();
                resolve();
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("Professional database initialized");
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const oldVersion = event.oldVersion;
                
                // Create or update stores
                this.createStores(db, oldVersion);
            };
        });
    }
    
    createStores(db, oldVersion) {
        // Create users store
        if (!db.objectStoreNames.contains('users')) {
            const userStore = db.createObjectStore('users', { keyPath: 'id' });
            userStore.createIndex('username', 'username', { unique: true });
            
            // Add professional users
            const transaction = event.target.transaction;
            const store = transaction.objectStore('users');
            
            const professionalUsers = [
                { 
                    id: 1, 
                    username: 'admin', 
                    password: 'admin123', 
                    type: 'admin',
                    fullName: 'مدير النظام',
                    email: 'admin@electric.com',
                    phone: '+9647701234567',
                    role: 'مدير عام',
                    permissions: ['all'],
                    createdAt: new Date().toISOString()
                },
                { 
                    id: 2, 
                    username: 'accountant', 
                    password: 'account123', 
                    type: 'accountant',
                    fullName: 'محاسب رئيسي',
                    email: 'accountant@electric.com',
                    phone: '+9647701234568',
                    role: 'محاسب',
                    permissions: ['invoices', 'reports', 'clients'],
                    createdAt: new Date().toISOString()
                },
                { 
                    id: 3, 
                    username: 'user', 
                    password: 'user123', 
                    type: 'user',
                    fullName: 'مستخدم عادي',
                    email: 'user@electric.com',
                    role: 'مستخدم',
                    permissions: ['view'],
                    createdAt: new Date().toISOString()
                }
            ];
            
            professionalUsers.forEach(user => store.add(user));
        }
        
        // Create projects store with more fields
        if (!db.objectStoreNames.contains('projects')) {
            const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
            projectStore.createIndex('status', 'status');
            projectStore.createIndex('clientId', 'clientId');
        }
        
        // Create items store
        if (!db.objectStoreNames.contains('items')) {
            db.createObjectStore('items', { keyPath: 'id' });
        }
        
        // Create invoices store
        if (!db.objectStoreNames.contains('invoices')) {
            const invoiceStore = db.createObjectStore('invoices', { keyPath: 'id' });
            invoiceStore.createIndex('status', 'status');
            invoiceStore.createIndex('clientId', 'clientId');
            invoiceStore.createIndex('dueDate', 'dueDate');
        }
        
        // Create clients store
        if (!db.objectStoreNames.contains('clients')) {
            const clientStore = db.createObjectStore('clients', { keyPath: 'id' });
            clientStore.createIndex('type', 'type');
            clientStore.createIndex('status', 'status');
        }
        
        // Create payments store
        if (!db.objectStoreNames.contains('payments')) {
            const paymentStore = db.createObjectStore('payments', { keyPath: 'id' });
            paymentStore.createIndex('invoiceId', 'invoiceId');
            paymentStore.createIndex('date', 'date');
        }
        
        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
        }
    }
    
    initLocalStorage() {
        this.useLocalStorage = true;
        
        // Initialize professional data structure
        const defaultData = {
            users: [
                { 
                    id: 1, 
                    username: 'admin', 
                    password: 'admin123', 
                    type: 'admin',
                    fullName: 'مدير النظام',
                    email: 'admin@electric.com',
                    phone: '+9647701234567',
                    role: 'مدير عام'
                },
                { 
                    id: 2, 
                    username: 'accountant', 
                    password: 'account123', 
                    type: 'accountant',
                    fullName: 'محاسب رئيسي',
                    email: 'accountant@electric.com',
                    phone: '+9647701234568',
                    role: 'محاسب'
                }
            ],
            projects: [],
            items: [],
            invoices: [],
            clients: [],
            payments: [],
            settings: [
                { key: 'companyName', value: 'شركة الكهرباء المتقدمة' },
                { key: 'companyPhone', value: '+964770000000' },
                { key: 'companyEmail', value: 'info@electric.com' },
                { key: 'currency', value: 'IQD' },
                { key: 'taxRate', value: 0 },
                { key: 'invoicePrefix', value: 'INV-' },
                { key: 'theme', value: 'dark' }
            ]
        };
        
        // Initialize each store if not exists
        Object.keys(defaultData).forEach(store => {
            if (!localStorage.getItem(`professional_${store}`)) {
                localStorage.setItem(`professional_${store}`, JSON.stringify(defaultData[store]));
            }
        });
    }
    
    // Professional User Methods
    async getUser(username, password) {
        if (this.useLocalStorage) {
            const users = JSON.parse(localStorage.getItem('professional_users') || '[]');
            const user = users.find(u => u.username === username && u.password === password);
            
            // Add last login timestamp
            if (user) {
                user.lastLogin = new Date().toISOString();
                this.updateUser(user);
            }
            
            return user;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const user = request.result.find(u => 
                    u.username === username && u.password === password
                );
                
                if (user) {
                    // Update last login
                    const updateTransaction = this.db.transaction(['users'], 'readwrite');
                    const updateStore = updateTransaction.objectStore('users');
                    user.lastLogin = new Date().toISOString();
                    updateStore.put(user);
                }
                
                resolve(user);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async updateUser(user) {
        if (this.useLocalStorage) {
            const users = JSON.parse(localStorage.getItem('professional_users') || '[]');
            const index = users.findIndex(u => u.id === user.id);
            if (index !== -1) {
                users[index] = user;
                localStorage.setItem('professional_users', JSON.stringify(users));
            }
            return;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.put(user);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    // Professional Project Methods
    async getProjects(filters = {}) {
        if (this.useLocalStorage) {
            let projects = JSON.parse(localStorage.getItem('professional_projects') || '[]');
            
            // Apply filters
            if (filters.status) {
                projects = projects.filter(p => p.status === filters.status);
            }
            if (filters.clientId) {
                projects = projects.filter(p => p.clientId === filters.clientId);
            }
            
            return projects;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readonly');
            const store = transaction.objectStore('projects');
            const request = store.getAll();
            
            request.onsuccess = () => {
                let projects = request.result;
                
                // Apply filters
                if (filters.status) {
                    projects = projects.filter(p => p.status === filters.status);
                }
                if (filters.clientId) {
                    projects = projects.filter(p => p.clientId === filters.clientId);
                }
                
                resolve(projects);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async addProject(project) {
        const newProject = {
            ...project,
            id: Date.now(),
            projectNumber: `PROJ-${Date.now().toString().slice(-6)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: project.status || 'active',
            progress: project.progress || 0
        };
        
        if (this.useLocalStorage) {
            const projects = JSON.parse(localStorage.getItem('professional_projects') || '[]');
            projects.push(newProject);
            localStorage.setItem('professional_projects', JSON.stringify(projects));
            return newProject.id;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readwrite');
            const store = transaction.objectStore('projects');
            const request = store.add(newProject);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // Invoice Methods
    async getInvoices(filters = {}) {
        if (this.useLocalStorage) {
            let invoices = JSON.parse(localStorage.getItem('professional_invoices') || '[]');
            
            // Apply filters
            if (filters.status) {
                invoices = invoices.filter(i => i.status === filters.status);
            }
            if (filters.clientId) {
                invoices = invoices.filter(i => i.clientId === filters.clientId);
            }
            
            return invoices;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['invoices'], 'readonly');
            const store = transaction.objectStore('invoices');
            const request = store.getAll();
            
            request.onsuccess = () => {
                let invoices = request.result;
                
                // Apply filters
                if (filters.status) {
                    invoices = invoices.filter(i => i.status === filters.status);
                }
                if (filters.clientId) {
                    invoices = invoices.filter(i => i.clientId === filters.clientId);
                }
                
                resolve(invoices);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async addInvoice(invoice) {
        const newInvoice = {
            ...invoice,
            id: Date.now(),
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            createdAt: new Date().toISOString(),
            issueDate: invoice.issueDate || new Date().toISOString(),
            dueDate: invoice.dueDate || this.addDays(new Date(), 30).toISOString(),
            status: invoice.status || 'pending',
            paidAmount: invoice.paidAmount || 0,
            balance: invoice.total - (invoice.paidAmount || 0)
        };
        
        if (this.useLocalStorage) {
            const invoices = JSON.parse(localStorage.getItem('professional_invoices') || '[]');
            invoices.push(newInvoice);
            localStorage.setItem('professional_invoices', JSON.stringify(invoices));
            return newInvoice.id;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['invoices'], 'readwrite');
            const store = transaction.objectStore('invoices');
            const request = store.add(newInvoice);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // Client Methods
    async getClients(filters = {}) {
        if (this.useLocalStorage) {
            let clients = JSON.parse(localStorage.getItem('professional_clients') || '[]');
            
            // Apply filters
            if (filters.type) {
                clients = clients.filter(c => c.type === filters.type);
            }
            if (filters.status) {
                clients = clients.filter(c => c.status === filters.status);
            }
            
            return clients;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['clients'], 'readonly');
            const store = transaction.objectStore('clients');
            const request = store.getAll();
            
            request.onsuccess = () => {
                let clients = request.result;
                
                // Apply filters
                if (filters.type) {
                    clients = clients.filter(c => c.type === filters.type);
                }
                if (filters.status) {
                    clients = clients.filter(c => c.status === filters.status);
                }
                
                resolve(clients);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async addClient(client) {
        const newClient = {
            ...client,
            id: Date.now(),
            clientNumber: `CLT-${Date.now().toString().slice(-6)}`,
            createdAt: new Date().toISOString(),
            status: client.status || 'active',
            totalInvoices: 0,
            totalPaid: 0,
            totalBalance: 0
        };
        
        if (this.useLocalStorage) {
            const clients = JSON.parse(localStorage.getItem('professional_clients') || '[]');
            clients.push(newClient);
            localStorage.setItem('professional_clients', JSON.stringify(clients));
            return newClient.id;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['clients'], 'readwrite');
            const store = transaction.objectStore('clients');
            const request = store.add(newClient);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // Payment Methods
    async getPayments(filters = {}) {
        if (this.useLocalStorage) {
            let payments = JSON.parse(localStorage.getItem('professional_payments') || '[]');
            
            // Apply filters
            if (filters.invoiceId) {
                payments = payments.filter(p => p.invoiceId === filters.invoiceId);
            }
            if (filters.dateFrom && filters.dateTo) {
                payments = payments.filter(p => {
                    const date = new Date(p.date);
                    return date >= new Date(filters.dateFrom) && date <= new Date(filters.dateTo);
                });
            }
            
            return payments;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['payments'], 'readonly');
            const store = transaction.objectStore('payments');
            const request = store.getAll();
            
            request.onsuccess = () => {
                let payments = request.result;
                
                // Apply filters
                if (filters.invoiceId) {
                    payments = payments.filter(p => p.invoiceId === filters.invoiceId);
                }
                if (filters.dateFrom && filters.dateTo) {
                    payments = payments.filter(p => {
                        const date = new Date(p.date);
                        return date >= new Date(filters.dateFrom) && date <= new Date(filters.dateTo);
                    });
                }
                
                resolve(payments);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async addPayment(payment) {
        const newPayment = {
            ...payment,
            id: Date.now(),
            paymentNumber: `PAY-${Date.now().toString().slice(-6)}`,
            date: payment.date || new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        if (this.useLocalStorage) {
            const payments = JSON.parse(localStorage.getItem('professional_payments') || '[]');
            payments.push(newPayment);
            localStorage.setItem('professional_payments', JSON.stringify(payments));
            
            // Update invoice balance
            await this.updateInvoiceBalance(payment.invoiceId, payment.amount);
            
            return newPayment.id;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['payments'], 'readwrite');
            const store = transaction.objectStore('payments');
            const request = store.add(newPayment);
            
            request.onsuccess = async () => {
                // Update invoice balance
                await this.updateInvoiceBalance(payment.invoiceId, payment.amount);
                resolve(request.result);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async updateInvoiceBalance(invoiceId, paymentAmount) {
        try {
            const invoice = await this.getInvoice(invoiceId);
            if (invoice) {
                invoice.paidAmount = (invoice.paidAmount || 0) + paymentAmount;
                invoice.balance = invoice.total - invoice.paidAmount;
                invoice.status = invoice.balance <= 0 ? 'paid' : 'partial';
                
                await this.updateInvoice(invoice);
            }
        } catch (error) {
            console.error('Error updating invoice balance:', error);
        }
    }
    
    async getInvoice(invoiceId) {
        if (this.useLocalStorage) {
            const invoices = JSON.parse(localStorage.getItem('professional_invoices') || '[]');
            return invoices.find(i => i.id === invoiceId);
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['invoices'], 'readonly');
            const store = transaction.objectStore('invoices');
            const request = store.get(invoiceId);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async updateInvoice(invoice) {
        if (this.useLocalStorage) {
            const invoices = JSON.parse(localStorage.getItem('professional_invoices') || '[]');
            const index = invoices.findIndex(i => i.id === invoice.id);
            if (index !== -1) {
                invoices[index] = invoice;
                localStorage.setItem('professional_invoices', JSON.stringify(invoices));
            }
            return;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['invoices'], 'readwrite');
            const store = transaction.objectStore('invoices');
            const request = store.put(invoice);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    // Settings Methods
    async getSetting(key) {
        if (this.useLocalStorage) {
            const settings = JSON.parse(localStorage.getItem('professional_settings') || '[]');
            const setting = settings.find(s => s.key === key);
            return setting ? setting.value : null;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result ? request.result.value : null);
            request.onerror = () => reject(request.error);
        });
    }
    
    async setSetting(key, value) {
        const setting = { key, value };
        
        if (this.useLocalStorage) {
            const settings = JSON.parse(localStorage.getItem('professional_settings') || '[]');
            const index = settings.findIndex(s => s.key === key);
            
            if (index !== -1) {
                settings[index] = setting;
            } else {
                settings.push(setting);
            }
            
            localStorage.setItem('professional_settings', JSON.stringify(settings));
            return;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put(setting);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    // Analytics and Reports
    async getFinancialReport(period = 'month') {
        const now = new Date();
        let dateFrom, dateTo;
        
        switch (period) {
            case 'month':
                dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
                dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                dateFrom = new Date(now.getFullYear(), quarter * 3, 1);
                dateTo = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
                break;
            case 'year':
                dateFrom = new Date(now.getFullYear(), 0, 1);
                dateTo = new Date(now.getFullYear(), 11, 31);
                break;
            default:
                dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
                dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
        
        try {
            const [invoices, payments] = await Promise.all([
                this.getInvoices(),
                this.getPayments({
                    dateFrom: dateFrom.toISOString(),
                    dateTo: dateTo.toISOString()
                })
            ]);
            
            // Calculate metrics
            const totalInvoices = invoices.length;
            const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
            const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
            const outstandingBalance = totalRevenue - totalPaid;
            
            // Calculate by status
            const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
            const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
            const overdueInvoices = invoices.filter(inv => {
                if (inv.status === 'pending' && inv.dueDate) {
                    return new Date(inv.dueDate) < new Date();
                }
                return false;
            }).length;
            
            return {
                period,
                dateFrom: dateFrom.toISOString(),
                dateTo: dateTo.toISOString(),
                metrics: {
                    totalInvoices,
                    totalRevenue,
                    totalPaid,
                    outstandingBalance,
                    paidInvoices,
                    pendingInvoices,
                    overdueInvoices,
                    collectionRate: totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0
                },
                summary: {
                    revenueByMonth: this.calculateRevenueByMonth(invoices),
                    topClients: this.calculateTopClients(invoices),
                    paymentMethods: this.calculatePaymentMethods(payments)
                }
            };
            
        } catch (error) {
            console.error('Error generating financial report:', error);
            throw error;
        }
    }
    
    calculateRevenueByMonth(invoices) {
        const revenueByMonth = {};
        
        invoices.forEach(invoice => {
            const date = new Date(invoice.issueDate || invoice.createdAt);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!revenueByMonth[monthYear]) {
                revenueByMonth[monthYear] = 0;
            }
            
            revenueByMonth[monthYear] += invoice.total || 0;
        });
        
        return revenueByMonth;
    }
    
    calculateTopClients(invoices) {
        const clientTotals = {};
        
        invoices.forEach(invoice => {
            if (invoice.clientId) {
                if (!clientTotals[invoice.clientId]) {
                    clientTotals[invoice.clientId] = {
                        clientId: invoice.clientId,
                        clientName: invoice.clientName || 'غير معروف',
                        total: 0
                    };
                }
                clientTotals[invoice.clientId].total += invoice.total || 0;
            }
        });
        
        return Object.values(clientTotals)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
    }
    
    calculatePaymentMethods(payments) {
        const methods = {};
        
        payments.forEach(payment => {
            const method = payment.method || 'نقدي';
            if (!methods[method]) {
                methods[method] = 0;
            }
            methods[method] += payment.amount || 0;
        });
        
        return methods;
    }
    
    // Recent Activity
    async getRecentActivity(limit = 10) {
        try {
            const [invoices, payments, projects] = await Promise.all([
                this.getInvoices(),
                this.getPayments(),
                this.getProjects()
            ]);
            
            const activities = [];
            
            // Add recent invoices
            invoices
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .forEach(invoice => {
                    activities.push({
                        type: 'invoice',
                        description: `فاتورة جديدة #${invoice.invoiceNumber}`,
                        amount: invoice.total,
                        time: this.formatTimeAgo(invoice.createdAt),
                        user: 'النظام'
                    });
                });
            
            // Add recent payments
            payments
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3)
                .forEach(payment => {
                    activities.push({
                        type: 'payment',
                        description: `دفع فاتورة #${payment.invoiceId}`,
                        amount: payment.amount,
                        time: this.formatTimeAgo(payment.date),
                        user: 'النظام'
                    });
                });
            
            // Add recent projects
            projects
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 2)
                .forEach(project => {
                    activities.push({
                        type: 'project',
                        description: `مشروع جديد: ${project.name}`,
                        time: this.formatTimeAgo(project.createdAt),
                        user: 'النظام'
                    });
                });
            
            return activities
                .sort((a, b) => new Date(b.time) - new Date(a.time))
                .slice(0, limit);
            
        } catch (error) {
            console.error('Error loading recent activity:', error);
            return [];
        }
    }
    
    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) {
            return `قبل ${diffMins} دقيقة`;
        } else if (diffHours < 24) {
            return `قبل ${diffHours} ساعة`;
        } else if (diffDays < 7) {
            return `قبل ${diffDays} يوم`;
        } else {
            return date.toLocaleDateString('ar-SA');
        }
    }
    
    // Backup and Restore
    async createBackup() {
        try {
            const [
                users,
                projects,
                items,
                invoices,
                clients,
                payments,
                settings
            ] = await Promise.all([
                this.getUsers(),
                this.getProjects(),
                this.getItems(),
                this.getInvoices(),
                this.getClients(),
                this.getPayments(),
                this.getSettings()
            ]);
            
            return {
                users,
                projects,
                items,
                invoices,
                clients,
                payments,
                settings,
                backupDate: new Date().toISOString(),
                version: '2.0',
                recordCount: {
                    users: users.length,
                    projects: projects.length,
                    items: items.length,
                    invoices: invoices.length,
                    clients: clients.length,
                    payments: payments.length,
                    settings: settings.length
                }
            };
            
        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    }
    
    async getUsers() {
        if (this.useLocalStorage) {
            return JSON.parse(localStorage.getItem('professional_users') || '[]');
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getSettings() {
        if (this.useLocalStorage) {
            return JSON.parse(localStorage.getItem('professional_settings') || '[]');
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async restoreBackup(backupData) {
        try {
            if (this.useLocalStorage) {
                // Clear existing data
                const stores = ['users', 'projects', 'items', 'invoices', 'clients', 'payments', 'settings'];
                stores.forEach(store => {
                    localStorage.removeItem(`professional_${store}`);
                });
                
                // Restore data
                if (backupData.users) {
                    localStorage.setItem('professional_users', JSON.stringify(backupData.users));
                }
                if (backupData.projects) {
                    localStorage.setItem('professional_projects', JSON.stringify(backupData.projects));
                }
                if (backupData.items) {
                    localStorage.setItem('professional_items', JSON.stringify(backupData.items));
                }
                if (backupData.invoices) {
                    localStorage.setItem('professional_invoices', JSON.stringify(backupData.invoices));
                }
                if (backupData.clients) {
                    localStorage.setItem('professional_clients', JSON.stringify(backupData.clients));
                }
                if (backupData.payments) {
                    localStorage.setItem('professional_payments', JSON.stringify(backupData.payments));
                }
                if (backupData.settings) {
                    localStorage.setItem('professional_settings', JSON.stringify(backupData.settings));
                }
            } else {
                // For IndexedDB, we need to clear and restore each store
                console.log('IndexedDB restore not implemented in this example');
            }
            
            return true;
            
        } catch (error) {
            console.error('Error restoring backup:', error);
            throw error;
        }
    }
    
    // Utility Methods
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}

// Update global instance
const db = new ProfessionalDatabase();