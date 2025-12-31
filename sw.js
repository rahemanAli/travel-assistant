const CACHE_NAME = 'travel-ai-v1';
const ASSETS = [
    './index.html',
    './manifest.json',
    './src/styles/variables.css',
    './src/styles/global.css',
    './src/styles/utils.css',
    './src/styles/components.css',
    './src/styles/checklist.css',
    './src/styles/itinerary.css',
    './src/js/app.js',
    './src/js/components/AppShell.js',
    './src/js/components/Navigation.js',
    './src/js/components/TripSetupForm.js',
    './src/js/components/Checklist.js',
    './src/js/components/Itinerary.js',
    './src/js/components/Budget.js',
    './src/js/components/Booking.js',
    './src/js/logic/Router.js',
    './src/js/logic/TripStore.js',
    './src/js/logic/checklistGenerator.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    // API or POST requests: Network Only (Do not cache)
    if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
        return;
    }

    // Static Assets: Stale While Revalidate
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});
