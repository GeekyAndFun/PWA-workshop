const databaseRef = window.firebase.database().ref('/messages');
const tokensRef = window.firebase.database().ref('/tokens');

let isOnline = true;

const updateOnlineStatus = () => {
    isOnline = navigator.onLine;
};

window.addEventListener('load', () => {
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('online', updateOnlineStatus);
});

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

    return function(size = 20, startAgain = false) {
        if (startAgain === true) {
            latestTimestamp = null;
        }

        let query = databaseRef.orderByChild('timestamp').startAt(0);
        if (typeof latestTimestamp === 'number') {
            query = query.endAt(latestTimestamp);
        }

        return new Promise(resolve => {
            query.limitToLast(size).once('value', resp => {
                let index = 0;
                const messages = [];

                resp.forEach(snapshot => {
                    const value = snapshot.val();

                    messages.push(value);

                    if (index === 0) {
                        latestTimestamp = value.timestamp - 1;
                        index += 1;
                    }
                });
                resolve({ messages, latestTimestamp: latestTimestamp + 2 });
            });
        });
    };
}());

export function onNewMessage(latestTimestamp, callback) {
    return databaseRef
        .orderByChild('timestamp')
        .startAt(latestTimestamp || 0)
        .on('child_added', data => {
            const value = data.val();

            if (data.key !== latestTimestamp) {
                callback(value);
            }
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
    // TODO - gracefully degrade this to a script which auto sends when network is back.
    // It won't work in the background, but at least it will auto send when the app opened.
    if (!isOnline && 'serviceWorker' in navigator) {
        IndexedDb.insertRecord(AppConfig.dbConfigs.messagesConfig.name, Object.assign({}, msg, { unsent: true }));
        return navigator.serviceWorker.ready.then((reg) => {
            reg.sync.register('sendMessage');
        });
    }

    IndexedDb.insertRecord(AppConfig.dbConfigs.messagesConfig.name, msg);
    return databaseRef.push(msg);
}

export function retrieveCachedMessages() {
    return IndexedDb.readRecords(AppConfig.dbConfigs.messagesConfig.name);
}
