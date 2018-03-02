const CACHE_VERSION = 1;
const CACHE_NAME = `GEEKY-CACHE-${CACHE_VERSION}`;
const PRECACHE_MANIFEST = 'resources-manifest.json';

importScripts('./appConfig.js');
importScripts('./common.js');

/** Firebase Init */
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-database.js');

self.addEventListener('install', event => {
    event.waitUntil(
        new Promise((resolve, reject) => {
            caches
                .open(CACHE_NAME)
                .then(cache => {
                    fetch(PRECACHE_MANIFEST).then(resp => {
                        resp.json().then(jsonResp => {
                            Promise.all(
                                jsonResp.TO_PRECACHE.map(url =>
                                    fetch(url).then(resp => {
                                        cache.put(url, resp);
                                    })
                                )
                            ).then(resolve);
                        });
                    });
                })
                .catch(reject);
        })
    );
});

self.addEventListener('activate', function onActivate(event) {
    firebase.initializeApp(AppConfig.FIREBASE_CONFIG);

    event.waitUntil(
        caches.keys().then(keys => {
            keys.filter(key => key !== CACHE_NAME).forEach(key => caches.delete(key));
        })
    );
});

self.addEventListener('fetch', function onFetch(event) {
    if (event.request.url.indexOf(location.origin) === 0) {
        event.respondWith(precacheResourceOrNetwork(event));
    }
});

function precacheResourceOrNetwork(event) {
    const clonedRequest = event.request.clone();
    return caches.match(event.request, {
        cacheName: CACHE_NAME
    }).then(resp => resp || fetch(clonedRequest));
}
