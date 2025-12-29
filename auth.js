// Authentication System
class Auth {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        this.init();
    }
    
    async init() {
        await db.init();
        this.checkStoredSession();
        this.setupLoginForm();
    }
    
    checkStoredSession() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
                this.isAuthenticated = true;
                this.updateUI();
            } catch (error) {
                this.logout();
            }
        }
    }
    
    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const userType = document.getElementById('userType').value;
                
                await this.login(username, password, userType);
            });
        }
    }
    
    async login(username, password, userType) {
        try {
            const user = await db.getUser(username, password);
            
            if (!user) {
                this.showMessage('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
                return;
            }
            
            if (user.type !== userType) {
                this.showMessage('نوع الحساب غير صحيح', 'error');
                return;
            }
            
            this.currentUser = user;
            this.isAuthenticated = true;
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            this.updateUI();
            this.showMessage('تم تسجيل الدخول بنجاح', 'success');
            
        } catch (error) {
            this.showMessage('حدث خطأ في النظام', 'error');
            console.error('Login error:', error);
        }
    }
    
    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('currentUser');
        this.updateUI();
        this.showMessage('تم تسجيل الخروج', 'info');
    }
    
    updateUI() {
        const authScreen = document.getElementById('authScreen');
        const mainApp = document.getElementById('mainApp');
        const currentUserSpan = document.getElementById('currentUser');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (this.isAuthenticated && this.currentUser) {
            authScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
            
            if (currentUserSpan) {
                currentUserSpan.textContent = this.currentUser.username;
            }
            
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }
            
            // Initialize app if needed
            if (window.electricalApp) {
                window.electricalApp.init();
            }
            
        } else {
            authScreen.classList.remove('hidden');
            mainApp.classList.add('hidden');
        }
    }
    
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button class="close-alert">&times;</button>
        `;
        
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? 'rgba(255,0,0,0.2)' : 
                        type === 'success' ? 'rgba(0,255,0,0.2)' : 
                        'rgba(0,255,255,0.2)'};
            border: 1px solid ${type === 'error' ? '#f00' : 
                              type === 'success' ? '#0f0' : 
                              '#0ff'};
            color: ${type === 'error' ? '#f00' : 
                    type === 'success' ? '#0f0' : 
                    '#0ff'};
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 15px;
        `;
        
        alert.querySelector('.close-alert').addEventListener('click', () => {
            alert.remove();
        });
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
    
    hasPermission(permission) {
        if (!this.currentUser) return false;
        if (this.currentUser.type === 'admin') return true;
        return true; // Basic permissions for all users
    }
}

// Create global instance
const auth = new Auth();