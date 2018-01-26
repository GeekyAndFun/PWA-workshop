const databaseRef = window.firebase.database().ref('/messages');
// const tokensRef = window.firebase.database().ref('/tokens');

let latestMessageId = null;

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
                console.log(token);
            });
        })
        .catch(() => {
            console.error('No permission...');
        });
}

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
    const msg = {
        author,
        text,
        timestamp: Date.now()
    };
    // TODO - gracefully degrade this to a script which auto sends when network is back.
    // It won't work in the background, but at least it will auto send when the app opened.
    if (!isOnline && 'serviceWorker' in navigator) {
        IndexedDb.insertRecord('UnsentMsg', msg);
        return navigator.serviceWorker.ready.then((reg) => {
            reg.sync.register('sendMessage');
        });
    }

    return databaseRef.push(msg);
}
