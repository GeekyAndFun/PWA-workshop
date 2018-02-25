const admin = require('firebase-admin');
const functions = require('firebase-functions');

const TOPIC = 'all';

admin.initializeApp(functions.config().firebase);

exports.sendPush = functions.database.ref('/messages/{messageId}').onWrite(snapshot => {
    const newData = snapshot.data.val();

    return admin.messaging().sendToTopic(TOPIC, {
        data: {
            author: newData.author,
            text: newData.text,
            timestamp: newData.timestamp.toString()
        }
    });
});

exports.subscribeToTopic = functions.database.ref('/tokens/{tokenId}').onWrite(snapshot => {
    const registrationToken = snapshot.data.key;

    return admin
        .messaging()
        .subscribeToTopic(registrationToken, 'all')
        .then(response => {
            console.log('Successfully subscribed to topic:', response);
        })
        .catch(error => {
            console.error('Error subscribing to topic:', error);
        });
});

