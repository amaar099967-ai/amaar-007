// app.js - Professional Version
class ProfessionalElectricalApp {
    constructor() {
        this.currentProject = null;
        this.currentPage = 'dashboard';
        this.charts = {};
        this.notifications = [];
        this.isMobile = this.checkMobile();
        
        this.init();
    }
    
    async init() {
        console.log('🚀 تهيئة النظام المحاسبي الاحترافي...');
        
        await this.preloadAssets();
        this.setupUI();
        this.setupEventListeners();
        this.setupCharts();
        this.setupNotifications();
        this.updateDateTime();
        
        console.log('✅ النظام جاهز للاستخدام');
        
        // Hide loading overlay
        setTimeout(() => {
            document.getElementById('loadingOverlay').style.display = 'none';
        }, 1000);
    }
    
    checkMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    async preloadAssets() {
        // Preload essential assets
        const assets = [
            'https://cdn.jsdelivr.net/npm/chart.js',
            // Add other asset URLs here
        ];
        
        return Promise.all(assets.map(url => this.preloadAsset(url)));
    }
    
    preloadAsset(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = 'script';
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
    
    setupUI() {
        // Initialize UI components
        this.setupUserGreeting();
        this.setupStats();
        this.setupTheme();
        
        if (this.isMobile) {
            this.setupMobileUI();
        }
    }
    
    setupUserGreeting() {
        const user = auth.currentUser;
        const greeting = document.getElementById('userGreeting');
        if (greeting && user) {
            greeting.textContent = user.username;
        }
    }
    
    setupStats() {
        // Initialize stats with animation
        this.animateStats();
    }
    
    animateStats() {
        const stats = [
            { id: 'totalRevenue', target: 45800, suffix: ' د.ع' },
            { id: 'activeProjects', target: 18, suffix: '' },
            { id: 'pendingInvoices', target: 34, suffix: '' },
            { id: 'activeClients', target: 67, suffix: '' }
        ];
        
        stats.forEach(stat => {
            this.animateValue(stat.id, stat.target, stat.suffix);
        });
    }
    
    animateValue(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const currentText = element.textContent.replace(/[^\d]/g, '');
        const currentValue = parseInt(currentText) || 0;
        const duration = 1500;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const value = Math.floor(currentValue + (targetValue - currentValue) * easeOutQuart);
            
            element.textContent = this.formatNumber(value) + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    setupEventListeners() {
        // Menu Toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                menuToggle.innerHTML = sidebar.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
        }
        
        // Navigation
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });
        
