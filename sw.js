// sw.js - Professional Version
const CACHE_NAME = 'professional-accounting-v2';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  
  // CSS
  '/css/matrix.css',
  '/css/styles.css',
  '/css/auth.css',
  
  // JavaScript
  '/js/matrix.js',
  '/js/database.js',
  '/js/auth.js',
  '/js/app.js',
  
  // Fonts
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&family=Cairo:wght@300;400;600;700&display=swap',
  
  // Icons
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css',
  
  // Chart.js
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - precache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Precaching professional assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('✅ Precaching complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🔄 Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) return;

  // Handle API requests separately
  if (event.request.url.includes('/api/')) {
    event.respondWith(handleApiRequest(event));
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(event));
});

async function handleApiRequest(event) {
  try {
    // Try network first for API requests
    const networkResponse = await fetch(event.request);
    
    // Clone the response to store in cache
    const clonedResponse = networkResponse.clone();
    
    // Cache successful API responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, clonedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, trying cache for API:', event.request.url);
    
    // Try cache as fallback
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API
    return new Response(
      JSON.stringify({ 
        error: 'You are offline',
        timestamp: new Date().toISOString()
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleNavigationRequest(event) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(event.request);
    
    // Update cache
    const cache = await caches.open(CACHE_NAME);
    cache.put(event.request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed for navigation, serving from cache');
    
    // Try cache
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline page
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Create basic offline response
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>غير متصل</title>
        <style>
          body {
            font-family: 'Tajawal', sans-serif;
            background: #121826;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
            padding: 20px;
          }
          .offline-container {
            max-width: 400px;
          }
          h1 {
            color: #FF9800;
            margin-bottom: 20px;
          }
          p {
            color: #B0B7C3;
            margin-bottom: 30px;
          }
          .retry-button {
            background: #4A6FA5;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Tajawal', sans-serif;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <h1>⚠️ أنت غير متصل بالإنترنت</h1>
          <p>لا يمكن تحميل الصفحة المطلوبة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.</p>
          <button class="retry-button" onclick="window.location.reload()">إعادة المحاولة</button>
        </div>
      </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

async function handleStaticRequest(event) {
  // Cache first for static assets
  const cachedResponse = await caches.match(event.request);
  
  if (cachedResponse) {
    // Update cache in background
    event.waitUntil(updateCache(event.request));
    return cachedResponse;
  }
  
  // If not in cache, try network
  try {
    const networkResponse = await fetch(event.request);
    
    // Cache the response
    const cache = await caches.open(CACHE_NAME);
    cache.put(event.request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed for static asset:', event.request.url);
    
    // Return 404 for missing assets
    return new Response('Not Found', { status: 404 });
  }
}

async function updateCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response);
    }
  } catch (error) {
    console.log('Failed to update cache:', error);
  }
}

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    // Sync each item
    for (const data of offlineData) {
      await syncDataItem(data);
    }
    
    console.log('✅ Background sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

async function getOfflineData() {
  // This would get data from IndexedDB
  // For now, return empty array
  return [];
}

async function syncDataItem(data) {
  // Sync a single data item with the server
  // Implementation depends on your API
}

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'إشعار جديد',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'general',
    data: data.data || {},
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'نظام المحاسبة', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action) {
    // Handle action buttons
    console.log('Action clicked:', event.action);
  } else {
    // Handle notification click
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Focus existing window or open new one
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});