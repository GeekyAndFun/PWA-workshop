import { getAuthor, setAuthor } from './app.js';
import { sendMessage } from './messaging-service.js';

const mainContainer = document.getElementsByClassName('container')[0];
const messagesContainer = document.getElementById('messagesWrapper');
const textarea = document.getElementsByTagName('textarea')[0];
const nameInput = document.getElementById('nameInput');
let onScrollCb = function() {};

export function setupUI(scrollCb) {
    onScrollCb = scrollCb;
    mainContainer.scrollTo(0, mainContainer.scrollHeight);
    toggleLoadingNotification(false);

    document.getElementById('sendMessage').addEventListener('click', onSendMessage);

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

function onSendMessage() {
    // TODO: get the user from the login service. indexdb should only be used to log in the user if there was an active session
    // before closing the app last time
    this.classList.toggle('loading');
    this.disabled = true;

    sendMessage(nameInput.value, textarea.value).then(
        () => {
            textarea.value = null;
            this.classList.toggle('loading');
            this.disabled = false;
        },
        () => {
            textarea.value = null;
            this.classList.toggle('loading');
            console.error('Display the message on the UI with the unsent flag!');
        }
    );
}

function onScrollTop(e) {
    const { scrollTop } = e.srcElement;

    if (scrollTop === 0) {
        toggleLoadingNotification(true);
        onScrollCb();
    }
}

const toggleLoadingNotification = (function toggleNotificationIife() {
    const spinner = document.getElementById('messages-loading');

    return function(visible = true) {
        spinner.style.display = visible ? 'block' : 'none';
    };
}());

export function updateUI(msgList, clear = false) {
    // TODO: create diff to only update differences in the messages
    if (msgList.length) {
        const messageDom = msgList.reduce((msgFragment, msg) => {
            msgFragment.appendChild(createMessageDOM(msg.author, msg.text, msg.timestamp));
            return msgFragment;
        }, new DocumentFragment());

        if (clear) {
            messagesContainer.innerHTML = null;
            messagesContainer.appendChild(messageDom);
        } else if (!messagesContainer.firstChild) {
            messagesContainer.appendChild(messageDom);
        } else {
            messagesContainer.insertBefore(messageDom, messagesContainer.firstChild);
        }
    }
    toggleLoadingNotification(false);
}

/** Utility Functions */
function createMessageDOM(author, text, timestamp) {
    const element = document.createElement('div');
    element.classList.add('msg');
    element.setAttribute('data-timestamp', timestamp);

    const dateString = getDateString(timestamp);

    element.innerHTML = `<p class="msg__text">${text}</p><p class="msg_author">${author} | ${dateString}</p><p class="msg__not-send">Not send</p>`;
    return element;
}

function getDateString(timestamp) {
    const dateObject = timestamp ? new Date(timestamp) : new Date();
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
