const CACHE_VERSION = 1;
const CACHE_NAME = `GEEKY-CACHE-${CACHE_VERSION}`;
const PRECACHE_MANIFEST = 'resources-manifest.json';
const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyA6NrtU7Y-wcLH3UQnWDYNtRQvxWwYHTb4',
    authDomain: 'geek-alert.firebaseapp.com',
    databaseURL: 'https://geek-alert.firebaseio.com',
    projectId: 'geek-alert',
    storageBucket: '',
    messagingSenderId: '1044469279944'
};

let databaseRef;

self.addEventListener('install', event => {
    event.waitUntil(
        new Promise((resolve, reject) => {
            importScripts('./appConfig.js');
            importScripts('./common.js');

            /** Firebase Init */
            importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
            importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-database.js');
            importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

            firebase.initializeApp(FIREBASE_CONFIG);
            databaseRef = firebase.database().ref('/messages');
            firebase.messaging().setBackgroundMessageHandler(displayNotification);

            /** Precache init */
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
    event.waitUntil(
        caches.keys().then(keys => {
            keys.filter(key => key !== CACHE_NAME).forEach(key => caches.delete(key));
        })
    );
});

self.addEventListener('sync', event => {
    if (event.tag === 'sendMessage') {
        event.waitUntil(
            self.sendCachedMessages(databaseRef).then(() => {
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => client.postMessage(AppConfig.BACKGROUND_SYNC));
                });
                displayNotification({
                    data: {
                        text: 'Messages have been sent in the background!',
                        author: 'App',
                        timestamp: Date.now()
                    }
                });
            })
        );
    }
});

self.addEventListener('fetch', function onFetch(event) {
    if (event.request.url.indexOf(location.origin) === 0) {
        event.respondWith(precacheResourceOrNetwork(event));
    }
});

function precacheResourceOrNetwork(event) {
    return caches
        .match(event.request, { cacheName: CACHE_NAME })
        .then(resp => resp || fetch(event.request))
        .catch(() => fetch(event.request));
}

function displayNotification(payload) {
    const title = 'Geeky & Fun';

    return self.registration.showNotification(title, {
        icon: 'https://geekyandfun.github.io/PWA-workshop/public/images/icons/icon-512x512.png',
        body: `${payload.data.text}${payload.data.author} | ${self.getDateString(
            new Date(Number(payload.data.timestamp))
        )}`,
        tag: 'common-tag',
        vibrate: [100, 50, 100, 50, 100, 50],
        requireInteraction: false
    });
}
