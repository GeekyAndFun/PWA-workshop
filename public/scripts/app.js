import { appendMessage, setupUI, updateUI } from './view.js';

const databaseRef = window.firebase.database().ref('/messages');
const getMessages = (function getMessagesIife() {
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

                    resolve({
                        messages,
                        latestTimestamp: messages[messages.length - 1].timestamp
                    });
                } else {
                    resolve({
                        messages,
                        latestTimestamp
                    });
                }
            });
        });
    };
})();

setupUI(function() {
    getMessages().then(resp => {
        updateUI(resp.messages);
    });
}, sendMessage);

getMessages().then(resp => {
    updateUI(resp.messages);
    onNewMessage(resp.latestTimestamp);
});

function sendMessage(author, text) {
    if (!text) {
        return Promise.resolve();
    }
    const msg = {
        author,
        text,
        timestamp: Date.now()
    };

    return databaseRef.push(msg);
}

function onNewMessage(latestTimestamp) {
    return databaseRef
        .orderByChild('timestamp')
        .startAt(latestTimestamp + 1 || 0)
        .on('child_added', data => {
            const value = data.val();

            appendMessage(value);
        });
}
