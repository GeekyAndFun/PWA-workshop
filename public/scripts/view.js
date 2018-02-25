const mainContainer = document.getElementsByClassName('container')[0];
const messagesContainer = document.getElementById('messagesWrapper');
const textarea = document.getElementsByTagName('textarea')[0];
const form = document.getElementById('messageForm');
const sendButton = document.getElementById('sendMessage');
const nameInput = document.getElementById('nameInput');
const spinner = document.getElementById('messages-loading');

let onScrollCb = function() {};

/** EXPORTED FUNCTIONS */
export function setupUI(scrollCb, sendMessageCb) {
    onScrollCb = scrollCb;
    mainContainer.scrollTo(0, mainContainer.scrollHeight);
    toggleLoadingSpinner(false);

    textarea.addEventListener('keypress', event => {
        if (event.keyCode === 13 && event.shiftKey) {
            onSendMessage(sendMessageCb);
        }
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
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
    toggleLoadingSpinner(false);
}

export function appendMessage(message, unsent = false) {
    messagesContainer.appendChild(createMessageDOM(message.author, message.text, message.timestamp, unsent));
}

export function cleanUnsentMessages() {
    const unsentMessages = messagesContainer.querySelectorAll('.msg.msg--not-sent');

    unsentMessages.forEach(unsentMsg => {
        messagesContainer.removeChild(unsentMsg);
    });
}

/** HELPER FUNCTIONS */
function onSendMessage(sendMessageCb) {
    sendButton.classList.toggle('loading');
    sendButton.disabled = true;

    sendMessageCb(nameInput.value, textarea.value).then(
        () => {
            textarea.value = null;
            sendButton.disabled = false;
            sendButton.classList.toggle('loading');
        },
        () => {
            textarea.value = null;
            sendButton.disabled = false;
            sendButton.classList.toggle('loading');
        }
    );
}

function onScrollTop(e) {
    const { scrollTop } = e.srcElement;

    if (scrollTop === 0) {
        toggleLoadingSpinner(true);
        onScrollCb();
    }
}

function toggleLoadingSpinner(visible = true) {
    spinner.style.display = visible ? 'block' : 'none';
}

/** Utility Functions */
function createMessageDOM(author, text, timestamp, unsent = false) {
    const element = document.createElement('div');
    element.classList.add('msg');
    if (unsent) {
        element.classList.add('msg--not-sent');
    }
    element.setAttribute('data-timestamp', timestamp);

    const dateString = window.getDateString(new Date(timestamp));

    element.innerHTML = `<p class="msg__text">${text}</p><p class="msg_author">${author} | ${dateString}</p><p class="msg__not-sent">Not send</p>`;
    return element;
}
