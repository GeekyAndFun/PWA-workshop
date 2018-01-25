const databaseRef = window.firebase.database().ref('/messages');
let latestMessageId = null;

export const setupServiceWorgers = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../geeky-service-worker.js').then(
            registration => {
                console.log(`ServiceWorker registration successful with scope: ${registration.scope}`);
            },
            err => {
                console.error(`Service Worker failed ${err}`);
            }
        );
    }
};

export function getExistingMessages() {
    return new Promise((resolve, reject) => {
        let messages = [];

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
            let value = data.val();

            if (data.key !== latestMessageId) {
                callback(value);
            }
        });
}

export function sendMessage(text) {
    if (!text) {
        return Promise.resolve();
    } else {
        return databaseRef.push({
            author: window.localStorage.getItem('author'),
            text,
            timestamp: Date.now()
        });
    }
}
