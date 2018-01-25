self.addEventListener('install', (event) => {
    console.log('install', event);
    console.log('caches', caches);
    event.waitUntil(caches.open('appResources').then((cache) => {
        console.log(cache, 'ce plm');
        return cache.addAll([
            '/public/main.js',
            '/public/scripts/app.js',
            '/public/scripts/ui.js',
            '/public/scripts/pre-data-ui.js',
        ]);
    }));
});
self.addEventListener('fetch', (event) => {
    console.log(event);
    // event.respondWith(caches.open('appResources')
    //     .then(cache => cache.match(event.request)
    //         .then(response => response || fetch(event.request)
    //             .then((rsp) => {
    //                 cache.put(event.request, rsp.clone());
    //                 return rsp;
    //             }))));
});

self.addEventListener('sync', (event) => {
    console.log('ceva fin', event);
});
