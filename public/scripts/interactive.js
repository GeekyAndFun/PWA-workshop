/** The logic that makes the website interactive, even without Data */

const DEFAULT_FOOTER_HEIGHT = '50px';
const MAX_FOOTER_HEIGHT = 150;
const ONBOARDING_DELAY = 3000;

const footer = document.getElementsByTagName('footer')[0];
const form = document.getElementById('messageForm');
const textarea = document.getElementsByTagName('textarea')[0];
const offlineIcon = document.getElementById('offlineIcon');
const nameInput = document.getElementById('nameInput');

let overlay = document.getElementById('overlay');

document.getElementById('headerIconContainer').addEventListener('click', () => {
    document.body.classList.toggle('menu--visible');
    if (overlay) {
        window.localStorage.setItem('onboarding', 'true');
        overlay.remove();
        overlay = null;
    }
});

textarea.addEventListener('input', function onTextareaInput() {
    if (this.value === '') {
        footer.style.height = DEFAULT_FOOTER_HEIGHT;
    } else if (this.scrollHeight < MAX_FOOTER_HEIGHT) {
        footer.style.height = `${this.scrollHeight}px`;
    }
});

if (!window.localStorage.getItem('onboarding')) {
    setTimeout(() => {
        overlay.style.display = 'block';
    }, ONBOARDING_DELAY);
}
if (!navigator.onLine) {
    offlineIcon.style.display = 'block';
}

window.addEventListener('offline', () => {
    offlineIcon.style.display = 'block';
});

window.addEventListener('online', () => {
    offlineIcon.style.display = 'none';
});

/** IndexedDB | Author */
const indexedDbStoreConfigs = Object.keys(AppConfig.dbConfigs).map(key => AppConfig.dbConfigs[key]);

IndexedDb.setupDbStores(AppConfig.dbName, AppConfig.dbVersion, indexedDbStoreConfigs).then(() => {
    IndexedDb.readRecords(AppConfig.dbConfigs.userConfig.name, 'currentAuthor')
        .then(author => author || 'John Doe')
        .then(author => {
            nameInput.value = author;
        });

    nameInput.addEventListener(
        'input',
        window.lazyDebounce(function() {
            IndexedDb.updateRecord(AppConfig.dbConfigs.userConfig.name, nameInput.value, 'currentAuthor');
        }, 500)
    );
});
