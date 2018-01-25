import { updateRecord, readRecord } from './indexdb-wrapper.js';

const databaseRef = window.firebase.database().ref('/messages');

let latestMessageId = null;
let isOnline = true;

const updateOnlineStatus = () => {
    console.log('online toggle', navigator.onLine);
    isOnline = navigator.onLine;
};

window.addEventListener('load', () => {
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('online', updateOnlineStatus);
});

export const setupServiceWorkers = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../../geeky-service-worker.js').then(
            registration => {
                console.log(`ServiceWorker registration successful with scope: ${registration.scope}`);
            },
            err => {
                console.error(`Service Worker failed ${err}`);
            }
        );

        // new Promise(((resolve, reject) => {
        //     Notification.requestPermission((result) => {
        //         if (result !== 'granted') return reject(Error('Denied notification permission'));
        //         resolve();
        //     });
        // })).then(() => navigator.serviceWorker.ready).then((reg) => {
        //     console.log(reg);
        //     reg.sync.register('syncTest');
        // });
    }
};

export function getExistingMessages() {
    return new Promise(resolve => {
        const messages = [];

        databaseRef.once('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                const value = childSnapshot.val();

                latestMessageId = childSnapshot.key;
                messages.push(value);
            });

            resolve(messages);
        });
    });
}

export function onNewMessage(callback) {
    return databaseRef
        .orderByKey()
        .startAt(latestMessageId || '')
        .on('child_added', data => {
            const value = data.val();

            if (data.key !== latestMessageId) {
                callback(value);
            }
        });
}

export function sendMessage(author, text) {
    if (!text) {
        return Promise.resolve();
    }

    if (!isOnline && 'serviceWorker' in navigator) {
        return navigator.serviceWorker.ready.then((reg) => {
            reg.sync.register('sendMessage');
        });
    }

    return databaseRef.push({
        author,
        text,
        timestamp: Date.now()
    });
}

/** DATABASE */
export function setAuthor(name) {
    return updateRecord('AuthorStore', name, 'currentAuthor');
}

export function getAuthor() {
    // TODO: write login service and get author from there. Index db should only hold the logged user in bettween sessions
    return readRecord('AuthorStore', 'currentAuthor').then(author => author || 'John Doe');
}