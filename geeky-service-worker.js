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
self.addEventListener('install', () => {
    /** Caching */
    importScripts('./caching-service-worker.js');

    /** Firebase Init */
    importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
    importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-database.js');
    importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

    importScripts('./indexeddb.js');
    importScripts('./appConfig.js');
    console.log('mama ta nu se reincarca 2');
});
async function sendMessage() {
    await IndexedDb.setupDbConnection(AppConfig.dbName, AppConfig.dbVersion);
    const cachedMessages = await IndexedDb.readRecords(AppConfig.dbConfigs.messagesConfig.name);
    const unsentMessages = cachedMessages.filter(record => record.unsent);

    return Promise.all(unsentMessages.map(msg => databaseRef.push(msg).then(() => {
        IndexedDb.updateRecord(AppConfig.dbConfigs.messagesConfig, Object.assign({}, msg, { unsent: false }), msg.timestamp);
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
        icon: 'https://geekyandfun.github.io/PWA-workshop/public/images/icons/icon-512x512.png',
        body: `${payload.data.text}
${payload.data.author} | ${getDateString(new Date(Number(payload.data.timestamp)))}`
    });
}

/** Utils */
function getDateString(dateObject) {
    let hours = dateObject.getHours();
    if (hours < 10) {
        hours = `0${hours}`;
    }

    let minutes = dateObject.getMinutes();
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }

    return `${hours}:${minutes}`;
}
