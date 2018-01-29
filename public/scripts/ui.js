import { getAuthor, setAuthor } from './app.js';
import { getMessages, onNewMessage, sendMessage, retrieveCachedMessages } from './messaging-service.js';

const mainContainer = document.getElementsByClassName('container')[0];
const messagesContainer = document.getElementById('messagesWrapper');
const textarea = document.getElementsByTagName('textarea')[0];
const nameInput = document.getElementById('nameInput');

export function setupUI() {
    getMessages().then(resp => {
        const messagesFragment = new DocumentFragment();

        resp.messages.forEach(msg =>
            messagesFragment.appendChild(createMessageDOM(msg.author, msg.text, new Date(msg.timestamp)))
        );
        messagesContainer.appendChild(messagesFragment);

        mainContainer.scrollTo(0, mainContainer.scrollHeight);

        onNewMessage(resp.latestTimestamp, message => {
            messagesContainer.appendChild(createMessageDOM(message.author, message.text, new Date(message.timestamp)));
        });
    });

    document.getElementById('sendMessage').addEventListener('click', () => {
        // TODO: get the user from the login service. indexdb should only be used to log in the user if there was an active session
        // before closing the app last time
        sendMessage(nameInput.value, textarea.value).then(
            () => {
                textarea.value = null;
            },
            err => console.error(err)
        );
    });

    mainContainer.addEventListener('scroll', lazyDebounce(onScrollTop, 250));

    nameInput.addEventListener(
        'input',
        lazyDebounce(function() {
            setAuthor(this.value);
        }, 500)
    );
}
export function displayAuthor() {
    // TODO: get the user from the login service. indexdb should only be used to log in the user if there was an active session
    // before closing the app last time
    getAuthor().then(author => {
        nameInput.value = author;
    });
}

function onScrollTop(e) {
    const { scrollTop } = e.srcElement;

    if (scrollTop === 0) {
        toggleLoadingNotification(true);
        getMessages().then(resp => {
            if (resp.messages.length === 0) {
                toggleLoadingNotification(false);
            }
            const tempMessagesFragment = new DocumentFragment();

            resp.messages.forEach(msg =>
                tempMessagesFragment.appendChild(createMessageDOM(msg.author, msg.text, new Date(msg.timestamp)))
            );
            const previousHeight = mainContainer.scrollHeight;

            messagesContainer.insertBefore(tempMessagesFragment, messagesContainer.firstChild);
            mainContainer.scrollTop = mainContainer.scrollHeight - previousHeight;
        });
    }
}

const toggleLoadingNotification = (function toggleNotificationIife() {
    const spinner = document.getElementById('spinner');

    return function(visible = true) {
        spinner.style.display = visible ? 'block' : 'none';
    };
}());

export async function paintCachedMessages() {
    const cachedMessages = await retrieveCachedMessages();

    if (cachedMessages.length) {
        const messageDom = cachedMessages.reduce((msgFragment, msg) => {
            msgFragment.appendChild(createMessageDOM(msg.author, msg.text, new Date(msg.timestamp)));
            return msgFragment;
        }, new DocumentFragment());

        messagesContainer.appendChild(messageDom);
    }
}

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

function lazyDebounce(callback, delay) {
    let timeout = null;
    return function(e) {
        if (timeout) {
            window.clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            callback.call(this, e);
        }, delay);
    };
}
