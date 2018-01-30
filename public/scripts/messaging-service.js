// Server and DB communication
const databaseRef = window.firebase.database().ref('/messages');

let hasServiceWorker = false;

async function addMessageToCache(message, unsent) {
    const storeKeys = await IndexedDb.getStoreKeys(AppConfig.dbConfigs.messagesConfig.name);
    if (storeKeys.indexOf(message.timestamp) === -1) {
        if (storeKeys.length >= 20) {
            IndexedDb.shiftRecord(AppConfig.dbConfigs.messagesConfig.name);
        }
        IndexedDb.pushRecord(AppConfig.dbConfigs.messagesConfig.name, Object.assign({}, message, { unsent }));
    }
}

export function setUpMessagingPushNotifications(registration) {
    const messaging = firebase.messaging();
    messaging.useServiceWorker(registration);
    messaging
        .requestPermission()
        .then(() => {
            // pushCheckbox.checked = true;

            messaging.getToken().then(token => {
                firebase
                    .database()
                    .ref(`tokens/${token}`)
                    .set(true);

                console.log(token);
            });
        })
        .catch(() => {
            console.error('No permission...');
        });

    messaging.onMessage(e => console.log(e));
}

export const getMessages = (function getMessagesIife() {
    let latestTimestamp = null;

    return function(size = 5) {
        let query = databaseRef.orderByChild('timestamp').startAt(0);
        if (typeof latestTimestamp === 'number') {
            query = query.endAt(latestTimestamp - 1);
        }

        return new Promise(resolve => {
            query.limitToLast(size).once('value', resp => {
                const messages = [];

                resp.forEach(snapshot => {
                    const value = snapshot.val();

                    messages.push(value);
                });

                if (messages.length > 0) {
                    latestTimestamp = messages[0].timestamp;

                    resolve({ messages, latestTimestamp: messages[messages.length - 1].timestamp });
                } else {
                    resolve({ messages, latestTimestamp });
                }
            });
        });
    };
}());

export function onNewMessage(latestTimestamp, updateModelCallback) {
    return databaseRef
        .orderByChild('timestamp')
        .startAt(latestTimestamp + 1 || 0)
        .on('child_added', data => {
            const value = data.val();
            addMessageToCache(value);
            updateModelCallback([value]);
        });
}

export function sendMessage(author, text) {
    if (!text) {
        return Promise.resolve();
    }
    const msg = {
        author,
        text,
        timestamp: Date.now()
    };

    addMessageToCache(msg, true); // always cache latest stuff
    if (!window.isOnline) {
        if (hasServiceWorker) {
            navigator.serviceWorker.ready.then(reg => reg.sync.register('sendMessage'));
        }
        return Promise.reject();
    }
    return databaseRef.push(msg);
}

export function retrieveCachedMessages() {
    return IndexedDb.readRecords(AppConfig.dbConfigs.messagesConfig.name);
}

export function onServiceWorkerInit(result, registration = null) {
    if (result) {
        hasServiceWorker = true;

        setUpMessagingPushNotifications(registration);
    } else {
        hasServiceWorker = false;
        window.addEventListener('online', () => {
            window.sendCachedMessages(databaseRef).then(() => console.log('sent messages'));
        });
    }
}
