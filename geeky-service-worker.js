importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-database.js');

// Initialize Firebase
const config = {
    apiKey: 'AIzaSyA6NrtU7Y-wcLH3UQnWDYNtRQvxWwYHTb4',
    authDomain: 'geek-alert.firebaseapp.com',
    databaseURL: 'https://geek-alert.firebaseio.com',
    projectId: 'geek-alert',
    storageBucket: '',
    messagingSenderId: '1044469279944',
};
console.log('updateaza sw in pula mea!');
firebase.initializeApp(config);

const databaseRef = firebase.database().ref('/messages');

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

function sendMessage() {
    console.log('in sendul din service worker');
    return databaseRef.push({
        author: 'badea',
        text: 'hamster din offline ',
        timestamp: Date.now(),
    });
}

self.addEventListener('sync', (event) => {
    if (event.tag === 'sendMessage') {
        event.waitUntil(sendMessage());
    }
});
