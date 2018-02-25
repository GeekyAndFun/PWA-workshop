import { appendMessage, setupUI, updateUI } from './simple-ui.js';

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
            onNewMessage(resp.latestTimestamp);
            if (init) {
                IndexedDb.deleteAllRecords(AppConfig.dbConfigs.messagesConfig.name);
            }
            resp.messages.forEach(msg => {
                IndexedDb.updateRecord(AppConfig.dbConfigs.messagesConfig.name, msg);
            });
        })
        .catch(() => {
            setTimeout(() => {
                IndexedDb.readRecords(AppConfig.dbConfigs.messagesConfig.name).then(messages => {
                    updateUI(messages.sort((a, b) => a.timestamp < b.timestamp));
                });
            }, 1000);
        });
}

/** Service Worker */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../../service-worker.js').then(
        registration => {
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

// SEND MESSAGE
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
        addMessageToCache(msg, true); // always cache latest stuff
        appendMessage(msg);

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

            addMessageToCache(value).then(appendMessage);
            // appendMessage(value);
        });
}

function addMessageToCache(message, unsent) {
    return new Promise((resolve, reject) => {
        IndexedDb.getStoreKeys(AppConfig.dbConfigs.messagesConfig.name).then(storeKeys => {
            if (storeKeys.indexOf(message.timestamp) === -1) {
                // if (storeKeys.length >= 20) {
                //     IndexedDb.shiftRecord(AppConfig.dbConfigs.messagesConfig.name);
                // }
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
