import { appendMessage, cleanUnsentMessages, setupUI, updateUI } from './view.js';

const databaseRef = window.firebase.database().ref('/messages');
const getMessages = (function getMessagesIife() {
    let latestTimestamp = null;

    return function(size = 5) {
        let query = databaseRef.orderByChild('timestamp').startAt(0);
        if (typeof latestTimestamp === 'number') {
            query = query.endAt(latestTimestamp - 1);
        }

        return new Promise((resolve, reject) => {
            if (!navigator.onLine) {
                reject();
            }

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

setupUI(function() {
    getMessagesAndUpdateDb(false);
}, sendMessage);

getMessagesAndUpdateDb(true);

/** GET Messages */
function getMessagesAndUpdateDb(init) {
    getMessages()
        .then(resp => {
            updateUI(resp.messages);
            if (init) {
                onNewMessage(resp.latestTimestamp);
                IndexedDb.deleteAllRecords(AppConfig.dbConfigs.messagesConfig.name).then(() => {
                    resp.messages.forEach(msg => {
                        IndexedDb.updateRecord(AppConfig.dbConfigs.messagesConfig.name, msg);
                    });
                });
            } else {
                resp.messages.forEach(msg => {
                    IndexedDb.updateRecord(AppConfig.dbConfigs.messagesConfig.name, msg);
                });
            }
        })
        .catch(() => {
            if (init) {
                IndexedDb.readRecords(AppConfig.dbConfigs.messagesConfig.name).then(messages => {
                    updateUI(messages.sort((a, b) => a.timestamp < b.timestamp));
                });
            }
        });
}

/** Service Worker */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').then(
        registration => {
            navigator.serviceWorker.onmessage = function(event) {
                if(event.data === AppConfig.BACKGROUND_SYNC) {
                    cleanUnsentMessages();
                }
            };
            setUpMessagingPushNotifications(registration);
        },
        err => {
            console.error(`Oups ${err}`);
        }
    );
}

function setUpMessagingPushNotifications(registration) {
    const messaging = firebase.messaging();
    messaging.useServiceWorker(registration);
    messaging
        .requestPermission()
        .then(() => {
            messaging.getToken().then(token => {
                firebase
                    .database()
                    .ref(`tokens/${token}`)
                    .set(true);
            });
        })
        .catch(() => {
            console.error('No permission...');
        });

    messaging.onMessage(e => console.log(e));
}

function sendMessage(author, text) {
    if (!text) {
        return Promise.resolve();
    }
    const msg = {
        author,
        text,
        timestamp: Date.now()
    };

    if (!navigator.onLine) {
        addMessageToCache(msg, true).then(msg => appendMessage(msg, true));

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => reg.sync.register('sendMessage'));
        }
        return Promise.reject();
    }
    return databaseRef.push(msg);
}

function onNewMessage(latestTimestamp) {
    return databaseRef
        .orderByChild('timestamp')
        .startAt(latestTimestamp + 1 || 0)
        .on('child_added', data => {
            const value = data.val();

            addMessageToCache(value);
            appendMessage(value);
        });
}

function addMessageToCache(message, unsent) {
    return new Promise((resolve, reject) => {
        IndexedDb.getStoreKeys(AppConfig.dbConfigs.messagesConfig.name).then(storeKeys => {
            if (storeKeys.indexOf(message.timestamp) === -1) {
                const newMessage = Object.assign({}, message, { unsent });
                IndexedDb.pushRecord(AppConfig.dbConfigs.messagesConfig.name, newMessage).then(() => {
                    resolve(newMessage);
                });
            } else {
                reject();
            }
        });
    });
}
