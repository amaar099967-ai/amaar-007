// Service Worker
const CACHE_NAME = 'electrical-calculations-v1';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll([
                '/',
                '/index.html',
                '/manifest.json',
                '/css/matrix.css',
                '/css/styles.css',
                '/css/auth.css',
                '/js/matrix.js',
                '/js/database.js',
                '/js/auth.js',
                '/js/app.js'
            ]))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});