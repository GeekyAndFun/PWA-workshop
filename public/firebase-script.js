let databaseRef = window.firebase.database().ref('/messages');
let messagesContainer = document.getElementById('messagesWrapper');

(function setupMessage() {
    let messagesFragment = new DocumentFragment();
    let latestMessageId = null;

    /** Get the existing messages */

    // toggleLoadingOfMessages();
    databaseRef.once('value', function getDatabaseOnce(snapshot) {
        // toggleLoadingOfMessages();
        snapshot.forEach(function(childSnapshot) {
            let value = childSnapshot.val();

            latestMessageId = childSnapshot.key;
            messagesFragment.appendChild(createDomElementForAlert(value.author, value.text, new Date(value.timestamp)));
        });

        messagesContainer.appendChild(messagesFragment);

        /** Listen for new messages coming in */
        databaseRef
            .orderByKey()
            .startAt(latestMessageId || '')
            .on('child_added', function(data) {
                let value = data.val();

                if (data.key === latestMessageId) {
                    return;
                }

                messagesContainer.appendChild(createDomElementForAlert(value.author, value.text));
            });
    });

    //Setup name modification
    document.getElementById('nameInput').addEventListener('input', function onNameChange(e){
        window.localStorage.setItem('author', )
    });

    // Setup message sending
    let textarea = document.getElementsByTagName('textarea')[0];
    document.getElementById('sendMessage').addEventListener('click', function onMessageSend() {
        databaseRef
            .push({
                author: window.localStorage.getItem('author'),
                text: textarea.value,
                timestamp: Date.now()
            })
            .then(resp => (textarea.value = null))
            .catch(err => console.error(err));
    });
})();

/** UTILITY FUNCTIONS */
function createDomElementForAlert(author, text, dateObject = new Date()) {
    let element = document.createElement('div');
    element.classList.add('msg');

    let dateString = getDateString(dateObject);

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
