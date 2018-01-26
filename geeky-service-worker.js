/** Caching */
importScripts('./caching-service-worker.js');

/** Firebase Init */
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-database.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

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

/** Background Push of messages */
self.addEventListener('sync', event => {
    if (event.tag === 'sendMessage') {
        event.waitUntil(sendMessage());
    }
});

function sendMessage() {
    return databaseRef.push({
        author: 'badea',
        text: 'hamster din offline ',
        timestamp: Date.now()
    });
}

/** Push Notifications */
firebase.messaging().setBackgroundMessageHandler(onPushNotification);

function onPushNotification(payload) {
    const title = 'Geeky & Fun';
    return self.registration.showNotification(title, {
        icon: './resources/icons/icon-512x512.png',
        body: `${payload.author}: ${payload.text} | ${Utils.getDateString()}`
    });
}
