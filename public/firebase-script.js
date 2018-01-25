const databaseRef = window.firebase.database().ref('/messages');
const messagesContainer = document.getElementById('messagesWrapper');

(function setupMessage() {
    const messagesFragment = new DocumentFragment();
    let latestMessageId = null;

    /** Get the existing messages */

    // toggleLoadingOfMessages();
    databaseRef.once('value', (snapshot) => {
        // toggleLoadingOfMessages();
        snapshot.forEach((childSnapshot) => {
            const value = childSnapshot.val();

            latestMessageId = childSnapshot.key;
            messagesFragment.appendChild(createDomElementForAlert(value.author, value.text, new Date(value.timestamp)));
        });

        messagesContainer.appendChild(messagesFragment);

        /** Listen for new messages coming in */
        databaseRef
            .orderByKey()
            .startAt(latestMessageId || '')
            .on('child_added', (data) => {
                const value = data.val();

                if (data.key === latestMessageId) {
                    return;
                }

                messagesContainer.appendChild(createDomElementForAlert(value.author, value.text));
            });
    });

    // Setup message sending
}());

/** UTILITY FUNCTIONS */
function createDomElementForAlert(author, text, dateObject = new Date()) {
    const element = document.createElement('div');
    element.classList.add('msg');

    const dateString = getDateString(dateObject);

    element.innerHTML = `<p class="msg__text">${text}</p><p class="msg_author">${author} | ${dateString}</p>`;
    return element;
}

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
