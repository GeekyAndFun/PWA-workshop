const mainContainer = document.getElementsByClassName('container')[0];
const messagesContainer = document.getElementById('messagesWrapper');
const textarea = document.getElementsByTagName('textarea')[0];
const form = document.getElementById('messageForm');
const footer = document.getElementsByTagName('footer')[0];
const sendButton = document.getElementById('sendMessage');
const nameInput = document.getElementById('nameInput');
const spinner = document.getElementById('messages-loading');

let onScrollCb = function () {};

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
        afterMessageSend,
        afterMessageSend
    );
    updateGeekScore(textarea.value);

    function afterMessageSend() {
        textarea.value = null;
        footer.style.height = '50px';
        sendButton.disabled = false;
        sendButton.classList.toggle('loading');
    }
}

function onScrollTop(e) {
    if (e.target.scrollTop === 0) {
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

/** Geek Score */
function updateGeekScore(text) {
    const geekPointsEl = document.getElementById('geekPoints');
    const ranks = document.getElementsByClassName('rank');

    const keywords = {
        jquery: -10,
        angular: 20,
        react: 55,
        pwa: 111,
        progressive: 50,
        web: 50,
        app: 50
    };

    let score = Number(geekPointsEl.innerHTML);
    Object.keys(keywords).forEach(key => {
        if (text.indexOf(key) !== -1) {
            score += keywords[key];
        }
    });

    geekPointsEl.innerHTML = score;
    for (let i = 0; i < ranks.length; i++) {
        ranks[i].classList.remove('rank--is-current');
    }

    if (score >= 2000) {
        ranks[0].classList.add('rank--is-current');
    } else if (score >= 1000) {
        ranks[1].classList.add('rank--is-current');
    } else if (score >= 0) {
        ranks[2].classList.add('rank--is-current');
    }
}