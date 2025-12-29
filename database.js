// Database System
class Database {
    constructor() {
        this.dbName = 'ElectricalAccountingDB';
        this.init();
    }
    
    async init() {
        if (!window.indexedDB) {
            console.log("IndexedDB not supported");
            return this.initLocalStorage();
        }
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => {
                console.log("IndexedDB failed, falling back to localStorage");
                this.initLocalStorage();
                resolve();
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("Database initialized");
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create stores
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('projects')) {
                    db.createObjectStore('projects', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('items')) {
                    db.createObjectStore('items', { keyPath: 'id' });
                }
                
                // Add default users
                const transaction = event.target.transaction;
                const userStore = transaction.objectStore('users');
                userStore.add({ id: 1, username: 'admin', password: 'admin123', type: 'admin' });
                userStore.add({ id: 2, username: 'user', password: 'user123', type: 'user' });
            };
        });
    }
    
    initLocalStorage() {
        this.useLocalStorage = true;
        
        // Initialize default data
        if (!localStorage.getItem('electrical_users')) {
            localStorage.setItem('electrical_users', JSON.stringify([
                { id: 1, username: 'admin', password: 'admin123', type: 'admin' },
                { id: 2, username: 'user', password: 'user123', type: 'user' }
            ]));
        }
        
        if (!localStorage.getItem('electrical_projects')) {
            localStorage.setItem('electrical_projects', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('electrical_items')) {
            localStorage.setItem('electrical_items', JSON.stringify([]));
        }
    }
    
    // User Methods
    async getUser(username, password) {
        if (this.useLocalStorage) {
            const users = JSON.parse(localStorage.getItem('electrical_users') || '[]');
            return users.find(u => u.username === username && u.password === password);
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const user = request.result.find(u => 
                    u.username === username && u.password === password
                );
                resolve(user);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    // Project Methods
    async getProjects() {
        if (this.useLocalStorage) {
            return JSON.parse(localStorage.getItem('electrical_projects') || '[]');
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readonly');
            const store = transaction.objectStore('projects');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async addProject(project) {
        const newProject = {
            ...project,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (this.useLocalStorage) {
            const projects = JSON.parse(localStorage.getItem('electrical_projects') || '[]');
            projects.push(newProject);
            localStorage.setItem('electrical_projects', JSON.stringify(projects));
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
    
    // Item Methods
    async getItems(projectId = null) {
        if (this.useLocalStorage) {
            const items = JSON.parse(localStorage.getItem('electrical_items') || '[]');
            if (projectId) {
                return items.filter(item => item.projectId === projectId);
            }
            return items;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['items'], 'readonly');
            const store = transaction.objectStore('items');
            const request = store.getAll();
            
            request.onsuccess = () => {
                let items = request.result;
                if (projectId) {
                    items = items.filter(item => item.projectId === projectId);
                }
                resolve(items);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async addItem(item) {
        const newItem = {
            ...item,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };
        
        if (this.useLocalStorage) {
            const items = JSON.parse(localStorage.getItem('electrical_items') || '[]');
            items.push(newItem);
            localStorage.setItem('electrical_items', JSON.stringify(items));
            return newItem.id;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['items'], 'readwrite');
            const store = transaction.objectStore('items');
            const request = store.add(newItem);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async updateItem(itemId, updates) {
        if (this.useLocalStorage) {
            const items = JSON.parse(localStorage.getItem('electrical_items') || '[]');
            const index = items.findIndex(item => item.id === itemId);
            if (index !== -1) {
                items[index] = { ...items[index], ...updates };
                localStorage.setItem('electrical_items', JSON.stringify(items));
            }
            return;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['items'], 'readwrite');
            const store = transaction.objectStore('items');
            const request = store.get(itemId);
            
            request.onsuccess = () => {
                const item = request.result;
                if (item) {
                    Object.assign(item, updates);
                    store.put(item);
                }
                resolve();
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async deleteItem(itemId) {
        if (this.useLocalStorage) {
            const items = JSON.parse(localStorage.getItem('electrical_items') || '[]');
            const filtered = items.filter(item => item.id !== itemId);
            localStorage.setItem('electrical_items', JSON.stringify(filtered));
            return;
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['items'], 'readwrite');
            const store = transaction.objectStore('items');
            const request = store.delete(itemId);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    // Backup/Restore
    async createBackup() {
        const projects = await this.getProjects();
        const items = await this.getItems();
        
        return {
            projects,
            items,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    async restoreBackup(data) {
        if (data.projects) {
            if (this.useLocalStorage) {
                localStorage.setItem('electrical_projects', JSON.stringify(data.projects));
            }
        }
        
        if (data.items) {
            if (this.useLocalStorage) {
                localStorage.setItem('electrical_items', JSON.stringify(data.items));
            }
        }
    }
}

// Create global instance
const db = new Database();