const mainContainer = document.getElementsByClassName('container')[0];
const messagesContainer = document.getElementById('messagesWrapper');
const textarea = document.getElementsByTagName('textarea')[0];
const sendButton = document.getElementById('sendMessage');
const nameInput = document.getElementById('nameInput');

let onScrollCb = function() {};

/** EXPORTED FUNCTIONS */
export function setupUI(scrollCb, sendMessageCb) {
    onScrollCb = scrollCb;
    mainContainer.scrollTo(0, mainContainer.scrollHeight);
    toggleLoadingNotification(false);

    sendButton.addEventListener('click', () => {
        onSendMessage(sendMessageCb);
    });

    mainContainer.addEventListener('scroll', window.lazyDebounce(onScrollTop, 250));
}

export function updateUI(msgList, clear = false) {
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

export function appendMessage(message) {
    messagesContainer.appendChild(createMessageDOM(message.author, message.text, message.timestamp));
}

/** HELPER FUNCTIONS */
function onSendMessage(sendMessageCb) {
    sendButton.classList.toggle('loading');
    sendButton.disabled = true;

    sendMessageCb(nameInput.value, textarea.value).then(
        () => {
            textarea.value = null;
            sendButton.classList.toggle('loading');
            sendButton.disabled = false;
        },
        () => {
            textarea.value = null;
            sendButton.classList.toggle('loading');
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
