// Service Worker for offline functionality
const CACHE_NAME = 'sua-parte-v1';
const OFFLINE_CACHE_NAME = 'sua-parte-offline-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Core CSS and JS files will be added dynamically
];

// API endpoints to cache for offline use
const apiEndpoints = [
  '/api/estudantes',
  '/api/programas',
  '/api/designacoes',
  '/api/profile'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching core pages');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to cache core assets:', error);
      })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  
  const cacheWhitelist = [CACHE_NAME, OFFLINE_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim clients to handle requests immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement cache-aside pattern
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip caching for non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests with cache-aside pattern
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static assets with cache-first strategy
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }
  
  // Handle navigation requests with network-first fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
});

// Handle API requests with cache-aside pattern
async function handleApiRequest(request) {
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      caches.open(OFFLINE_CACHE_NAME).then((cache) => {
        cache.put(request, responseClone);
      });
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    console.log('[Service Worker] Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // If no cache, return error response
    return new Response(JSON.stringify({ error: 'Network error and no cached data' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache, fetch and cache
  try {
    const networkResponse = await fetch(request);
    const responseClone = networkResponse.clone();
    
    // Cache successful responses
    if (networkResponse.ok) {
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseClone);
      });
    }
    
    return networkResponse;
  } catch (error) {
    // Return error response
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Handle navigation requests with network-first strategy
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    console.log('[Service Worker] Network failed for navigation, trying cache');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, serve offline fallback page
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // If no offline page, return basic offline message
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <h1>Sem conexão</h1>
          <p>Você está offline. Conecte-se à internet para continuar usando o sistema.</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Determine if a request is for a static asset
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_OFFLINE_DATA') {
    console.log('[Service Worker] Caching offline data');
    cacheOfflineData(event.data.payload);
  }
  
  if (event.data && event.data.type === 'SYNC_DATA') {
    console.log('[Service Worker] Syncing data');
    syncOfflineData();
  }
});

// Cache offline data sent from client
async function cacheOfflineData(data) {
  try {
    // Cache estudantes
    if (data.estudantes) {
      const estudantesRequest = new Request('/api/estudantes/offline', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const estudantesResponse = new Response(JSON.stringify(data.estudantes), {
        headers: { 'Content-Type': 'application/json' }
      });
      
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      await cache.put(estudantesRequest, estudantesResponse);
    }
    
    // Cache programas
    if (data.programas) {
      const programasRequest = new Request('/api/programas/offline', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const programasResponse = new Response(JSON.stringify(data.programas), {
        headers: { 'Content-Type': 'application/json' }
      });
      
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      await cache.put(programasRequest, programasResponse);
    }
    
    // Cache designacoes
    if (data.designacoes) {
      const designacoesRequest = new Request('/api/designacoes/offline', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const designacoesResponse = new Response(JSON.stringify(data.designacoes), {
        headers: { 'Content-Type': 'application/json' }
      });
      
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      await cache.put(designacoesRequest, designacoesResponse);
    }
    
    console.log('[Service Worker] Offline data cached successfully');
  } catch (error) {
    console.error('[Service Worker] Error caching offline data:', error);
  }
}

// Sync offline data with server
async function syncOfflineData() {
  // This would be implemented to sync pending changes when online
  console.log('[Service Worker] Data sync would happen here');
}