        // Actions
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAction(action);
            });
        });
        
        // Quick Actions
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
        
        // Search
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        // Notifications
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationPanel = document.getElementById('notificationPanel');
        
        if (notificationBtn && notificationPanel) {
            notificationBtn.addEventListener('click', () => {
                notificationPanel.style.display = notificationPanel.style.display === 'block' 
                    ? 'none' 
                    : 'block';
            });
            
            // Close panel when clicking outside
            document.addEventListener('click', (e) => {
                if (!notificationPanel.contains(e.target) && 
                    !notificationBtn.contains(e.target)) {
                    notificationPanel.style.display = 'none';
                }
            });
        }
        
        // User Dropdown
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.addEventListener('click', () => {
                this.toggleUserMenu();
            });
        }
        
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }
    
    setupCharts() {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            this.charts.revenue = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                    datasets: [{
                        label: 'الإيرادات',
                        data: [1200000, 1500000, 1800000, 1400000, 2000000, 2400000],
                        borderColor: '#4A6FA5',
                        backgroundColor: 'rgba(74, 111, 165, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#4A6FA5',
                        pointBorderColor: '#FFFFFF',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#FFFFFF',
                            bodyColor: '#FFFFFF',
                            borderColor: '#4A6FA5',
                            borderWidth: 1,
                            callbacks: {
                                label: (context) => {
                                    return `الإيرادات: ${this.formatCurrency(context.raw)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                callback: (value) => {
                                    return this.formatNumber(value) + ' د.ع';
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'nearest'
                    },
                    animations: {
                        tension: {
                            duration: 1000,
                            easing: 'linear'
                        }
                    }
                }
            });
        }
        
        // Projects Chart
        const projectsCtx = document.getElementById('projectsChart');
        if (projectsCtx) {
            this.charts.projects = new Chart(projectsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['قيد التنفيذ', 'مكتمل', 'معلق', 'ملغى'],
                    datasets: [{
                        data: [8, 5, 3, 2],
                        backgroundColor: [
                            '#4A6FA5',
                            '#4CAF50',
                            '#FF9800',
                            '#F44336'
                        ],
                        borderWidth: 0,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                color: 'rgba(255, 255, 255, 0.7)',
                                font: {
                                    family: 'Tajawal',
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#FFFFFF',
                            bodyColor: '#FFFFFF',
                            borderColor: '#4A6FA5',
                            borderWidth: 1,
                            callbacks: {
                                label: (context) => {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((context.raw / total) * 100);
                                    return `${context.label}: ${context.raw} مشروع (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }
    
    setupNotifications() {
        // Load notifications
        this.loadNotifications();
        
        // Update badge count
        this.updateNotificationBadge();
    }
    
    async loadNotifications() {
        try {
            // In a real app, this would be an API call
            this.notifications = [
                {
                    id: 1,
                    title: 'تم دفع فاتورة',
                    message: 'فاتورة #245 - شركة النور',
                    amount: 500000,
                    type: 'payment',
                    time: 'قبل ساعتين',
                    read: false
                },
                {
                    id: 2,
                    title: 'فاتورة متأخرة',
                    message: 'فاتورة #238 - محمد أحمد',
                    amount: 200000,
                    type: 'warning',
                    time: 'قبل يوم',
                    read: false
                },
                {
                    id: 3,
                    title: 'مشروع جديد',
                    message: 'تم بدء مشروع "فيلا الربيع"',
                    type: 'project',
                    time: 'قبل 3 أيام',
                    read: true
                }
            ];
            
            this.renderNotifications();
            
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }
    
    renderNotifications() {
        const container = document.querySelector('.panel-content');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>لا توجد إشعارات</p>
                </div>
            `;
            return;
        }
        
        this.notifications.forEach(notification => {
            const notificationEl = document.createElement('div');
            notificationEl.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
            notificationEl.innerHTML = `
                <div class="notification-icon ${notification.type}">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <small>${notification.time}</small>
                </div>
                ${notification.amount ? 
                    `<div class="notification-amount ${notification.type === 'warning' ? 'negative' : 'positive'}">
                        ${this.formatCurrency(notification.amount)}
                    </div>` : ''
                }
            `;
            
            notificationEl.addEventListener('click', () => {
                this.handleNotificationClick(notification.id);
            });
            
            container.appendChild(notificationEl);
        });
    }
    
    getNotificationIcon(type) {
        const icons = {
            payment: 'money-bill-wave',
            warning: 'exclamation-circle',
            project: 'project-diagram',
            invoice: 'file-invoice',
            client: 'user'
        };
        return icons[type] || 'bell';
    }
    
    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-btn .badge');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }
    
    handleNotificationClick(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.updateNotificationBadge();
            this.renderNotifications();
        }
        
        // Handle notification action based on type
        this.handleNotificationAction(notification);
    }
    
    handleNotificationAction(notification) {
        switch (notification.type) {
            case 'payment':
                this.navigateTo('invoices');
                break;
            case 'warning':
                this.showInvoiceModal(notification.message.match(/#(\d+)/)[1]);
                break;
            case 'project':
                this.navigateTo('projects');
                break;
        }
    }
    
    setupTheme() {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            this.toggleTheme();
        }
        
        // Theme toggle button
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
        
        // Update charts if they exist
        this.updateChartsTheme();
    }
    
    updateChartsTheme() {
        // Update chart colors based on theme
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.update) {
                chart.update();
            }
        });
    }
    
    setupMobileUI() {
        // Show mobile nav
        const mobileNav = document.querySelector('.mobile-nav');
        if (mobileNav) {
            mobileNav.style.display = 'flex';
        }
        
        // Setup touch gestures
        this.setupTouchGestures();
    }
    
    setupTouchGestures() {
        let startX, startY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Horizontal swipe for navigation
            if (Math.abs(diffX) > 50 && Math.abs(diffY) < 50) {
                if (diffX > 0) {
                    this.navigateToNextPage();
                } else {
                    this.navigateToPreviousPage();
                }
            }
        });
    }
    
    updateDateTime() {
        const updateTime = () => {
            const now = new Date();
            
            // Update date
            const dateElement = document.getElementById('currentDate');
            if (dateElement) {
                const options = { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                };
                dateElement.textContent = now.toLocaleDateString('ar-SA', options);
            }
            
            // Update time
            const timeElement = document.getElementById('currentTime');
            if (timeElement) {
                const timeOptions = { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                };
                timeElement.textContent = now.toLocaleTimeString('ar-SA', timeOptions);
            }
        };
        
        // Update immediately and then every minute
        updateTime();
        setInterval(updateTime, 60000);
    }
    
    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(`${page}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
            
            // Update active nav items
            this.updateActiveNav(page);
            
            // Close sidebar on mobile
            if (this.isMobile) {
                const sidebar = document.getElementById('sidebar');
                const menuToggle = document.getElementById('menuToggle');
                if (sidebar && menuToggle) {
                    sidebar.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
            
            // Load page data
            this.loadPageData(page);
        }
    }
    
    updateActiveNav(page) {
        // Update desktop nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });
        
        // Update mobile nav
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });
    }
    
    async loadPageData(page) {
        switch (page) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'projects':
                await this.loadProjectsData();
                break;
            case 'invoices':
                await this.loadInvoicesData();
                break;
            case 'clients':
                await this.loadClientsData();
                break;
        }
    }
    
    async loadDashboardData() {
        try {
            // Load data from database
            const [projects, invoices, clients] = await Promise.all([
                db.getProjects(),
                db.getInvoices(),
                db.getClients()
            ]);
            
            // Update charts with real data
            this.updateChartsWithRealData(projects, invoices);
            
            // Load recent activity
            this.loadRecentActivity();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showMessage('تعذر تحميل بيانات لوحة التحكم', 'error');
        }
    }
    
    updateChartsWithRealData(projects, invoices) {
        // Update revenue chart with real data
        if (this.charts.revenue) {
            // You would process real data here
            console.log('Updating charts with real data');
        }
    }
    
    async loadRecentActivity() {
        try {
            // Load recent activity from database
            const activity = await db.getRecentActivity();
            
            // Render activity
            this.renderRecentActivity(activity);
            
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }
    
    renderRecentActivity(activity) {
        const container = document.querySelector('.activity-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        activity.forEach(item => {
            const activityEl = document.createElement('div');
            activityEl.className = 'activity-item';
            activityEl.innerHTML = `
                <div class="activity-icon ${item.type}">
                    <i class="fas fa-${this.getActivityIcon(item.type)}"></i>
                </div>
                <div class="activity-details">
                    <p>${item.description}</p>
                    <small>${item.time} - ${item.user}</small>
                </div>
                ${item.amount ? 
                    `<span class="activity-amount ${item.amount > 0 ? 'positive' : 'negative'}">
                        ${this.formatCurrency(Math.abs(item.amount))}
                    </span>` : ''
                }
            `;
            container.appendChild(activityEl);
        });
    }
    
    getActivityIcon(type) {
        const icons = {
            invoice: 'file-invoice-dollar',
            payment: 'money-check',
            project: 'project-diagram',
            client: 'user-plus'
        };
        return icons[type] || 'history';
    }
    
    handleAction(action) {
        switch (action) {
            case 'newProject':
                this.showNewProjectModal();
                break;
            case 'newInvoice':
                this.showNewInvoiceModal();
                break;
            case 'newClient':
                this.showNewClientModal();
                break;
            case 'backup':
                this.createBackup();
                break;
            case 'importExcel':
                this.importFromExcel();
                break;
            case 'exportPdf':
                this.exportToPDF();
                break;
        }
    }
    
    handleQuickAction(action) {
        switch (action) {
            case 'newInvoice':
                this.showQuickInvoiceModal();
                break;
            case 'newProject':
                this.showQuickProjectModal();
                break;
            case 'newClient':
                this.showQuickClientModal();
                break;
            case 'exportReport':
                this.exportQuickReport();
                break;
        }
    }
    
    showQuickInvoiceModal() {
        // Show simplified invoice modal
        this.showMessage('فتح نموذج فاتورة سريعة', 'info');
        // Implementation here
    }
    
    showQuickProjectModal() {
        // Show simplified project modal
        this.showMessage('فتح نموذج مشروع سريع', 'info');
        // Implementation here
    }
    
    showQuickClientModal() {
        // Show simplified client modal
        this.showMessage('فتح نموذج عميل سريع', 'info');
        // Implementation here
    }
    
    exportQuickReport() {
        this.showMessage('جاري إنشاء تقرير سريع...', 'info');
        
        setTimeout(() => {
            this.showMessage('تم تصدير التقرير بنجاح', 'success');
            
            // Simulate download
            const data = {
                type: 'quick_report',
                date: new Date().toISOString(),
                revenue: 45800,
                projects: 18,
                invoices: 34,
                clients: 67
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `quick_report_${new Date().getTime()}.json`;
            a.click();
        }, 1500);
    }
    
    handleSearch(query) {
        if (query.length < 2) return;
        
        console.log('Searching for:', query);
        // Implement search functionality
    }
    
    toggleUserMenu() {
        // Toggle user dropdown menu
        console.log('Toggle user menu');
    }
    
    async handleLogout() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            await auth.logout();
            this.showMessage('تم تسجيل الخروج بنجاح', 'success');
        }
    }
    
    navigateToNextPage() {
        const pages = ['dashboard', 'projects', 'invoices', 'clients'];
        const currentIndex = pages.indexOf(this.currentPage);
        const nextIndex = (currentIndex + 1) % pages.length;
        this.navigateTo(pages[nextIndex]);
    }
    
    navigateToPreviousPage() {
        const pages = ['dashboard', 'projects', 'invoices', 'clients'];
        const currentIndex = pages.indexOf(this.currentPage);
        const prevIndex = (currentIndex - 1 + pages.length) % pages.length;
        this.navigateTo(pages[prevIndex]);
    }
    
    formatNumber(num) {
        return new Intl.NumberFormat('ar-IQ').format(num);
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <div class="message-content">
                <i class="fas fa-${this.getMessageIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="message-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Style
        messageEl.style.cssText = `
            position: fixed;
            top: 90px;
            left: 50%;
            transform: translateX(-50%);
            background: ${this.getMessageColor(type, 'background')};
            border: 1px solid ${this.getMessageColor(type, 'border')};
            color: ${this.getMessageColor(type, 'color')};
            padding: 16px 24px;
            border-radius: 12px;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            min-width: 300px;
            max-width: 500px;
            backdrop-filter: blur(10px);
            animation: slideDown 0.3s ease;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        `;
        
        // Add to document
        document.body.appendChild(messageEl);
        
        // Close button
        messageEl.querySelector('.message-close').addEventListener('click', () => {
            messageEl.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        messageEl.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    getMessageIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    getMessageColor(type, property) {
        const colors = {
            success: {
                background: 'rgba(76, 175, 80, 0.15)',
                border: '#4CAF50',
                color: '#4CAF50'
            },
            error: {
                background: 'rgba(244, 67, 54, 0.15)',
                border: '#F44336',
                color: '#F44336'
            },
            warning: {
                background: 'rgba(255, 152, 0, 0.15)',
                border: '#FF9800',
                color: '#FF9800'
            },
            info: {
                background: 'rgba(33, 150, 243, 0.15)',
                border: '#2196F3',
                color: '#2196F3'
            }
        };
        
        return colors[type]?.[property] || colors.info[property];
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize matrix background
    if (window.MatrixBackground) {
        new MatrixBackground();
    }
    
    // Initialize main app when authenticated
    if (auth.isAuthenticated) {
        window.electricalApp = new ProfessionalElectricalApp();
    }
});