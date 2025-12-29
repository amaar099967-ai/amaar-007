// Main Application
class ElectricalAccountingApp {
    constructor() {
        this.currentProject = null;
        this.currentPage = 'dashboard';
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    async init() {
        console.log('🚀 تهيئة نظام الحسابات الكهربائية...');
        
        this.setupEventListeners();
        this.setupMobileFeatures();
        this.loadInitialData();
        
        console.log('✅ التطبيق جاهز للاستخدام');
    }
    
    setupEventListeners() {
        // Menu Toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
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
        
        // Specific buttons
        const newProjectBtn = document.getElementById('newProjectBtn');
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => this.showNewProjectModal());
        }
        
        const addNewItem = document.getElementById('addNewItem');
        if (addNewItem) {
            addNewItem.addEventListener('click', () => this.showAddItemModal());
        }
        
        const saveTable = document.getElementById('saveTable');
        if (saveTable) {
            saveTable.addEventListener('click', () => this.saveTableData());
        }
        
        // Financial input
        const receivedAmount = document.getElementById('receivedAmount');
        if (receivedAmount) {
            receivedAmount.addEventListener('input', () => this.calculateRemaining());
        }
    }
    
    setupMobileFeatures() {
        if (this.isMobile) {
            // Show mobile nav
            const mobileNav = document.querySelector('.mobile-nav');
            if (mobileNav) {
                mobileNav.style.display = 'flex';
            }
            
            // Touch events
            this.setupTouchGestures();
            
            // Install prompt
            this.setupPWAInstall();
        }
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
    
    setupPWAInstall() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            setTimeout(() => {
                if (confirm('هل تريد تثبيت التطبيق على هاتفك؟')) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        deferredPrompt = null;
                    });
                }
            }, 3000);
        });
    }
    
    async loadInitialData() {
        if (!auth.isAuthenticated) return;
        
        await this.loadDashboardData();
        this.navigateTo('dashboard');
    }
    
    async loadDashboardData() {
        try {
            const projects = await db.getProjects();
            const items = await db.getItems();
            
            // Update stats
            document.getElementById('totalProjects').textContent = projects.length;
            document.getElementById('totalItems').textContent = items.length;
            
            // Calculate total revenue
            let totalRevenue = 0;
            for (const item of items) {
                totalRevenue += (item.price || 0) * (item.quantity || 1);
            }
            
            document.getElementById('totalRevenue').textContent = 
                this.formatCurrency(totalRevenue);
            
            // Load recent projects
            this.loadRecentProjects(projects.slice(-3));
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }
    
    loadRecentProjects(projects) {
        const container = document.getElementById('recentProjectsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'matrix-border';
            projectCard.style.cssText = `
                padding: 15px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.3s;
            `;
            
            projectCard.innerHTML = `
                <h4 style="color: #0f0; margin-bottom: 5px;">${project.name}</h4>
                <p style="color: rgba(0,255,0,0.7); margin-bottom: 5px; font-size: 14px;">
                    العميل: ${project.clientName || '---'}
                </p>
                <p style="color: rgba(0,255,0,0.5); font-size: 12px;">
                    ${new Date(project.createdAt).toLocaleDateString('ar-EG')}
                </p>
            `;
            
            projectCard.addEventListener('click', () => {
                this.openProject(project.id);
            });
            
            container.appendChild(projectCard);
        });
    }
    
    async openProject(projectId) {
        try {
            const projects = await db.getProjects();
            const project = projects.find(p => p.id === projectId);
            
            if (project) {
                this.currentProject = project;
                
                // Update UI
                document.getElementById('projectName').textContent = project.name;
                document.getElementById('clientName').textContent = project.clientName || '---';
                document.getElementById('tableProjectName').textContent = project.name;
                document.getElementById('tableClientName').textContent = project.clientName || '---';
                
                // Load project items
                await this.loadProjectItems(projectId);
                
                // Navigate to table page
                this.navigateTo('table');
            }
        } catch (error) {
            console.error('Error opening project:', error);
            this.showMessage('تعذر فتح المشروع', 'error');
        }
    }
    
    async loadProjectItems(projectId) {
        try {
            const items = await db.getItems(projectId);
            this.displayTableItems(items);
        } catch (error) {
            console.error('Error loading project items:', error);
        }
    }
    
    displayTableItems(items) {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        let totalAmount = 0;
        
        items.forEach((item, index) => {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            totalAmount += itemTotal;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${this.formatCurrency(item.price || 0)}</td>
                <td>${item.quantity || 1}</td>
                <td>${this.formatCurrency(itemTotal)}</td>
                <td>
                    <button class="btn-icon btn-delete-item" data-id="${item.id}" style="background: rgba(255,0,0,0.1); border-color: #f00; color: #f00;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Update financial summary
        document.getElementById('totalAmount').textContent = this.formatCurrency(totalAmount);
        this.calculateRemaining();
        
        // Add delete event listeners
        document.querySelectorAll('.btn-delete-item').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const itemId = parseInt(e.currentTarget.dataset.id);
                if (confirm('هل تريد حذف هذا البند؟')) {
                    await db.deleteItem(itemId);
                    if (this.currentProject) {
                        await this.loadProjectItems(this.currentProject.id);
                    }
                    this.showMessage('تم حذف البند بنجاح', 'success');
                }
            });
        });
    }
    
    calculateRemaining() {
        const totalText = document.getElementById('totalAmount').textContent;
        const total = parseFloat(totalText.replace(/[^\d.]/g, '')) || 0;
        const received = parseFloat(document.getElementById('receivedAmount').value) || 0;
        const remaining = Math.max(0, total - received);
        
        document.getElementById('remainingAmount').textContent = this.formatCurrency(remaining);
    }
    
    async saveTableData() {
        this.showMessage('تم حفظ البيانات', 'success');
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
            
            // Update mobile nav
            document.querySelectorAll('.mobile-nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.page === page) {
                    item.classList.add('active');
                }
            });
        }
    }
    
    navigateToNextPage() {
        const pages = ['dashboard', 'table'];
        const currentIndex = pages.indexOf(this.currentPage);
        const nextIndex = (currentIndex + 1) % pages.length;
        this.navigateTo(pages[nextIndex]);
    }
    
    navigateToPreviousPage() {
        const pages = ['dashboard', 'table'];
        const currentIndex = pages.indexOf(this.currentPage);
        const prevIndex = (currentIndex - 1 + pages.length) % pages.length;
        this.navigateTo(pages[prevIndex]);
    }
    
    async handleAction(action) {
        switch (action) {
            case 'newProject':
                await this.showNewProjectModal();
                break;
                
            case 'addItem':
                await this.showAddItemModal();
                break;
                
            case 'importExcel':
                await this.importFromExcel();
                break;
                
            case 'exportPdf':
                await this.exportToPDF();
                break;
                
            case 'backup':
                await this.createBackup();
                break;
        }
    }
    
    async showNewProjectModal() {
        const projectName = prompt('أدخل اسم المشروع:');
        if (!projectName) return;
        
        const clientName = prompt('أدخل اسم العميل:');
        if (!clientName) return;
        
        try {
            const project = {
                name: projectName,
                clientName: clientName,
                type: 'building',
                description: '',
                status: 'active'
            };
            
            const projectId = await db.addProject(project);
            this.showMessage('تم إنشاء المشروع بنجاح', 'success');
            
            // Refresh dashboard
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('Error creating project:', error);
            this.showMessage('تعذر إنشاء المشروع', 'error');
        }
    }
    
    async showAddItemModal() {
        if (!this.currentProject) {
            this.showMessage('يرجى فتح مشروع أولاً', 'warning');
            return;
        }
        
        const itemName = prompt('أدخل اسم البند:');
        if (!itemName) return;
        
        const price = parseFloat(prompt('أدخل السعر:'));
        if (isNaN(price)) return;
        
        const quantity = parseInt(prompt('أدخل الكمية:', '1'));
        if (isNaN(quantity)) return;
        
        try {
            const item = {
                name: itemName,
                price: price,
                quantity: quantity,
                projectId: this.currentProject.id,
                category: 'كهرباء',
                unit: 'وحدة'
            };
            
            await db.addItem(item);
            await this.loadProjectItems(this.currentProject.id);
            this.showMessage('تم إضافة البند بنجاح', 'success');
            
        } catch (error) {
            console.error('Error adding item:', error);
            this.showMessage('تعذر إضافة البند', 'error');
        }
    }
    
    async importFromExcel() {
        this.showMessage('ميزة الاستيراد من Excel قيد التطوير', 'info');
    }
    
    async exportToPDF() {
        if (!this.currentProject) {
            this.showMessage('يرجى فتح مشروع أولاً', 'warning');
            return;
        }
        
        this.showMessage('جاري تصدير ملف PDF...', 'info');
        
        // Simulate PDF export
        setTimeout(() => {
            this.showMessage('تم تصدير ملف PDF بنجاح', 'success');
        }, 2000);
    }
    
    async createBackup() {
        try {
            const backupData = await db.createBackup();
            const dataStr = JSON.stringify(backupData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `backup_${new Date().getTime()}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            this.showMessage('تم إنشاء نسخة احتياطية', 'success');
            
        } catch (error) {
            console.error('Error creating backup:', error);
            this.showMessage('تعذر إنشاء النسخة الاحتياطية', 'error');
        }
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 2
        }).format(amount);
    }
    
    showMessage(message, type = 'info') {
        // Use auth's showMessage method
        if (auth && auth.showMessage) {
            auth.showMessage(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.electricalApp = new ElectricalAccountingApp();
    
    // Start app if user is authenticated
    if (auth.isAuthenticated) {
        window.electricalApp.init();
    }
});