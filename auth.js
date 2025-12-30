// auth.js - Professional Version
class ProfessionalAuth {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
        
        this.init();
    }
    
    async init() {
        await db.init();
        this.checkStoredSession();
        this.setupLoginForm();
        this.setupSessionManagement();
    }
    
    checkStoredSession() {
        try {
            const storedSession = localStorage.getItem('professional_session');
            if (storedSession) {
                const session = JSON.parse(storedSession);
                
                // Check if session is still valid
                const now = new Date();
                const expires = new Date(session.expires);
                
                if (now < expires && session.user) {
                    this.currentUser = session.user;
                    this.isAuthenticated = true;
                    this.updateUI();
                    this.startSessionTimer();
                    return;
                }
            }
            
            // If no valid session, logout
            this.logout();
            
        } catch (error) {
            console.error('Error checking stored session:', error);
            this.logout();
        }
    }
    
    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            // Clear any existing listeners
            const newForm = loginForm.cloneNode(true);
            loginForm.parentNode.replaceChild(newForm, loginForm);
            
            newForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const userType = document.getElementById('userType').value;
                const rememberMe = document.getElementById('rememberMe').checked;
                
                await this.login(username, password, userType, rememberMe);
            });
        }
    }
    
    setupSessionManagement() {
        // Reset session timer on user activity
        const resetSessionTimer = () => {
            if (this.sessionTimer) {
                clearTimeout(this.sessionTimer);
            }
            
            if (this.isAuthenticated) {
                this.sessionTimer = setTimeout(() => {
                    this.showSessionTimeoutWarning();
                }, this.sessionTimeout - 60000); // Warn 1 minute before timeout
            }
        };
        
        // Listen for user activity
        ['click', 'mousemove', 'keypress', 'scroll'].forEach(event => {
            document.addEventListener(event, resetSessionTimer);
        });
    }
    
    async login(username, password, userType, rememberMe = false) {
        try {
            // Show loading state
            const submitBtn = document.querySelector('#loginForm button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
            submitBtn.disabled = true;
            
            // Simulate network delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const user = await db.getUser(username, password);
            
            if (!user) {
                this.showMessage('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            if (user.type !== userType) {
                this.showMessage('نوع الحساب غير صحيح', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            this.currentUser = user;
            this.isAuthenticated = true;
            
            // Create session
            const session = {
                user: user,
                loginTime: new Date().toISOString(),
                expires: new Date(Date.now() + this.sessionTimeout).toISOString(),
                rememberMe: rememberMe
            };
            
            localStorage.setItem('professional_session', JSON.stringify(session));
            
            // Update user stats
            user.loginCount = (user.loginCount || 0) + 1;
            user.lastLogin = new Date().toISOString();
            await db.updateUser(user);
            
            this.updateUI();
            this.startSessionTimer();
            
            this.showMessage('تم تسجيل الدخول بنجاح', 'success');
            
            // Update button back
            submitBtn.innerHTML = '<i class="fas fa-check"></i> تم تسجيل الدخول';
            
            // Small delay before redirect
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1000);
            
        } catch (error) {
            this.showMessage('حدث خطأ في النظام', 'error');
            console.error('Login error:', error);
            
            // Reset button
            const submitBtn = document.querySelector('#loginForm button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول';
            submitBtn.disabled = false;
        }
    }
    
    logout(showMessage = true) {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Clear session
        localStorage.removeItem('professional_session');
        
        // Clear session timer
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        this.updateUI();
        
        if (showMessage) {
            this.showMessage('تم تسجيل الخروج', 'info');
        }
    }
    
    updateUI() {
        const authScreen = document.getElementById('authScreen');
        const mainApp = document.getElementById('mainApp');
        const currentUserSpan = document.getElementById('currentUser');
        const userRoleSpan = document.getElementById('userRole');
        const userGreeting = document.getElementById('userGreeting');
        
        if (this.isAuthenticated && this.currentUser) {
            // Hide auth screen, show main app
            authScreen.style.opacity = '0';
            setTimeout(() => {
                authScreen.classList.add('hidden');
                mainApp.classList.remove('hidden');
                mainApp.style.opacity = '0';
                
                // Fade in main app
                setTimeout(() => {
                    mainApp.style.opacity = '1';
                    mainApp.style.transition = 'opacity 0.5s ease';
                }, 50);
            }, 300);
            
            // Update user info
            if (currentUserSpan) {
                currentUserSpan.textContent = this.currentUser.fullName || this.currentUser.username;
            }
            
            if (userRoleSpan) {
                userRoleSpan.textContent = this.currentUser.role || this.currentUser.type;
            }
            
            if (userGreeting) {
                const hour = new Date().getHours();
                let greeting = 'مرحباً';
                
                if (hour < 12) {
                    greeting = 'صباح الخير';
                } else if (hour < 18) {
                    greeting = 'مساء الخير';
                } else {
                    greeting = 'مساء الخير';
                }
                
                userGreeting.textContent = `${greeting}، ${this.currentUser.fullName || this.currentUser.username}`;
            }
            
            // Initialize app if needed
            if (window.electricalApp && !window.electricalApp.initialized) {
                window.electricalApp.init();
                window.electricalApp.initialized = true;
            }
            
        } else {
            // Show auth screen, hide main app
            mainApp.style.opacity = '0';
            setTimeout(() => {
                mainApp.classList.add('hidden');
                authScreen.classList.remove('hidden');
                authScreen.style.opacity = '0';
                
                // Fade in auth screen
                setTimeout(() => {
                    authScreen.style.opacity = '1';
                    authScreen.style.transition = 'opacity 0.5s ease';
                }, 50);
            }, 300);
            
            // Reset form
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.reset();
            }
        }
    }
    
    startSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        // Set timer to warn before session timeout
        this.sessionTimer = setTimeout(() => {
            this.showSessionTimeoutWarning();
        }, this.sessionTimeout - 60000); // Warn 1 minute before timeout
    }
    
    showSessionTimeoutWarning() {
        if (!this.isAuthenticated) return;
        
        const warning = document.createElement('div');
        warning.className = 'session-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <i class="fas fa-clock"></i>
                <div>
                    <h4>جلسة العمل على وشك الانتهاء</h4>
                    <p>سيتم تسجيل خروجك تلقائياً خلال دقيقة واحدة بسبب عدم النشاط</p>
                </div>
                <div class="warning-actions">
                    <button class="btn btn-primary btn-small" id="extendSession">
                        تمديد الجلسة
                    </button>
                    <button class="btn btn-secondary btn-small" id="logoutNow">
                        تسجيل خروج
                    </button>
                </div>
            </div>
        `;
        
        warning.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #FF9800, #FF5722);
            color: white;
            padding: 20px;
            border-radius: 12px;
            z-index: 10000;
            min-width: 400px;
            max-width: 500px;
            box-shadow: 0 10px 40px rgba(255, 152, 0, 0.3);
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(warning);
        
        // Extend session button
        document.getElementById('extendSession').addEventListener('click', () => {
            this.extendSession();
            warning.remove();
        });
        
        // Logout button
        document.getElementById('logoutNow').addEventListener('click', () => {
            this.logout();
            warning.remove();
        });
        
        // Auto logout after 60 seconds
        setTimeout(() => {
            if (warning.parentNode) {
                warning.remove();
                this.logout();
            }
        }, 60000);
    }
    
    extendSession() {
        if (!this.isAuthenticated || !this.currentUser) return;
        
        // Update session expiration
        const session = JSON.parse(localStorage.getItem('professional_session') || '{}');
        session.expires = new Date(Date.now() + this.sessionTimeout).toISOString();
        localStorage.setItem('professional_session', JSON.stringify(session));
        
        // Restart timer
        this.startSessionTimer();
        
        this.showMessage('تم تمديد جلسة العمل', 'success');
    }
    
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageEl = document.createElement('div');
        messageEl.className = `auth-message auth-message-${type}`;
        messageEl.innerHTML = `
            <div class="message-content">
                <i class="fas fa-${this.getMessageIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="message-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Position based on context
        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
            authContainer.appendChild(messageEl);
        } else {
            document.body.appendChild(messageEl);
            messageEl.style.position = 'fixed';
            messageEl.style.top = '20px';
            messageEl.style.left = '50%';
            messageEl.style.transform = 'translateX(-50%)';
        }
        
        // Style
        messageEl.style.cssText += `
            background: ${this.getMessageColor(type, 'background')};
            border: 1px solid ${this.getMessageColor(type, 'border')};
            color: ${this.getMessageColor(type, 'color')};
            padding: 16px 24px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            animation: slideDown 0.3s ease;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        `;
        
        // Close button
        messageEl.querySelector('.message-close').addEventListener('click', () => {
            messageEl.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.remove();
                }
            }, 300);
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
    
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        // Admin has all permissions
        if (this.currentUser.type === 'admin' || this.currentUser.permissions?.includes('all')) {
            return true;
        }
        
        // Check specific permissions
        return this.currentUser.permissions?.includes(permission) || false;
    }
    
    // Password reset functionality
    async requestPasswordReset(email) {
        try {
            // In a real app, this would send an email
            this.showMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني', 'info');
            return true;
        } catch (error) {
            this.showMessage('حدث خطأ في طلب إعادة تعيين كلمة المرور', 'error');
            console.error('Password reset error:', error);
            return false;
        }
    }
    
    // Change password
    async changePassword(oldPassword, newPassword) {
        try {
            if (!this.currentUser) {
                throw new Error('No user logged in');
            }
            
            // Verify old password
            const user = await db.getUser(this.currentUser.username, oldPassword);
            if (!user) {
                throw new Error('كلمة المرور القديمة غير صحيحة');
            }
            
            // Update password
            user.password = newPassword;
            await db.updateUser(user);
            
            // Update current user
            this.currentUser = user;
            
            this.showMessage('تم تغيير كلمة المرور بنجاح', 'success');
            return true;
            
        } catch (error) {
            this.showMessage(error.message || 'حدث خطأ في تغيير كلمة المرور', 'error');
            console.error('Change password error:', error);
            return false;
        }
    }
    
    // Update profile
    async updateProfile(updates) {
        try {
            if (!this.currentUser) {
                throw new Error('No user logged in');
            }
            
            const updatedUser = {
                ...this.currentUser,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            await db.updateUser(updatedUser);
            this.currentUser = updatedUser;
            
            // Update session
            const session = JSON.parse(localStorage.getItem('professional_session') || '{}');
            session.user = updatedUser;
            localStorage.setItem('professional_session', JSON.stringify(session));
            
            this.showMessage('تم تحديث الملف الشخصي بنجاح', 'success');
            return true;
            
        } catch (error) {
            this.showMessage('حدث خطأ في تحديث الملف الشخصي', 'error');
            console.error('Update profile error:', error);
            return false;
        }
    }
}

// Update global instance
const auth = new ProfessionalAuth();