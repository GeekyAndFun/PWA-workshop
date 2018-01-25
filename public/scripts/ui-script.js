import { getExistingMessages, onNewMessage, sendMessage } from './app-script.js';

let messagesContainer = document.getElementById('messagesWrapper');
let textarea = document.getElementsByTagName('textarea')[0];

function SetupUI() {
    getExistingMessages().then(resp => {
        const messagesFragment = new DocumentFragment();

        resp.forEach(msg =>
            messagesFragment.appendChild(createMessageDOM(msg.author, msg.text, new Date(msg.timestamp)))
        );
        messagesContainer.appendChild(messagesFragment);

        onNewMessage(function displayMessage(message) {
            messagesContainer.appendChild(createMessageDOM(message.author, message.text, new Date(message.timestamp)));
        });
    });

    document.getElementById('sendMessage').addEventListener('click', function onMessageSend() {
        sendMessage(textarea.value).then(
            resp => {
                textarea.value = null;
            },
            err => console.error(err)
        );
    });
}

export default SetupUI;

/** Utility Functions */
function createMessageDOM(author, text, dateObject = new Date()) {
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
