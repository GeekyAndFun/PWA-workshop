importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-database.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

importScripts('./indexeddb.js');

/** Caching */
const CACHE_NAME = 'geekyResources';
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/public/style.css',
    '/public/images/icon.png',
    '/public/images/icon--flipped.png',
    '/public/scripts/pre-data-ui.js'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
});
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(rsp => {
                const rspCopy = rsp.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, rspCopy);
                });
                return rsp;
            })
            .catch(() => caches.match(event.request))

        /*
                caches.open(CACHE_NAME).then(cache =>
                cache.match(event.request).then(
                response => response || fetch(event.request)
                // If we want to add it to cache...
                // .then(rsp => {
                //     cache.put(event.request, rsp.clone());
                //     return rsp;
                // })
            )
        )
            */
    );
});

/** Background Push of messages */
const config = {
    apiKey: 'AIzaSyA6NrtU7Y-wcLH3UQnWDYNtRQvxWwYHTb4',
    authDomain: 'geek-alert.firebaseapp.com',
    databaseURL: 'https://geek-alert.firebaseio.com',
    projectId: 'geek-alert',
    storageBucket: '',
    messagingSenderId: '1044469279944'
};
firebase.initializeApp(config);

const databaseRef = firebase.database().ref('/messages');

async function sendMessage() {
    await IndexedDb.setupDbConnection('GeekyDatabase', 1);
    const unsentMessages = await IndexedDb.readRecords('UnsentMsg');

    return Promise.all(unsentMessages.map(msg => databaseRef.push(msg).then(() => {
        IndexedDb.deleteRecord('UnsentMsg', msg.timestamp);
    })));
}

self.addEventListener('sync', event => {
    if (event.tag === 'sendMessage') {
        event.waitUntil(sendMessage());
    }
});

/** Push Notifications */
firebase.messaging().setBackgroundMessageHandler(onPushNotification);

function onPushNotification(payload) {
    const title = 'Geeky & Fun';
    return self.registration.showNotification(title, {
        icon: './resources/icons/icon-512x512.png',
        body: `${payload.author}: ${payload.text} | ${Utils.getDateString()}`
    });
}
